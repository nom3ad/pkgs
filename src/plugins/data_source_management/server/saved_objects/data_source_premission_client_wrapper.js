"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataSourcePermissionClientWrapper = void 0;
var _i18n = require("@osd/i18n");
var _server = require("../../../../core/server");
var _utils = require("../../../../core/server/utils");
var _common = require("../../../data_source/common");
var _common2 = require("../../common");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Determine whether the user has the permissions to create, delete, and update data source based on manageableBy/dataSourceAdmin.
 * DataSourceAdmin user has all permissions.
 * If manageableBy is all, any user has permissions.
 * If manageableBy is none, any user has no permissions.
 * If manageableBy is dashboard_admin, only OSD admin has permissions.
 */
class DataSourcePermissionClientWrapper {
  constructor(manageableBy) {
    this.manageableBy = manageableBy;
    _defineProperty(this, "wrapperFactory", wrapperOptions => {
      const {
        isDashboardAdmin,
        isDataSourceAdmin
      } = (0, _utils.getWorkspaceState)(wrapperOptions.request) || {};
      // If isDashboardAdmin is undefined / true, the user will be dashboard admin
      const isDashboardAdminRequest = isDashboardAdmin !== false;
      if (isDataSourceAdmin || this.manageableBy === _common2.ManageableBy.All || this.manageableBy === _common2.ManageableBy.DashboardAdmin && isDashboardAdminRequest) {
        return wrapperOptions.client;
      }
      const createWithManageableBy = async (type, attributes, options) => {
        if (_common.DATA_SOURCE_SAVED_OBJECT_TYPE === type) {
          throw this.generatePermissionError();
        }
        return await wrapperOptions.client.create(type, attributes, options);
      };
      const bulkCreateWithManageableBy = async (objects, options) => {
        const disallowedSavedObjects = [];
        const allowedSavedObjects = [];
        objects.forEach(item => {
          if (_common.DATA_SOURCE_SAVED_OBJECT_TYPE === item.type) {
            disallowedSavedObjects.push(item);
          } else {
            allowedSavedObjects.push(item);
          }
        });
        const bulkCreateResult = await wrapperOptions.client.bulkCreate(allowedSavedObjects, options);

        // Merge the data source saved objects and real client bulkCreate result.
        return {
          saved_objects: [...((bulkCreateResult === null || bulkCreateResult === void 0 ? void 0 : bulkCreateResult.saved_objects) || []), ...disallowedSavedObjects.map(item => ({
            ...item,
            error: {
              ...this.generatePermissionError().output.payload,
              metadata: {
                isNotOverwritable: true
              }
            }
          }))]
        };
      };
      const updateWithManageableBy = async (type, id, attributes, options = {}) => {
        if (_common.DATA_SOURCE_SAVED_OBJECT_TYPE === type) {
          throw this.generatePermissionError();
        }
        return await wrapperOptions.client.update(type, id, attributes, options);
      };
      const bulkUpdateWithManageableBy = async (objects, options) => {
        const disallowedSavedObjects = [];
        const allowedSavedObjects = [];
        objects.forEach(item => {
          if (_common.DATA_SOURCE_SAVED_OBJECT_TYPE === item.type) {
            disallowedSavedObjects.push(item);
          } else {
            allowedSavedObjects.push(item);
          }
        });
        const bulkUpdateResult = await wrapperOptions.client.bulkUpdate(allowedSavedObjects, options);

        // Merge the data source saved objects and real client bulkUpdate result.
        return {
          saved_objects: [...((bulkUpdateResult === null || bulkUpdateResult === void 0 ? void 0 : bulkUpdateResult.saved_objects) || []), ...disallowedSavedObjects.map(item => ({
            ...item,
            error: {
              ...this.generatePermissionError().output.payload,
              metadata: {
                isNotOverwritable: true
              }
            }
          }))]
        };
      };
      const deleteWithManageableBy = async (type, id, options = {}) => {
        if (_common.DATA_SOURCE_SAVED_OBJECT_TYPE === type) {
          throw this.generatePermissionError();
        }
        return await wrapperOptions.client.delete(type, id, options);
      };
      return {
        ...wrapperOptions.client,
        create: createWithManageableBy,
        bulkCreate: bulkCreateWithManageableBy,
        delete: deleteWithManageableBy,
        update: updateWithManageableBy,
        bulkUpdate: bulkUpdateWithManageableBy,
        get: wrapperOptions.client.get,
        checkConflicts: wrapperOptions.client.checkConflicts,
        errors: wrapperOptions.client.errors,
        addToNamespaces: wrapperOptions.client.addToNamespaces,
        deleteFromNamespaces: wrapperOptions.client.deleteFromNamespaces,
        find: wrapperOptions.client.find,
        bulkGet: wrapperOptions.client.bulkGet,
        deleteByWorkspace: wrapperOptions.client.deleteByWorkspace
      };
    });
    _defineProperty(this, "generatePermissionError", () => _server.SavedObjectsErrorHelpers.decorateForbiddenError(new Error(_i18n.i18n.translate('dashboard.admin.permission.invalidate', {
      defaultMessage: 'You have no permission to perform this operation'
    }))));
  }
}
exports.DataSourcePermissionClientWrapper = DataSourcePermissionClientWrapper;