"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkspaceSavedObjectsClientWrapper = void 0;
var _i18n = require("@osd/i18n");
var _utils = require("../../../../core/server/utils");
var _server = require("../../../../core/server");
var _constants = require("../../common/constants");
var _common = require("../../../data_source/common");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
// Can't throw unauthorized for now, the page will be refreshed if unauthorized
const generateWorkspacePermissionError = () => _server.SavedObjectsErrorHelpers.decorateForbiddenError(new Error(_i18n.i18n.translate('workspace.permission.invalidate', {
  defaultMessage: 'Invalid workspace permission'
})));
const generateSavedObjectsPermissionError = () => _server.SavedObjectsErrorHelpers.decorateForbiddenError(new Error(_i18n.i18n.translate('saved_objects.permission.invalidate', {
  defaultMessage: 'Invalid saved objects permission'
})));
const generateDataSourcePermissionError = () => _server.SavedObjectsErrorHelpers.decorateForbiddenError(new Error(_i18n.i18n.translate('saved_objects.data_source.invalidate', {
  defaultMessage: 'Invalid data source permission, please associate it to current workspace'
})));
const generateOSDAdminPermissionError = () => _server.SavedObjectsErrorHelpers.decorateForbiddenError(new Error(_i18n.i18n.translate('dashboard.admin.permission.invalidate', {
  defaultMessage: 'Invalid permission, please contact OSD admin'
})));
const getWorkspacesFromSavedObjects = savedObjects => {
  return savedObjects.reduce((previous, {
    workspaces
  }) => Array.from(new Set([...previous, ...(workspaces !== null && workspaces !== void 0 ? workspaces : [])])), []).map(id => ({
    type: _server.WORKSPACE_TYPE,
    id
  }));
};
const getDefaultValuesForEmpty = (values, defaultValues) => {
  return !values || values.length === 0 ? defaultValues : values;
};
class WorkspaceSavedObjectsClientWrapper {
  async validateObjectsPermissions(objects, request, permissionModes) {
    // PermissionModes here is an array which is merged by workspace type required permission and other saved object required permission.
    // So we only need to do one permission check no matter its type.
    for (const {
      id,
      type
    } of objects) {
      const validateResult = await this.permissionControl.validate(request, {
        type,
        id
      }, permissionModes);
      if (!(validateResult !== null && validateResult !== void 0 && validateResult.result)) {
        return false;
      }
    }
    return true;
  }

  // validate if the `request` has the specified permission(`permissionMode`) to the given `workspaceIds`

  async validateWorkspacesAndSavedObjectsPermissions(savedObject, request, workspacePermissionModes, objectPermissionModes, validateAllWorkspaces = true) {
    /**
     *
     * Checks if the provided saved object lacks both workspaces and permissions.
     * If a saved object lacks both attributes, it implies that the object is neither associated
     * with any workspaces nor has permissions defined by itself. Such objects are considered "public"
     * and will be excluded from permission checks.
     *
     **/
    if (!savedObject.workspaces && !savedObject.permissions) {
      return true;
    }
    let hasPermission = false;
    // Check permission based on object's workspaces.
    // If workspacePermissionModes is passed with an empty array, we need to skip this validation and continue to validate object ACL.
    if (savedObject.workspaces && workspacePermissionModes.length > 0) {
      const workspacePermissionValidator = validateAllWorkspaces ? this.validateMultiWorkspacesPermissions : this.validateAtLeastOnePermittedWorkspaces;
      hasPermission = await workspacePermissionValidator(savedObject.workspaces, request, workspacePermissionModes);
    }
    // If already has permissions based on workspaces, we don't need to check object's ACL(defined by permissions attribute)
    // So return true immediately
    if (hasPermission) {
      return true;
    }
    // Check permission based on object's ACL(defined by permissions attribute)
    if (savedObject.permissions) {
      hasPermission = await this.permissionControl.validateSavedObjectsACL([savedObject], this.permissionControl.getPrincipalsFromRequest(request), objectPermissionModes);
    }
    return hasPermission;
  }

  // Data source is a workspace level object, validate if the request has access to the data source within the requested workspace.

