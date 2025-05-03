"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkspaceSavedObjectsClientWrapper = void 0;
var _i18n = require("@osd/i18n");
var _utils = require("../../../../core/server/utils");
var _server = require("../../../../core/server");
var _constants = require("../../common/constants");
var _utils2 = require("../../common/utils");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
// Can't throw unauthorized for now, the page will be refreshed if unauthorized
const generateWorkspacePermissionError = () => _server.SavedObjectsErrorHelpers.decorateForbiddenError(new Error(_i18n.i18n.translate('workspace.permission.invalidate', {
  defaultMessage: 'Invalid workspace permission'
})));
const generateSavedObjectsPermissionError = () => _server.SavedObjectsErrorHelpers.decorateForbiddenError(new Error(_i18n.i18n.translate('workspace.saved_objects.permission.invalidate', {
  defaultMessage: 'Invalid saved objects permission'
})));
const generateOSDAdminPermissionError = () => _server.SavedObjectsErrorHelpers.decorateForbiddenError(new Error(_i18n.i18n.translate('workspace.admin.permission.invalidate', {
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
    _defineProperty(this, "wrapperFactory", wrapperOptions => {
      const ACLAuditor = (0, _utils.getACLAuditor)(wrapperOptions.request);
      const clientCallAuditor = (0, _utils.getClientCallAuditor)(wrapperOptions.request);
      const deleteWithWorkspacePermissionControl = async (type, id, options = {}) => {
        const objectToDeleted = await wrapperOptions.client.get(type, id, options);
        // System request, -1 for compensation.
        ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.DATABASE_OPERATION, -1);
        if (!(await this.validateWorkspacesAndSavedObjectsPermissions(objectToDeleted, wrapperOptions.request, [_server.WorkspacePermissionMode.LibraryWrite], [_server.WorkspacePermissionMode.Write]))) {
          ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_FAILURE, 1);
          throw generateSavedObjectsPermissionError();
        }
        ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_SUCCESS, 1);
        return await wrapperOptions.client.delete(type, id, options);
      };

      /**
       * validate if can update`objectToUpdate`, means a user should either
       * have `Write` permission on the `objectToUpdate` itself or `LibraryWrite` permission
       * to any of the workspaces the `objectToUpdate` associated with.
       **/
      const validateUpdateWithWorkspacePermission = async objectToUpdate => {
        return await this.validateWorkspacesAndSavedObjectsPermissions(objectToUpdate, wrapperOptions.request, [_server.WorkspacePermissionMode.LibraryWrite], [_server.WorkspacePermissionMode.Write], false);
      };
      const updateWithWorkspacePermissionControl = async (type, id, attributes, options = {}) => {
        const objectToUpdate = await wrapperOptions.client.get(type, id, options);
        // System request, -1 for compensation.
        ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.DATABASE_OPERATION, -1);
        const permitted = await validateUpdateWithWorkspacePermission(objectToUpdate);
        if (!permitted) {
          ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_FAILURE, 1);
          throw generateSavedObjectsPermissionError();
        }
        ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_SUCCESS, 1);
        return await wrapperOptions.client.update(type, id, attributes, options);
      };
      const bulkUpdateWithWorkspacePermissionControl = async (objects, options) => {
        const objectsToUpdate = await wrapperOptions.client.bulkGet(objects, options);
        // System request, -1 * objects.length for compensation.
        ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.DATABASE_OPERATION, -1 * objects.length);
        this.permissionControl.addToCacheAllowlist(wrapperOptions.request, getWorkspacesFromSavedObjects(objectsToUpdate.saved_objects));
        for (const object of objectsToUpdate.saved_objects) {
          const permitted = await validateUpdateWithWorkspacePermission(object);
          if (!permitted) {
            ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_FAILURE, 1);
            throw generateSavedObjectsPermissionError();
          }
        }
        ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_SUCCESS, objects.length);
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
        if (hasTargetWorkspaces && !(await this.validateMultiWorkspacesPermissions((_options$workspaces = options.workspaces) !== null && _options$workspaces !== void 0 ? _options$workspaces : [], wrapperOptions.request, [_server.WorkspacePermissionMode.LibraryWrite]))) {
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
                // System request, -1 for compensation.
                ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.DATABASE_OPERATION, -1);
              } catch (error) {
                // If object is not found, we will skip the validation of this object.
                if (_server.SavedObjectsErrorHelpers.isNotFoundError(error)) {
                  continue;
                } else {
                  throw error;
                }
              }
              this.permissionControl.addToCacheAllowlist(wrapperOptions.request, getWorkspacesFromSavedObjects([rawObject]));
              if (!(await this.validateWorkspacesAndSavedObjectsPermissions(rawObject, wrapperOptions.request, [_server.WorkspacePermissionMode.LibraryWrite], [_server.WorkspacePermissionMode.Write], false))) {
                ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_FAILURE, 1);
                throw generateWorkspacePermissionError();
              }
            }
          }
        }
        ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_SUCCESS, objects.length);
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
        if (hasTargetWorkspaces && !(await this.validateMultiWorkspacesPermissions((_options$workspaces2 = options === null || options === void 0 ? void 0 : options.workspaces) !== null && _options$workspaces2 !== void 0 ? _options$workspaces2 : [], wrapperOptions.request, [_server.WorkspacePermissionMode.LibraryWrite]))) {
          var _options$workspaces$l, _options$workspaces3;
          ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_FAILURE, (_options$workspaces$l = (_options$workspaces3 = options.workspaces) === null || _options$workspaces3 === void 0 ? void 0 : _options$workspaces3.length) !== null && _options$workspaces$l !== void 0 ? _options$workspaces$l : 0);
          throw generateWorkspacePermissionError();
        }

        /**
         *
         * If target workspaces parameter doesn't exists, `options.id` was exists and `overwrite` is true,
         * we need to check if it has permission to the object itself(defined by the object ACL) or
         * it has permission to any of the workspaces that the object associates with.
         *
         */
        if (options !== null && options !== void 0 && options.overwrite && options.id && !hasTargetWorkspaces) {
          const object = await wrapperOptions.client.get(type, options.id);
          // System request, -1 for compensation.
          ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.DATABASE_OPERATION, -1);
          if (!(await this.validateWorkspacesAndSavedObjectsPermissions(object, wrapperOptions.request, [_server.WorkspacePermissionMode.LibraryWrite], [_server.WorkspacePermissionMode.Write], false))) {
            ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_FAILURE, 1);
            throw generateWorkspacePermissionError();
          }
        }
        ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_SUCCESS, 1);
        return await wrapperOptions.client.create(type, attributes, options);
      };
      const getWithWorkspacePermissionControl = async (type, id, options = {}) => {
        const objectToGet = await wrapperOptions.client.get(type, id, options);
        if (!(await this.validateWorkspacesAndSavedObjectsPermissions(objectToGet, wrapperOptions.request, [_server.WorkspacePermissionMode.LibraryRead, _server.WorkspacePermissionMode.LibraryWrite], [_server.WorkspacePermissionMode.Read, _server.WorkspacePermissionMode.Write], false))) {
          ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_FAILURE, 1);
          throw generateSavedObjectsPermissionError();
        }
        ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_SUCCESS, 1);
        return objectToGet;
      };
      const bulkGetWithWorkspacePermissionControl = async (objects = [], options = {}) => {
        const objectToBulkGet = await wrapperOptions.client.bulkGet(objects, options);
        this.permissionControl.addToCacheAllowlist(wrapperOptions.request, getWorkspacesFromSavedObjects(objectToBulkGet.saved_objects));
        const processedObjects = await Promise.all(objectToBulkGet.saved_objects.map(async object => {
          try {
            const hasPermission = await this.validateWorkspacesAndSavedObjectsPermissions(object, wrapperOptions.request, [_server.WorkspacePermissionMode.LibraryRead, _server.WorkspacePermissionMode.LibraryWrite], [_server.WorkspacePermissionMode.Write, _server.WorkspacePermissionMode.Read], false);
            if (hasPermission) {
              ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_SUCCESS, 1);
              return object;
            } else {
              ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_FAILURE, 1);
              return {
                ...object,
                workspaces: [],
                attributes: {},
                error: {
                  ...generateSavedObjectsPermissionError().output.payload,
                  statusCode: 403
                }
              };
            }
          } catch (error) {
            ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_FAILURE, 1);
            return {
              ...object,
              workspaces: [],
              attributes: {},
              error: {
                ...generateWorkspacePermissionError().output.payload,
                statusCode: error.statusCode,
                message: error.message
              }
            };
          }
        }));
        return {
          saved_objects: processedObjects
        };
      };
      const findWithWorkspacePermissionControl = async options => {
        if (isDataSourceAdmin && options !== null && options !== void 0 && options.type && (!Array.isArray(options.type) && (0, _utils2.validateIsWorkspaceDataSourceAndConnectionObjectType)(options.type) || Array.isArray(options.type) && options.type.length === 1 && (0, _utils2.validateIsWorkspaceDataSourceAndConnectionObjectType)(options.type[0]))) {
          return await wrapperOptions.client.find(options);
        }
        const principals = this.permissionControl.getPrincipalsFromRequest(wrapperOptions.request);
        const permittedWorkspaceIds = (await this.getWorkspaceTypeEnabledClient(wrapperOptions.request).find({
          type: _server.WORKSPACE_TYPE,
          perPage: 999,
          ACLSearchParams: {
            principals,
            permissionModes: [_server.WorkspacePermissionMode.LibraryRead, _server.WorkspacePermissionMode.LibraryWrite]
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
            permissionModes: [_server.WorkspacePermissionMode.Read, _server.WorkspacePermissionMode.Write],
            principals
          };
          options.workspacesSearchOperator = 'OR';
        } else {
          if (options.workspaces) {
            options.workspaces = options.workspaces.filter(workspaceId => permittedWorkspaceIds.includes(workspaceId));
          }
          if (options.ACLSearchParams) {
            options.ACLSearchParams = {
              permissionModes: getDefaultValuesForEmpty(options.ACLSearchParams.permissionModes, [_server.WorkspacePermissionMode.Read, _server.WorkspacePermissionMode.Write]),
              principals
            };
          }
        }
        return await wrapperOptions.client.find(options);
      };
      const deleteByWorkspaceWithPermissionControl = async (workspace, options = {}) => {
        if (!(await this.validateMultiWorkspacesPermissions([workspace], wrapperOptions.request, [_server.WorkspacePermissionMode.LibraryWrite]))) {
          ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_FAILURE, 1);
          throw generateWorkspacePermissionError();
        }
        ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_SUCCESS, 1);
        return await wrapperOptions.client.deleteByWorkspace(workspace, options);
      };
      const addToWorkspacesWithPermissionControl = async (type, id, targetWorkspaces, options = {}) => {
        // Only dashboard admin can assign data source to workspace
        if ((0, _utils2.validateIsWorkspaceDataSourceAndConnectionObjectType)(type)) {
          ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_FAILURE, 1);
          throw generateOSDAdminPermissionError();
        }
        ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_SUCCESS, 1);
        // In current version, only the type is data-source and data-connection that will call addToWorkspaces
        return await wrapperOptions.client.addToWorkspaces(type, id, targetWorkspaces, options);
      };
      const deleteFromWorkspacesWithPermissionControl = async (type, id, targetWorkspaces, options = {}) => {
        // Only dashboard admin can unassign data source and data-connection to workspace
        if ((0, _utils2.validateIsWorkspaceDataSourceAndConnectionObjectType)(type)) {
          ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_FAILURE, 1);
          throw generateOSDAdminPermissionError();
        }
        ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.VALIDATE_SUCCESS, 1);
        // In current version, only the type is data-source and data-connection will that call deleteFromWorkspaces
        return await wrapperOptions.client.deleteFromWorkspaces(type, id, targetWorkspaces, options);
      };
      const {
        isDashboardAdmin,
        isDataSourceAdmin
      } = (0, _utils.getWorkspaceState)(wrapperOptions.request) || {};
      if (isDashboardAdmin) {
        return wrapperOptions.client;
      }
      const ACLAuditDecorator = function (fn) {
        return function (...args) {
          clientCallAuditor === null || clientCallAuditor === void 0 || clientCallAuditor.increment(_utils.CLIENT_CALL_AUDITOR_KEY.incoming);
          const result = fn.apply(wrapperOptions.client, args);
          if (result instanceof Promise) {
            result.then(() => {
              clientCallAuditor === null || clientCallAuditor === void 0 || clientCallAuditor.increment(_utils.CLIENT_CALL_AUDITOR_KEY.outgoing);
              try {
                const checkoutInfo = JSON.stringify([fn.name, ...args]);
                if (clientCallAuditor !== null && clientCallAuditor !== void 0 && clientCallAuditor.isAsyncClientCallsBalanced()) {
                  ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.checkout(checkoutInfo);
                }
              } catch (e) {
                if (clientCallAuditor !== null && clientCallAuditor !== void 0 && clientCallAuditor.isAsyncClientCallsBalanced()) {
                  ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.checkout();
                }
              }
            },
            /**
             * The catch here is required because unhandled promise will make server crashed,
             * and we will reset the auditor state when catch an error.
             */
            () => {
              clientCallAuditor === null || clientCallAuditor === void 0 || clientCallAuditor.increment(_utils.CLIENT_CALL_AUDITOR_KEY.outgoing);
              if (clientCallAuditor !== null && clientCallAuditor !== void 0 && clientCallAuditor.isAsyncClientCallsBalanced()) {
                ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.reset();
              }
            });
          } else {
            // The decorator is used to decorate async functions so the branch here won't be picked.
            // But we still need to keep it in case there are sync calls in the future.
            clientCallAuditor === null || clientCallAuditor === void 0 || clientCallAuditor.increment(_utils.CLIENT_CALL_AUDITOR_KEY.outgoing);
            if (clientCallAuditor !== null && clientCallAuditor !== void 0 && clientCallAuditor.isAsyncClientCallsBalanced()) {
              ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.checkout();
            }
          }
          return result;
        };
      };
      return {
        ...wrapperOptions.client,
        get: ACLAuditDecorator(getWithWorkspacePermissionControl),
        checkConflicts: wrapperOptions.client.checkConflicts,
        find: findWithWorkspacePermissionControl,
        bulkGet: ACLAuditDecorator(bulkGetWithWorkspacePermissionControl),
        errors: wrapperOptions.client.errors,
        addToNamespaces: wrapperOptions.client.addToNamespaces,
        deleteFromNamespaces: wrapperOptions.client.deleteFromNamespaces,
        create: ACLAuditDecorator(createWithWorkspacePermissionControl),
        bulkCreate: ACLAuditDecorator(bulkCreateWithWorkspacePermissionControl),
        delete: ACLAuditDecorator(deleteWithWorkspacePermissionControl),
        update: ACLAuditDecorator(updateWithWorkspacePermissionControl),
        bulkUpdate: ACLAuditDecorator(bulkUpdateWithWorkspacePermissionControl),
        deleteByWorkspace: ACLAuditDecorator(deleteByWorkspaceWithPermissionControl),
        addToWorkspaces: ACLAuditDecorator(addToWorkspacesWithPermissionControl),
        deleteFromWorkspaces: ACLAuditDecorator(deleteFromWorkspacesWithPermissionControl)
      };
    });
  }
}
exports.WorkspaceSavedObjectsClientWrapper = WorkspaceSavedObjectsClientWrapper;