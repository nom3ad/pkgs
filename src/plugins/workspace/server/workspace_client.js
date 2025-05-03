"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkspaceClient = void 0;
var _i18n = require("@osd/i18n");
var _server = require("../../../core/server");
var _utils = require("../../../core/server/utils");
var _saved_objects = require("./saved_objects");
var _utils2 = require("./utils");
var _constants = require("../common/constants");
var _common = require("../../data_source/common");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
const WORKSPACE_ID_SIZE = 6;
const DUPLICATE_WORKSPACE_NAME_ERROR = _i18n.i18n.translate('workspace.duplicate.name.error', {
  defaultMessage: 'workspace name has already been used, try with a different name'
});
class WorkspaceClient {
  constructor(core, logger) {
    _defineProperty(this, "setupDep", void 0);
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "savedObjects", void 0);
    _defineProperty(this, "uiSettings", void 0);
    this.setupDep = core;
    this.logger = logger;
  }
  getScopedClientWithoutPermission(requestDetail) {
    var _this$savedObjects;
    return (_this$savedObjects = this.savedObjects) === null || _this$savedObjects === void 0 ? void 0 : _this$savedObjects.getScopedClient(requestDetail.request, {
      excludedWrappers: [_constants.WORKSPACE_SAVED_OBJECTS_CLIENT_WRAPPER_ID,
      /**
       * workspace object does not have workspaces field
       * so need to bypass workspace id consumer wrapper
       * for any kind of operation to saved objects client.
       */
      _constants.WORKSPACE_ID_CONSUMER_WRAPPER_ID],
      includedHiddenTypes: [_server.WORKSPACE_TYPE]
    });
  }
  getSavedObjectClientsFromRequestDetail(requestDetail) {
    var _this$savedObjects2;
    return (_this$savedObjects2 = this.savedObjects) === null || _this$savedObjects2 === void 0 ? void 0 : _this$savedObjects2.getScopedClient(requestDetail.request, {
      excludedWrappers: [_constants.WORKSPACE_ID_CONSUMER_WRAPPER_ID],
      includedHiddenTypes: [_server.WORKSPACE_TYPE]
    });
  }
  getFlattenedResultWithSavedObject(savedObject) {
    return {
      ...savedObject.attributes,
      lastUpdatedTime: savedObject.updated_at,
      id: savedObject.id,
      permissions: savedObject.permissions
    };
  }
  formatError(error) {
    return error.message || error.error || 'Error';
  }
  async setup(core) {
    this.setupDep.savedObjects.registerType(_saved_objects.workspace);
    return {
      success: true,
      result: true
    };
  }
  async create(requestDetail, payload) {
    try {
      var _this$getScopedClient;
      const {
        permissions,
        dataSources,
        ...attributes
      } = payload;
      const id = (0, _utils2.generateRandomId)(WORKSPACE_ID_SIZE);
      const client = this.getSavedObjectClientsFromRequestDetail(requestDetail);
      const existingWorkspaceRes = await ((_this$getScopedClient = this.getScopedClientWithoutPermission(requestDetail)) === null || _this$getScopedClient === void 0 ? void 0 : _this$getScopedClient.find({
        type: _server.WORKSPACE_TYPE,
        search: `"${attributes.name}"`,
        searchFields: ['name']
      }));
      if (existingWorkspaceRes && existingWorkspaceRes.total > 0) {
        throw new Error(DUPLICATE_WORKSPACE_NAME_ERROR);
      }
      if (dataSources) {
        const promises = [];
        for (const dataSourceId of dataSources) {
          promises.push(client.addToWorkspaces(_common.DATA_SOURCE_SAVED_OBJECT_TYPE, dataSourceId, [id]));
        }
        await Promise.all(promises);
      }
      const result = await client.create(_server.WORKSPACE_TYPE, attributes, {
        id,
        permissions
      });
      if (dataSources && this.uiSettings && client) {
        const rawState = (0, _utils.getWorkspaceState)(requestDetail.request);
        // This is for setting in workspace environment, otherwise uiSettings can't set workspace level value.
        (0, _utils.updateWorkspaceState)(requestDetail.request, {
          requestWorkspaceId: id
        });
        // Set first data source as default after creating workspace
        const uiSettingsClient = this.uiSettings.asScopedToClient(client);
        try {
          await (0, _utils2.checkAndSetDefaultDataSource)(uiSettingsClient, dataSources, false);
        } catch (e) {
          this.logger.error('Set default data source error');
        } finally {
          // Reset workspace state
          (0, _utils.updateWorkspaceState)(requestDetail.request, {
            requestWorkspaceId: rawState.requestWorkspaceId
          });
        }
      }
      return {
        success: true,
        result: {
          id: result.id
        }
      };
    } catch (e) {
      return {
        success: false,
        error: this.formatError(e)
      };
    }
  }
  async list(requestDetail, options) {
    try {
      const {
        saved_objects: savedObjects,
        ...others
      } = await this.getSavedObjectClientsFromRequestDetail(requestDetail).find({
        ...options,
        type: _server.WORKSPACE_TYPE,
        ACLSearchParams: {
          permissionModes: options.permissionModes
        }
      });
      return {
        success: true,
        result: {
          ...others,
          workspaces: savedObjects.map(item => this.getFlattenedResultWithSavedObject(item))
        }
      };
    } catch (e) {
      return {
        success: false,
        error: this.formatError(e)
      };
    }
  }
  async get(requestDetail, id) {
    try {
      const result = await this.getSavedObjectClientsFromRequestDetail(requestDetail).get(_server.WORKSPACE_TYPE, id);
      return {
        success: true,
        result: this.getFlattenedResultWithSavedObject(result)
      };
    } catch (e) {
      return {
        success: false,
        error: this.formatError(e)
      };
    }
  }
  async update(requestDetail, id, payload) {
    const {
      permissions,
      dataSources: newDataSources,
      ...attributes
    } = payload;
    try {
      const client = this.getSavedObjectClientsFromRequestDetail(requestDetail);
      let workspaceInDB = await client.get(_server.WORKSPACE_TYPE, id);
      if (workspaceInDB.attributes.name !== attributes.name) {
        var _this$getScopedClient2;
        const existingWorkspaceRes = await ((_this$getScopedClient2 = this.getScopedClientWithoutPermission(requestDetail)) === null || _this$getScopedClient2 === void 0 ? void 0 : _this$getScopedClient2.find({
          type: _server.WORKSPACE_TYPE,
          search: `"${attributes.name}"`,
          searchFields: ['name'],
          fields: ['_id']
        }));
        if (existingWorkspaceRes && existingWorkspaceRes.total > 0) {
          throw new Error(DUPLICATE_WORKSPACE_NAME_ERROR);
        }
      }
      if (newDataSources) {
        const originalSelectedDataSources = await (0, _utils2.getDataSourcesList)(client, [id]);
        const originalSelectedDataSourceIds = originalSelectedDataSources.map(ds => ds.id);
        const dataSourcesToBeRemoved = originalSelectedDataSourceIds.filter(ds => !newDataSources.find(item => item === ds));
        const dataSourcesToBeAdded = newDataSources.filter(ds => !originalSelectedDataSourceIds.find(item => item === ds));
        const promises = [];
        if (dataSourcesToBeRemoved.length > 0) {
          for (const dataSourceId of dataSourcesToBeRemoved) {
            promises.push(client.deleteFromWorkspaces(_common.DATA_SOURCE_SAVED_OBJECT_TYPE, dataSourceId, [id]));
          }
        }
        if (dataSourcesToBeAdded.length > 0) {
          for (const dataSourceId of dataSourcesToBeAdded) {
            promises.push(client.addToWorkspaces(_common.DATA_SOURCE_SAVED_OBJECT_TYPE, dataSourceId, [id]));
          }
        }
        if (promises.length > 0) {
          await Promise.all(promises);
        }
      }

      /**
       * When the workspace owner unassign themselves, ensure the default data source is set before
       * updating the workspace permissions. This prevents a lack of write permission on saved objects
       * after the user is removed from the workspace.
       **/
      if (newDataSources && this.uiSettings && client) {
        const uiSettingsClient = this.uiSettings.asScopedToClient(client);
        try {
          await (0, _utils2.checkAndSetDefaultDataSource)(uiSettingsClient, newDataSources, true);
          // Doc version may changed after default data source updated.
          workspaceInDB = await client.get(_server.WORKSPACE_TYPE, id);
        } catch (error) {
          this.logger.error('Set default data source error during workspace updating');
        }
      }
      await client.create(_server.WORKSPACE_TYPE, {
        ...workspaceInDB.attributes,
        ...attributes
      }, {
        id,
        permissions,
        overwrite: true,
        version: workspaceInDB.version
      });
      return {
        success: true,
        result: true
      };
    } catch (e) {
      return {
        success: false,
        error: this.formatError(e)
      };
    }
  }
  async delete(requestDetail, id) {
    try {
      const savedObjectClient = this.getSavedObjectClientsFromRequestDetail(requestDetail);
      const workspaceInDB = await savedObjectClient.get(_server.WORKSPACE_TYPE, id);
      if (workspaceInDB.attributes.reserved) {
        return {
          success: false,
          error: _i18n.i18n.translate('workspace.deleteReservedWorkspace.errorMessage', {
            defaultMessage: 'Reserved workspace {id} is not allowed to delete.',
            values: {
              id: workspaceInDB.id
            }
          })
        };
      }

      // When workspace is to be deleted, unassign all assigned data source before deleting saved object by workspace.
      const selectedDataSources = await (0, _utils2.getDataSourcesList)(savedObjectClient, [id]);
      if (selectedDataSources.length > 0) {
        const promises = [];
        for (const dataSource of selectedDataSources) {
          promises.push(savedObjectClient.deleteFromWorkspaces(_common.DATA_SOURCE_SAVED_OBJECT_TYPE, dataSource.id, [id]));
        }
        await Promise.all(promises);
      }
      await savedObjectClient.deleteByWorkspace(id);
      // delete workspace itself at last, deleteByWorkspace depends on the workspace to do permission check
      await savedObjectClient.delete(_server.WORKSPACE_TYPE, id);
      return {
        success: true,
        result: true
      };
    } catch (e) {
      return {
        success: false,
        error: this.formatError(e)
      };
    }
  }
  setSavedObjects(savedObjects) {
    this.savedObjects = savedObjects;
  }
  setUiSettings(uiSettings) {
    this.uiSettings = uiSettings;
  }
  async destroy() {
    return {
      success: true,
      result: true
    };
  }
}
exports.WorkspaceClient = WorkspaceClient;