  getWorkspaceTypeEnabledClient(request) {
    var _this$getScopedClient;
    return (_this$getScopedClient = this.getScopedClient) === null || _this$getScopedClient === void 0 ? void 0 : _this$getScopedClient.call(this, request, {
      includedHiddenTypes: [_server.WORKSPACE_TYPE],
      excludedWrappers: [_constants.WORKSPACE_SAVED_OBJECTS_CLIENT_WRAPPER_ID]
    });
  }
  setScopedClient(getScopedClient) {
    this.getScopedClient = getScopedClient;
  }
  constructor(permissionControl) {
    this.permissionControl = permissionControl;
    _defineProperty(this, "getScopedClient", void 0);
    _defineProperty(this, "validateMultiWorkspacesPermissions", async (workspacesIds, request, permissionModes) => {
      // for attributes and options passed in this function, the num of workspaces may be 0.This case should not be passed permission check.
      if (workspacesIds.length === 0) {
        return false;
      }
      const workspaces = workspacesIds.map(id => ({
        id,
        type: _server.WORKSPACE_TYPE
      }));
      return await this.validateObjectsPermissions(workspaces, request, permissionModes);
    });
    _defineProperty(this, "validateAtLeastOnePermittedWorkspaces", async (workspaces, request, permissionModes) => {
      // for attributes and options passed in this function, the num of workspaces attribute may be 0.This case should not be passed permission check.
      if (!workspaces || workspaces.length === 0) {
        return false;
      }
      for (const workspaceId of workspaces) {
        const validateResult = await this.validateMultiWorkspacesPermissions([workspaceId], request, permissionModes);
        if (validateResult) {
          return true;
        }
      }
      return false;
    });
    _defineProperty(this, "validateDataSourcePermissions", (object, request) => {
      const requestWorkspaceId = (0, _utils.getWorkspaceState)(request).requestWorkspaceId;
      // Deny access if the object is a global data source (no workspaces assigned)
      if (!object.workspaces || object.workspaces.length === 0) {
        return false;
      }
      /**
       * Allow access if no specific workspace is requested.
       * This typically occurs when retrieving data sources or performing operations
       * that don't require a specific workspace, such as pages within the
       * Data Administration navigation group that include a data source picker.
       */
      if (!requestWorkspaceId) {
        return true;
      }
      /*
       * Allow access if the requested workspace matches one of the object's assigned workspaces
       * This ensures that the user can only access data sources within their current workspace
       */
      return object.workspaces.includes(requestWorkspaceId);
    });
    _defineProperty(this, "wrapperFactory", wrapperOptions => {
      const deleteWithWorkspacePermissionControl = async (type, id, options = {}) => {
        const objectToDeleted = await wrapperOptions.client.get(type, id, options);
        if (!(await this.validateWorkspacesAndSavedObjectsPermissions(objectToDeleted, wrapperOptions.request, [_constants.WorkspacePermissionMode.LibraryWrite], [_constants.WorkspacePermissionMode.Write]))) {
          throw generateSavedObjectsPermissionError();
        }
        return await wrapperOptions.client.delete(type, id, options);
      };

      /**
       * validate if can update`objectToUpdate`, means a user should either
       * have `Write` permission on the `objectToUpdate` itself or `LibraryWrite` permission
       * to any of the workspaces the `objectToUpdate` associated with.
       **/
      const validateUpdateWithWorkspacePermission = async objectToUpdate => {
        return await this.validateWorkspacesAndSavedObjectsPermissions(objectToUpdate, wrapperOptions.request, [_constants.WorkspacePermissionMode.LibraryWrite], [_constants.WorkspacePermissionMode.Write], false);
      };
      const updateWithWorkspacePermissionControl = async (type, id, attributes, options = {}) => {
        const objectToUpdate = await wrapperOptions.client.get(type, id, options);
        const permitted = await validateUpdateWithWorkspacePermission(objectToUpdate);
        if (!permitted) {
          throw generateSavedObjectsPermissionError();
        }
        return await wrapperOptions.client.update(type, id, attributes, options);
      };
      const bulkUpdateWithWorkspacePermissionControl = async (objects, options) => {
        const objectsToUpdate = await wrapperOptions.client.bulkGet(objects, options);
        this.permissionControl.addToCacheAllowlist(wrapperOptions.request, getWorkspacesFromSavedObjects(objectsToUpdate.saved_objects));
        for (const object of objectsToUpdate.saved_objects) {
          const permitted = await validateUpdateWithWorkspacePermission(object);
          if (!permitted) {
            throw generateSavedObjectsPermissionError();
          }
        }
        return await wrapperOptions.client.bulkUpdate(objects, options);
      };
      const bulkCreateWithWorkspacePermissionControl = async (objects, options = {}) => {
        var _options$workspaces;
        // Objects with id in overwrite mode will be regarded as update
        const objectsToCreate = options.overwrite ? objects.filter(obj => !obj.id) : objects;
        // Only OSD admin can bulkCreate workspace.
        if (objectsToCreate.some(obj => obj.type === _server.WORKSPACE_TYPE)) {
          throw generateOSDAdminPermissionError();
        }
        const hasTargetWorkspaces = (options === null || options === void 0 ? void 0 : options.workspaces) && options.workspaces.length > 0;
        if (hasTargetWorkspaces && !(await this.validateMultiWorkspacesPermissions((_options$workspaces = options.workspaces) !== null && _options$workspaces !== void 0 ? _options$workspaces : [], wrapperOptions.request, [_constants.WorkspacePermissionMode.LibraryWrite]))) {
          throw generateWorkspacePermissionError();
        }

        /**
         *
         * If target workspaces parameter doesn't exists and `overwrite` is true, we need to check
         * if it has permission to the object itself(defined by the object ACL) or it has permission
         * to any of the workspaces that the object associates with.
         *
         */
        if (!hasTargetWorkspaces && options.overwrite) {
          for (const object of objects) {
            const {
              type,
              id
            } = object;
            if (id) {
              let rawObject;
              try {
                rawObject = await wrapperOptions.client.get(type, id);
              } catch (error) {
                // If object is not found, we will skip the validation of this object.
                if (_server.SavedObjectsErrorHelpers.isNotFoundError(error)) {
                  continue;
                } else {
                  throw error;
                }
              }
              this.permissionControl.addToCacheAllowlist(wrapperOptions.request, getWorkspacesFromSavedObjects([rawObject]));
              if (!(await this.validateWorkspacesAndSavedObjectsPermissions(rawObject, wrapperOptions.request, [_constants.WorkspacePermissionMode.LibraryWrite], [_constants.WorkspacePermissionMode.Write], false))) {
                throw generateWorkspacePermissionError();
              }
            }
          }
        }
        return await wrapperOptions.client.bulkCreate(objects, options);
      };
      const createWithWorkspacePermissionControl = async (type, attributes, options) => {
        var _options$workspaces2;
        // If options contains id and overwrite, it is an update action.
        const isUpdateMode = (options === null || options === void 0 ? void 0 : options.id) && (options === null || options === void 0 ? void 0 : options.overwrite);
        // Only OSD admin can create workspace.
        if (type === _server.WORKSPACE_TYPE && !isUpdateMode) {
          throw generateOSDAdminPermissionError();
        }
        const hasTargetWorkspaces = (options === null || options === void 0 ? void 0 : options.workspaces) && options.workspaces.length > 0;
        if (hasTargetWorkspaces && !(await this.validateMultiWorkspacesPermissions((_options$workspaces2 = options === null || options === void 0 ? void 0 : options.workspaces) !== null && _options$workspaces2 !== void 0 ? _options$workspaces2 : [], wrapperOptions.request, [_constants.WorkspacePermissionMode.LibraryWrite]))) {
          throw generateWorkspacePermissionError();
        }

        /**
         *
         * If target workspaces parameter doesn't exists, `options.id` was exists and `overwrite` is true,
         * we need to check if it has permission to the object itself(defined by the object ACL) or
         * it has permission to any of the workspaces that the object associates with.
         *
         */
        if (options !== null && options !== void 0 && options.overwrite && options.id && !hasTargetWorkspaces && !(await this.validateWorkspacesAndSavedObjectsPermissions(await wrapperOptions.client.get(type, options.id), wrapperOptions.request, [_constants.WorkspacePermissionMode.LibraryWrite], [_constants.WorkspacePermissionMode.Write], false))) {
          throw generateWorkspacePermissionError();
        }
        return await wrapperOptions.client.create(type, attributes, options);
      };
      const getWithWorkspacePermissionControl = async (type, id, options = {}) => {
        const objectToGet = await wrapperOptions.client.get(type, id, options);
        if (objectToGet.type === _common.DATA_SOURCE_SAVED_OBJECT_TYPE) {
          if (isDataSourceAdmin) {
            return objectToGet;
          }
          const hasPermission = this.validateDataSourcePermissions(objectToGet, wrapperOptions.request);
          if (!hasPermission) {
            throw generateDataSourcePermissionError();
          }
        }
        if (!(await this.validateWorkspacesAndSavedObjectsPermissions(objectToGet, wrapperOptions.request, [_constants.WorkspacePermissionMode.LibraryRead, _constants.WorkspacePermissionMode.LibraryWrite], [_constants.WorkspacePermissionMode.Read, _constants.WorkspacePermissionMode.Write], false))) {
          throw generateSavedObjectsPermissionError();
        }
        return objectToGet;
      };
      const bulkGetWithWorkspacePermissionControl = async (objects = [], options = {}) => {
        const objectToBulkGet = await wrapperOptions.client.bulkGet(objects, options);
        this.permissionControl.addToCacheAllowlist(wrapperOptions.request, getWorkspacesFromSavedObjects(objectToBulkGet.saved_objects));
        for (const object of objectToBulkGet.saved_objects) {
          if (object.type === _common.DATA_SOURCE_SAVED_OBJECT_TYPE) {
            const hasPermission = this.validateDataSourcePermissions(object, wrapperOptions.request);
            if (!hasPermission) {
              throw generateDataSourcePermissionError();
            }
          }
          if (!(await this.validateWorkspacesAndSavedObjectsPermissions(object, wrapperOptions.request, [_constants.WorkspacePermissionMode.LibraryRead, _constants.WorkspacePermissionMode.LibraryWrite], [_constants.WorkspacePermissionMode.Write, _constants.WorkspacePermissionMode.Read], false))) {
            throw generateSavedObjectsPermissionError();
          }
        }
        return objectToBulkGet;
      };
      const findWithWorkspacePermissionControl = async options => {
        if (isDataSourceAdmin && options !== null && options !== void 0 && options.type && (options.type === _common.DATA_SOURCE_SAVED_OBJECT_TYPE || Array.isArray(options.type) && options.type.length === 1 && options.type[0] === _common.DATA_SOURCE_SAVED_OBJECT_TYPE)) {
          return await wrapperOptions.client.find(options);
        }
        const principals = this.permissionControl.getPrincipalsFromRequest(wrapperOptions.request);
        const permittedWorkspaceIds = (await this.getWorkspaceTypeEnabledClient(wrapperOptions.request).find({
          type: _server.WORKSPACE_TYPE,
          perPage: 999,
          ACLSearchParams: {
            principals,
            permissionModes: [_constants.WorkspacePermissionMode.LibraryRead, _constants.WorkspacePermissionMode.LibraryWrite]
          },
          // By declaring workspaces as null,
          // workspaces won't be appended automatically into the options.
          // or workspaces can not be found because workspace object do not have `workspaces` field.
          workspaces: null
        })).saved_objects.map(item => item.id);

        // Based on https://github.com/opensearch-project/OpenSearch-Dashboards/blob/main/src/core/server/ui_settings/create_or_upgrade_saved_config/get_upgradeable_config.ts#L49
        // we need to make sure the find call for upgrade config should be able to find all the global configs as it was before.
        // It is a workaround for 2.17, should be optimized in the upcoming 2.18 release.
        if (options.type === 'config' && options.sortField === 'buildNum') {
          const findResult = await wrapperOptions.client.find(options);

          // There maybe user settings inside the find result,
          // so that we need to filter out user configs(user configs are the configs without buildNum attribute).
          const finalSavedObjects = findResult.saved_objects.filter(savedObject => {
            var _savedObject$attribut;
            return !!((_savedObject$attribut = savedObject.attributes) !== null && _savedObject$attribut !== void 0 && _savedObject$attribut.buildNum);
          });
          return {
            ...findResult,
            total: finalSavedObjects.length,
            saved_objects: finalSavedObjects
          };
        } else if (!options.workspaces && !options.ACLSearchParams) {
          options.workspaces = permittedWorkspaceIds;
          options.ACLSearchParams = {
            permissionModes: [_constants.WorkspacePermissionMode.Read, _constants.WorkspacePermissionMode.Write],
            principals
          };
          options.workspacesSearchOperator = 'OR';
        } else {
          if (options.workspaces) {
            options.workspaces = options.workspaces.filter(workspaceId => permittedWorkspaceIds.includes(workspaceId));
          }
          if (options.ACLSearchParams) {
            options.ACLSearchParams = {
              permissionModes: getDefaultValuesForEmpty(options.ACLSearchParams.permissionModes, [_constants.WorkspacePermissionMode.Read, _constants.WorkspacePermissionMode.Write]),
              principals
            };
          }
        }
        return await wrapperOptions.client.find(options);
      };
      const deleteByWorkspaceWithPermissionControl = async (workspace, options = {}) => {
        if (!(await this.validateMultiWorkspacesPermissions([workspace], wrapperOptions.request, [_constants.WorkspacePermissionMode.LibraryWrite]))) {
          throw generateWorkspacePermissionError();
        }
        return await wrapperOptions.client.deleteByWorkspace(workspace, options);
      };
      const addToWorkspacesWithPermissionControl = async (type, id, targetWorkspaces, options = {}) => {
        // Only dashboard admin can assign data source to workspace
        if (type === _common.DATA_SOURCE_SAVED_OBJECT_TYPE) {
          throw generateOSDAdminPermissionError();
        }
        // In current version, only the type is data-source that will call addToWorkspaces
        return await wrapperOptions.client.addToWorkspaces(type, id, targetWorkspaces, options);
      };
      const deleteFromWorkspacesWithPermissionControl = async (type, id, targetWorkspaces, options = {}) => {
        // Only dashboard admin can unassign data source to workspace
        if (type === _common.DATA_SOURCE_SAVED_OBJECT_TYPE) {
          throw generateOSDAdminPermissionError();
        }
        // In current version, only the type is data-source will that call deleteFromWorkspaces
        return await wrapperOptions.client.deleteFromWorkspaces(type, id, targetWorkspaces, options);
      };
      const {
        isDashboardAdmin,
        isDataSourceAdmin
      } = (0, _utils.getWorkspaceState)(wrapperOptions.request) || {};
      if (isDashboardAdmin) {
        return wrapperOptions.client;
      }
      return {
        ...wrapperOptions.client,
        get: getWithWorkspacePermissionControl,
        checkConflicts: wrapperOptions.client.checkConflicts,
        find: findWithWorkspacePermissionControl,
        bulkGet: bulkGetWithWorkspacePermissionControl,
        errors: wrapperOptions.client.errors,
        addToNamespaces: wrapperOptions.client.addToNamespaces,
        deleteFromNamespaces: wrapperOptions.client.deleteFromNamespaces,
        create: createWithWorkspacePermissionControl,
        bulkCreate: bulkCreateWithWorkspacePermissionControl,
        delete: deleteWithWorkspacePermissionControl,
        update: updateWithWorkspacePermissionControl,
        bulkUpdate: bulkUpdateWithWorkspacePermissionControl,
        deleteByWorkspace: deleteByWorkspaceWithPermissionControl,
        addToWorkspaces: addToWorkspacesWithPermissionControl,
        deleteFromWorkspaces: deleteFromWorkspacesWithPermissionControl
      };
    });
  }
}
exports.WorkspaceSavedObjectsClientWrapper = WorkspaceSavedObjectsClientWrapper;