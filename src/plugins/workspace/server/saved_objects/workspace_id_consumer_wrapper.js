"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkspaceIdConsumerWrapper = void 0;
var _i18n = require("@osd/i18n");
var _utils = require("../../../../core/server/utils");
var _server = require("../../../../core/server");
var _utils2 = require("../../common/utils");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
const UI_SETTINGS_SAVED_OBJECTS_TYPE = 'config';
const generateSavedObjectsForbiddenError = () => _server.SavedObjectsErrorHelpers.decorateForbiddenError(new Error(_i18n.i18n.translate('workspace.id_consumer.saved_objects.forbidden', {
  defaultMessage: 'Saved object does not belong to the workspace'
})));
class WorkspaceIdConsumerWrapper {
  formatWorkspaceIdParams(request, options) {
    const {
      workspaces,
      ...others
    } = options || {};
    const workspaceState = (0, _utils.getWorkspaceState)(request);
    const workspaceIdParsedFromRequest = workspaceState === null || workspaceState === void 0 ? void 0 : workspaceState.requestWorkspaceId;
    const workspaceIdsInUserOptions = options === null || options === void 0 ? void 0 : options.workspaces;
    let finalWorkspaces = [];
    if (options !== null && options !== void 0 && options.hasOwnProperty('workspaces')) {
      // In order to get all data sources in workspace, use * to skip appending workspace id automatically
      finalWorkspaces = (workspaceIdsInUserOptions || []).filter(id => id !== '*');
    } else if (workspaceIdParsedFromRequest) {
      finalWorkspaces = [workspaceIdParsedFromRequest];
    }
    return {
      ...others,
      ...(finalWorkspaces.length ? {
        workspaces: finalWorkspaces
      } : {})
    };
  }
  isConfigType(type) {
    return type === UI_SETTINGS_SAVED_OBJECTS_TYPE;
  }
  async checkWorkspacesExist(workspaces, wrapperOptions) {
    if (workspaces !== null && workspaces !== void 0 && workspaces.length) {
      let invalidWorkspaces = [];
      // If only has one workspace, we should use get to optimize performance
      if (workspaces.length === 1) {
        const workspaceGet = await this.workspaceClient.get({
          request: wrapperOptions.request
        }, workspaces[0]);
        if (!workspaceGet.success) {
          invalidWorkspaces = [workspaces[0]];
        }
      } else {
        const workspaceList = await this.workspaceClient.list({
          request: wrapperOptions.request
        }, {
          perPage: 9999
        });
        if (workspaceList.success) {
          const workspaceIdsSet = new Set(workspaceList.result.workspaces.map(workspace => workspace.id));
          invalidWorkspaces = workspaces.filter(targetWorkspace => !workspaceIdsSet.has(targetWorkspace));
        }
      }
      if (invalidWorkspaces.length > 0) {
        throw _server.SavedObjectsErrorHelpers.decorateBadRequestError(new Error(_i18n.i18n.translate('workspace.id_consumer.invalid', {
          defaultMessage: 'Exist invalid workspaces'
        })));
      }
    }
  }
  validateObjectInAWorkspace(object, workspace, request) {
    // Keep the original object error
    if (!!(object !== null && object !== void 0 && object.error)) {
      return true;
    }
    // Data source is a workspace level object, validate if the request has access to the data source within the requested workspace.
    if ((0, _utils2.validateIsWorkspaceDataSourceAndConnectionObjectType)(object.type)) {
      if (!!(0, _utils.getWorkspaceState)(request).isDataSourceAdmin) {
        return true;
      }
      // Deny access if the object is a global data source (no workspaces assigned)
      if (!object.workspaces || object.workspaces.length === 0) {
        return false;
      }
    }
    /*
     * Allow access if the requested workspace matches one of the object's assigned workspaces
     * This ensures that the user can only access data sources within their current workspace
     */
    if (object.workspaces && object.workspaces.length > 0) {
      return object.workspaces.includes(workspace);
    }
    // Allow access if the object is a global object (object.workspaces is null/[])
    return true;
  }
  constructor(workspaceClient) {
    this.workspaceClient = workspaceClient;
    _defineProperty(this, "wrapperFactory", wrapperOptions => {
      return {
        ...wrapperOptions.client,
        create: async (type, attributes, options = {}) => {
          const finalOptions = this.isConfigType(type) ? options : this.formatWorkspaceIdParams(wrapperOptions.request, options);
          await this.checkWorkspacesExist(finalOptions === null || finalOptions === void 0 ? void 0 : finalOptions.workspaces, wrapperOptions);
          return wrapperOptions.client.create(type, attributes, finalOptions);
        },
        bulkCreate: async (objects, options = {}) => {
          const finalOptions = this.formatWorkspaceIdParams(wrapperOptions.request, options);
          await this.checkWorkspacesExist(finalOptions === null || finalOptions === void 0 ? void 0 : finalOptions.workspaces, wrapperOptions);
          return wrapperOptions.client.bulkCreate(objects, finalOptions);
        },
        checkConflicts: (objects = [], options = {}) => wrapperOptions.client.checkConflicts(objects, this.formatWorkspaceIdParams(wrapperOptions.request, options)),
        delete: wrapperOptions.client.delete,
        find: async options => {
          // Based on https://github.com/opensearch-project/OpenSearch-Dashboards/blob/main/src/core/server/ui_settings/create_or_upgrade_saved_config/get_upgradeable_config.ts#L49
          // we need to make sure the find call for upgrade config should be able to find all the global configs as it was before.
          // It is a workaround for 2.17, should be optimized in the upcoming 2.18 release.
          const finalOptions = this.isConfigType(options.type) && options.sortField === 'buildNum' ? options : this.formatWorkspaceIdParams(wrapperOptions.request, options);
          await this.checkWorkspacesExist(finalOptions === null || finalOptions === void 0 ? void 0 : finalOptions.workspaces, wrapperOptions);
          return wrapperOptions.client.find(finalOptions);
        },
        bulkGet: async (objects = [], options = {}) => {
          const {
            workspaces
          } = this.formatWorkspaceIdParams(wrapperOptions.request, options);
          if (!!workspaces && workspaces.length > 1) {
            // Version 2.18 does not support the passing of multiple workspaces.
            throw _server.SavedObjectsErrorHelpers.createBadRequestError('Multiple workspace parameters');
          }
          const objectToBulkGet = await wrapperOptions.client.bulkGet(objects, options);
          if ((workspaces === null || workspaces === void 0 ? void 0 : workspaces.length) === 1) {
            return {
              ...objectToBulkGet,
              saved_objects: objectToBulkGet.saved_objects.map(object => {
                return this.validateObjectInAWorkspace(object, workspaces[0], wrapperOptions.request) ? object : {
                  id: object.id,
                  type: object.type,
                  attributes: {},
                  references: [],
                  error: {
                    ...generateSavedObjectsForbiddenError().output.payload
                  }
                };
              })
            };
          }
          return objectToBulkGet;
        },
        get: async (type, id, options = {}) => {
          const {
            workspaces
          } = this.formatWorkspaceIdParams(wrapperOptions.request, options);
          if (!!workspaces && workspaces.length > 1) {
            // Version 2.18 does not support the passing of multiple workspaces.
            throw _server.SavedObjectsErrorHelpers.createBadRequestError('Multiple workspace parameters');
          }
          const objectToGet = await wrapperOptions.client.get(type, id, options);
          if ((workspaces === null || workspaces === void 0 ? void 0 : workspaces.length) === 1 && !this.validateObjectInAWorkspace(objectToGet, workspaces[0], wrapperOptions.request)) {
            throw generateSavedObjectsForbiddenError();
          }

          // Allow access if no specific workspace is requested.
          return objectToGet;
        },
        update: wrapperOptions.client.update,
        bulkUpdate: wrapperOptions.client.bulkUpdate,
        addToNamespaces: wrapperOptions.client.addToNamespaces,
        deleteFromNamespaces: wrapperOptions.client.deleteFromNamespaces,
        deleteByWorkspace: wrapperOptions.client.deleteByWorkspace
      };
    });
  }
}
exports.WorkspaceIdConsumerWrapper = WorkspaceIdConsumerWrapper;