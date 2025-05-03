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
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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
    _defineProperty(this, "generatePermissionError", () => _server.SavedObjectsErrorHelpers.decorateForbiddenError(new Error(_i18n.i18n.translate('dataSourcesManagement.admin.permission.invalid', {
      defaultMessage: 'You have no permission to perform this operation'
    }))));
  }
}
exports.DataSourcePermissionClientWrapper = DataSourcePermissionClientWrapper;