"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserUISettingsClientWrapper = void 0;
var _server = require("../../../../core/server");
var _utils = require("../utils");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * This saved object client wrapper offers methods to get and update UI settings considering
 * the context of the current user
 */
class UserUISettingsClientWrapper {
  constructor(logger, savedObjectsPermissionEnabled) {
    this.logger = logger;
    this.savedObjectsPermissionEnabled = savedObjectsPermissionEnabled;
    _defineProperty(this, "core", void 0);
    _defineProperty(this, "wrapperFactory", wrapperOptions => {
      const getUiSettings = async (type, id, options = {}) => {
        if (type === 'config') {
          const docId = this.normalizeDocId(id, wrapperOptions.request, this.core);
          return wrapperOptions.client.get(type, docId, options);
        }
        return wrapperOptions.client.get(type, id, options);
      };
      const updateUiSettings = async (type, id, attributes, options = {}) => {
        if (type === 'config') {
          const docId = this.normalizeDocId(id, wrapperOptions.request, this.core);
          // update user level settings
          return await wrapperOptions.client.update(type, docId, attributes, options);
        }
        return wrapperOptions.client.update(type, id, attributes, options);
      };
      const createUiSettings = async (type, attributes, options) => {
        const userName = (0, _utils.extractUserName)(wrapperOptions.request, this.core);
        const {
          id
        } = options || {};
        const userLevel = this.isUserLevelSetting(id);
        if (type === 'config' && id) {
          const docId = this.normalizeDocId(id, wrapperOptions.request, this.core);
          if (userLevel && userName) {
            const permissions = {
              permissions: new _server.ACL().addPermission(['write'], {
                users: [userName]
              }).getPermissions()
            };

            // remove buildNum from attributes
            const {
              buildNum,
              ...others
            } = attributes;
            return await wrapperOptions.client.create(type, others, {
              ...options,
              id: docId,
              ...(this.savedObjectsPermissionEnabled ? permissions : {})
            });
          } else {
            return wrapperOptions.client.create(type, attributes, {
              ...options,
              id: docId
            });
          }
        }
        return wrapperOptions.client.create(type, attributes, options);
      };
      return {
        ...wrapperOptions.client,
        checkConflicts: wrapperOptions.client.checkConflicts,
        errors: wrapperOptions.client.errors,
        addToNamespaces: wrapperOptions.client.addToNamespaces,
        deleteFromNamespaces: wrapperOptions.client.deleteFromNamespaces,
        find: wrapperOptions.client.find,
        bulkGet: wrapperOptions.client.bulkGet,
        create: createUiSettings,
        bulkCreate: wrapperOptions.client.bulkCreate,
        delete: wrapperOptions.client.delete,
        bulkUpdate: wrapperOptions.client.bulkUpdate,
        deleteByWorkspace: wrapperOptions.client.deleteByWorkspace,
        get: getUiSettings,
        update: updateUiSettings
      };
    });
  }
  setCore(core) {
    this.core = core;
  }
  isUserLevelSetting(id) {
    return id ? id.startsWith(_server.CURRENT_USER_PLACEHOLDER) : false;
  }
  normalizeDocId(id, request, core) {
    const userName = (0, _utils.extractUserName)(request, core);
    if (this.isUserLevelSetting(id)) {
      if (userName) {
        // return id.replace(CURRENT_USER, userName); // uncomment this to support version for user personal setting
        return userName;
      } else {
        // security is not enabled, using global setting id
        return id.replace(`${_server.CURRENT_USER_PLACEHOLDER}_`, '');
      }
    }
    return id;
  }
}
exports.UserUISettingsClientWrapper = UserUISettingsClientWrapper;