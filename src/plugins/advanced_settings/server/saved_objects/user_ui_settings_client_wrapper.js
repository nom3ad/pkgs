"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserUISettingsClientWrapper = void 0;
var _server = require("../../../../core/server");
var _utils = require("../utils");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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