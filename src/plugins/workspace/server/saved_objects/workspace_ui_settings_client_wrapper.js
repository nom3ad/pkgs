"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkspaceUiSettingsClientWrapper = void 0;
var _utils = require("../../../../core/server/utils");
var _server = require("../../../../core/server");
var _constants = require("../../common/constants");
var _common = require("../../../data_source_management/common");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * This saved object client wrapper offers methods to get and update UI settings considering
 * the context of the current workspace.
 */
class WorkspaceUiSettingsClientWrapper {
  constructor(logger) {
    this.logger = logger;
    _defineProperty(this, "getScopedClient", void 0);
    _defineProperty(this, "wrapperFactory", wrapperOptions => {
      const getUiSettingsWithWorkspace = async (type, id, options = {}) => {
        const {
          requestWorkspaceId
        } = (0, _utils.getWorkspaceState)(wrapperOptions.request);

        /**
         * When getting ui settings within a workspace, it will combine the workspace ui settings with
         * the global ui settings and workspace ui settings have higher priority if the same setting
         * was defined in both places
         */
        if (type === 'config' && requestWorkspaceId) {
          var _workspaceObject;
          const configObject = await wrapperOptions.client.get('config', id, options);
          let workspaceObject = null;
          try {
            workspaceObject = await this.getWorkspaceTypeEnabledClient(wrapperOptions.request).get(_server.WORKSPACE_TYPE, requestWorkspaceId);
          } catch (e) {
            this.logger.error(`Unable to get workspaceObject with id: ${requestWorkspaceId}`);
          }
          const workspaceLevelDefaultDS = (_workspaceObject = workspaceObject) === null || _workspaceObject === void 0 || (_workspaceObject = _workspaceObject.attributes) === null || _workspaceObject === void 0 || (_workspaceObject = _workspaceObject.uiSettings) === null || _workspaceObject === void 0 ? void 0 : _workspaceObject[_common.DEFAULT_DATA_SOURCE_UI_SETTINGS_ID];
          configObject.attributes = {
            ...configObject.attributes,
            ...(workspaceObject ? workspaceObject.attributes.uiSettings : {}),
            // Workspace level default data source value should not extend global UIsettings value.
            [_common.DEFAULT_DATA_SOURCE_UI_SETTINGS_ID]: workspaceLevelDefaultDS
          };
          return configObject;
        }
        return wrapperOptions.client.get(type, id, options);
      };
      const updateUiSettingsWithWorkspace = async (type, id, attributes, options = {}) => {
        const {
          requestWorkspaceId
        } = (0, _utils.getWorkspaceState)(wrapperOptions.request);

        /**
         * When updating ui settings within a workspace, it will update the workspace ui settings,
         * the global ui settings will remain unchanged.
         */
        if (type === 'config' && requestWorkspaceId) {
          const configObject = await wrapperOptions.client.get('config', id, options);
          const savedObjectsClient = this.getWorkspaceTypeEnabledClient(wrapperOptions.request);
          const workspaceObject = await savedObjectsClient.get(_server.WORKSPACE_TYPE, requestWorkspaceId);
          const workspaceUpdateResult = await savedObjectsClient.update(_server.WORKSPACE_TYPE, requestWorkspaceId, {
            ...workspaceObject.attributes,
            uiSettings: {
              ...workspaceObject.attributes.uiSettings,
              ...attributes
            }
          }, options);
          if (workspaceUpdateResult.attributes.uiSettings) {
            configObject.attributes = workspaceUpdateResult.attributes.uiSettings;
          }
          return configObject;
        }
        return wrapperOptions.client.update(type, id, attributes, options);
      };
      return {
        ...wrapperOptions.client,
        checkConflicts: wrapperOptions.client.checkConflicts,
        errors: wrapperOptions.client.errors,
        addToNamespaces: wrapperOptions.client.addToNamespaces,
        deleteFromNamespaces: wrapperOptions.client.deleteFromNamespaces,
        find: wrapperOptions.client.find,
        bulkGet: wrapperOptions.client.bulkGet,
        create: wrapperOptions.client.create,
        bulkCreate: wrapperOptions.client.bulkCreate,
        delete: wrapperOptions.client.delete,
        bulkUpdate: wrapperOptions.client.bulkUpdate,
        deleteByWorkspace: wrapperOptions.client.deleteByWorkspace,
        get: getUiSettingsWithWorkspace,
        update: updateUiSettingsWithWorkspace
      };
    });
  }
  /**
   * WORKSPACE_TYPE is a hidden type, regular saved object client won't return hidden types.
   * To access workspace uiSettings which is defined as a property of workspace object, the
   * WORKSPACE_TYPE needs to be excluded.
   */
  getWorkspaceTypeEnabledClient(request) {
    var _this$getScopedClient;
    return (_this$getScopedClient = this.getScopedClient) === null || _this$getScopedClient === void 0 ? void 0 : _this$getScopedClient.call(this, request, {
      includedHiddenTypes: [_server.WORKSPACE_TYPE],
      excludedWrappers: [_constants.WORKSPACE_UI_SETTINGS_CLIENT_WRAPPER_ID]
    });
  }
  setScopedClient(getScopedClient) {
    this.getScopedClient = getScopedClient;
  }
}
exports.WorkspaceUiSettingsClientWrapper = WorkspaceUiSettingsClientWrapper;