"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SavedObjectsPermissionControl = void 0;
var _i18n = require("@osd/i18n");
var _server = require("../../../../core/server");
var _constants = require("../../common/constants");
var _utils = require("../../../../core/server/utils");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class SavedObjectsPermissionControl {
  /**
   * Returns a saved objects client that is able to:
   * 1. Read objects whose type is `workspace` because workspace is a hidden type and the permission control client will need to get the metadata of a specific workspace to do the permission check.
   * 2. Bypass saved objects permission control wrapper because the permission control client is a dependency of the wrapper to provide the ACL validation capability. It will run into infinite loop if not bypass.
   * @param request
   * @returns SavedObjectsContract
   */
  getScopedClient(request) {
    var _this$_getScopedClien;
    return (_this$_getScopedClien = this._getScopedClient) === null || _this$_getScopedClien === void 0 ? void 0 : _this$_getScopedClien.call(this, request, {
      excludedWrappers: [_constants.WORKSPACE_SAVED_OBJECTS_CLIENT_WRAPPER_ID],
      includedHiddenTypes: [_server.WORKSPACE_TYPE]
    });
  }
  constructor(logger) {
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "_getScopedClient", void 0);
    _defineProperty(this, "auth", void 0);
    _defineProperty(this, "_savedObjectCache", new Map());
    _defineProperty(this, "_shouldCachedSavedObjects", new Map());
    _defineProperty(this, "generateSavedObjectKey", ({
      type,
      id
    }) => {
      return `${type}:${id}`;
    });
    this.logger = logger;
  }
  async bulkGetSavedObjects(request, savedObjects) {
    var _await$this$getScoped, _this$getScopedClient;
    const ACLAuditor = (0, _utils.getACLAuditor)(request);
    const requestKey = request.uuid;
    const savedObjectsToGet = savedObjects.filter(savedObject => {
      var _this$_savedObjectCac;
      return !((_this$_savedObjectCac = this._savedObjectCache.get(requestKey)) !== null && _this$_savedObjectCac !== void 0 && _this$_savedObjectCac[this.generateSavedObjectKey(savedObject)]);
    });
    const retrievedSavedObjects = savedObjectsToGet.length > 0 ? ((_await$this$getScoped = await ((_this$getScopedClient = this.getScopedClient) === null || _this$getScopedClient === void 0 || (_this$getScopedClient = _this$getScopedClient.call(this, request)) === null || _this$getScopedClient === void 0 ? void 0 : _this$getScopedClient.bulkGet(savedObjectsToGet))) === null || _await$this$getScoped === void 0 ? void 0 : _await$this$getScoped.saved_objects) || [] : [];
    // System request, -1 * savedObjectsToGet.length for compensation.
    ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.DATABASE_OPERATION, -1 * savedObjectsToGet.length);
    const retrievedSavedObjectsMap = {};
    retrievedSavedObjects.forEach(savedObject => {
      var _this$_shouldCachedSa;
      const savedObjectKey = this.generateSavedObjectKey(savedObject);
      if ((_this$_shouldCachedSa = this._shouldCachedSavedObjects.get(requestKey)) !== null && _this$_shouldCachedSa !== void 0 && _this$_shouldCachedSa.includes(savedObjectKey)) {
        const cachedSavedObjectsMap = this._savedObjectCache.get(requestKey) || {};
        cachedSavedObjectsMap[savedObjectKey] = savedObject;
        this._savedObjectCache.set(requestKey, cachedSavedObjectsMap);
      }
      retrievedSavedObjectsMap[savedObjectKey] = savedObject;
    });
    const results = [];
    savedObjects.forEach(savedObject => {
      var _this$_savedObjectCac2;
      const savedObjectKey = this.generateSavedObjectKey(savedObject);
      const foundedSavedObject = ((_this$_savedObjectCac2 = this._savedObjectCache.get(requestKey)) === null || _this$_savedObjectCac2 === void 0 ? void 0 : _this$_savedObjectCac2[savedObjectKey]) || retrievedSavedObjectsMap[savedObjectKey];
      if (foundedSavedObject) {
        results.push(foundedSavedObject);
      }
    });
    return results;
  }
  async setup(getScopedClient, auth) {
    this._getScopedClient = getScopedClient;
    this.auth = auth;
  }
  async validate(request, savedObject, permissionModes) {
    return await this.batchValidate(request, [savedObject], permissionModes);
  }
  logNotPermitted(savedObjects, principals, permissionModes) {
    this.logger.debug(`Authorization failed, principals: ${JSON.stringify(principals)} has no [${permissionModes}] permissions on the requested saved object: ${JSON.stringify(savedObjects.map(savedObject => ({
      id: savedObject.id,
      type: savedObject.type,
      workspaces: savedObject.workspaces,
      permissions: savedObject.permissions
    })))}`);
  }
  getPrincipalsFromRequest(request) {
    return (0, _utils.getPrincipalsFromRequest)(request, this.auth);
  }

  /**
   * Validates the permissions for a collection of saved objects based on their Access Control Lists (ACL).
   * This method checks whether the provided principals have the specified permission modes for each saved object.
   * If any saved object lacks the required permissions, the function logs details of unauthorized access.
   *
   * @remarks
   * If a saved object doesn't have an ACL (e.g., config objects), it is considered as having the required permissions.
   * The function logs detailed information when unauthorized access is detected, including the list of denied saved objects.
   */
  validateSavedObjectsACL(savedObjects, principals, permissionModes) {
    const notPermittedSavedObjects = [];
    const hasPermissionToAllObjects = savedObjects.every(savedObject => {
      // for object that doesn't contain ACL like config, return true
      if (!savedObject.permissions) {
        return true;
      }
      const aclInstance = new _server.ACL(savedObject.permissions);
      const hasPermission = aclInstance.hasPermission(permissionModes, principals);
      if (!hasPermission) {
        notPermittedSavedObjects.push({
          id: savedObject.id,
          type: savedObject.type,
          workspaces: savedObject.workspaces,
          permissions: savedObject.permissions
        });
      }
      return hasPermission;
    });
    if (!hasPermissionToAllObjects) {
      this.logNotPermitted(notPermittedSavedObjects, principals, permissionModes);
    }
    return hasPermissionToAllObjects;
  }

  /**
   * Performs batch validation to check if the current request has access to specified saved objects
   * with the given permission modes.
   * @param request
   * @param savedObjects
   * @param permissionModes
   * @returns
   */
  async batchValidate(request, savedObjects, permissionModes) {
    const savedObjectsGet = await this.bulkGetSavedObjects(request, savedObjects);
    if (!savedObjectsGet.length) {
      return {
        success: false,
        error: _i18n.i18n.translate('workspace.savedObjects.permission.notFound', {
          defaultMessage: 'Can not find target saved objects.'
        })
      };
    }
    if (savedObjectsGet.some(item => item.error)) {
      return {
        success: false,
        error: savedObjectsGet.filter(item => item.error).map(item => {
          var _item$error;
          return (_item$error = item.error) === null || _item$error === void 0 ? void 0 : _item$error.error;
        }).join('\n')
      };
    }
    const principals = this.getPrincipalsFromRequest(request);
    const hasPermissionToAllObjects = this.validateSavedObjectsACL(savedObjectsGet, principals, permissionModes);
    return {
      success: true,
      result: hasPermissionToAllObjects
    };
  }
  addToCacheAllowlist(request, savedObjects) {
    var _this$_shouldCachedSa2;
    const requestKey = request.uuid;
    this._shouldCachedSavedObjects.set(requestKey, Array.from(new Set([...((_this$_shouldCachedSa2 = this._shouldCachedSavedObjects.get(requestKey)) !== null && _this$_shouldCachedSa2 !== void 0 ? _this$_shouldCachedSa2 : []), ...savedObjects.map(this.generateSavedObjectKey)])));
  }
  clearSavedObjectsCache(request) {
    const requestKey = request.uuid;
    if (this._shouldCachedSavedObjects.has(requestKey)) {
      this._shouldCachedSavedObjects.delete(requestKey);
    }
    if (this._savedObjectCache.has(requestKey)) {
      this._savedObjectCache.delete(requestKey);
    }
  }
}
exports.SavedObjectsPermissionControl = SavedObjectsPermissionControl;