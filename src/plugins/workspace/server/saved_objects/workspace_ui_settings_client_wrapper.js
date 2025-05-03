"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkspaceUiSettingsClientWrapper = void 0;
var _utils = require("../../../../core/server/utils");
var _server = require("../../../../core/server");
var _constants = require("../../common/constants");
var _common = require("../../../data_source_management/common");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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
          var _workspaceObject, _workspaceObject2;
          const configObject = await wrapperOptions.client.get('config', id, options);
          let workspaceObject = null;
          try {
            workspaceObject = await this.getWorkspaceTypeEnabledClient(wrapperOptions.request).get(_server.WORKSPACE_TYPE, requestWorkspaceId);
          } catch (e) {
            this.logger.error(`Unable to get workspaceObject with id: ${requestWorkspaceId}`);
          }
          const workspaceLevelDefaultDS = (_workspaceObject = workspaceObject) === null || _workspaceObject === void 0 || (_workspaceObject = _workspaceObject.attributes) === null || _workspaceObject === void 0 || (_workspaceObject = _workspaceObject.uiSettings) === null || _workspaceObject === void 0 ? void 0 : _workspaceObject[_common.DEFAULT_DATA_SOURCE_UI_SETTINGS_ID];
          const workspaceLevelDefaultIndex = (_workspaceObject2 = workspaceObject) === null || _workspaceObject2 === void 0 || (_workspaceObject2 = _workspaceObject2.attributes) === null || _workspaceObject2 === void 0 || (_workspaceObject2 = _workspaceObject2.uiSettings) === null || _workspaceObject2 === void 0 ? void 0 : _workspaceObject2[_common.DEFAULT_INDEX_PATTERN_UI_SETTINGS_ID];
          configObject.attributes = {
            ...configObject.attributes,
            ...(workspaceObject ? workspaceObject.attributes.uiSettings : {}),
            // Workspace level default data source value should not extend global UIsettings value.
            [_common.DEFAULT_DATA_SOURCE_UI_SETTINGS_ID]: workspaceLevelDefaultDS,
            // Workspace level default index pattern value should not extend global UIsettings value.
            [_common.DEFAULT_INDEX_PATTERN_UI_SETTINGS_ID]: workspaceLevelDefaultIndex
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
         * Skip updating workspace level setting if the request is updating user level setting specifically.
         */
        if (type === 'config' && requestWorkspaceId && !id.startsWith(_server.CURRENT_USER_PLACEHOLDER)) {
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