"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkspaceConflictSavedObjectsClientWrapper = void 0;
var _server = require("../../../../core/server");
var _utils = require("../../common/utils");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
const UI_SETTINGS_SAVED_OBJECTS_TYPE = 'config';
const errorContent = error => error.output.payload;
const filterWorkspacesAccordingToSourceWorkspaces = (targetWorkspaces, baseWorkspaces) => (targetWorkspaces === null || targetWorkspaces === void 0 ? void 0 : targetWorkspaces.filter(item => !(baseWorkspaces !== null && baseWorkspaces !== void 0 && baseWorkspaces.includes(item)))) || [];
class WorkspaceConflictSavedObjectsClientWrapper {
  setSerializer(serializer) {
    this._serializer = serializer;
  }
  getRawId(props) {
    var _this$_serializer;
    return ((_this$_serializer = this._serializer) === null || _this$_serializer === void 0 ? void 0 : _this$_serializer.generateRawId(props.namespace, props.type, props.id)) || `${props.type}:${props.id}`;
  }
  isDataSourceType(type) {
    if (Array.isArray(type)) {
      return type.every(item => (0, _utils.validateIsWorkspaceDataSourceAndConnectionObjectType)(item));
    }
    return (0, _utils.validateIsWorkspaceDataSourceAndConnectionObjectType)(type);
  }
  isConfigType(type) {
    return type === UI_SETTINGS_SAVED_OBJECTS_TYPE;
  }

  /**
   * Workspace is a concept to manage saved objects and the `workspaces` field of each object indicates workspaces the object belongs to.
   * When user tries to update an existing object's attribute, workspaces field should be preserved. Below are some cases that this conflict wrapper will take effect:
   * 1. Overwrite a object belonging to workspace A with parameter workspace B, in this case we should deny the request as it conflicts with workspaces check.
   * 2. Overwrite a object belonging to workspace [A, B] with parameters workspace B, we need to preserved the workspaces fields to [A, B].
   */

  constructor() {
    _defineProperty(this, "_serializer", void 0);
    _defineProperty(this, "wrapperFactory", wrapperOptions => {
      const createWithWorkspaceConflictCheck = async (type, attributes, options = {}) => {
        const {
          workspaces,
          id,
          overwrite
        } = options;
        if (workspaces !== null && workspaces !== void 0 && workspaces.length && (this.isDataSourceType(type) || this.isConfigType(type))) {
          // For 2.14, data source can only be created without workspace info
          // config can not be created inside a workspace
          throw _server.SavedObjectsErrorHelpers.decorateBadRequestError(new Error(`'${type}' is not allowed to be created in workspace.`), 'Unsupported type in workspace');
        }
        let savedObjectWorkspaces = options === null || options === void 0 ? void 0 : options.workspaces;

        /**
         * Check if overwrite with id
         * If so, need to reserve the workspace params
         */
        if (id && overwrite) {
          let currentItem;
          try {
            currentItem = await wrapperOptions.client.get(type, id);
          } catch (e) {
            var _error$output;
            const error = e;
            if ((error === null || error === void 0 || (_error$output = error.output) === null || _error$output === void 0 ? void 0 : _error$output.statusCode) === 404) {
              // If item can not be found, supress the error and create the object
            } else {
              // Throw other error
              throw e;
            }
          }
          if (currentItem) {
            if (filterWorkspacesAccordingToSourceWorkspaces(workspaces, currentItem.workspaces).length) {
              throw _server.SavedObjectsErrorHelpers.createConflictError(type, id);
            } else {
              savedObjectWorkspaces = currentItem.workspaces;
            }
          }
        }
        return await wrapperOptions.client.create(type, attributes, {
          ...options,
          workspaces: savedObjectWorkspaces
        });
      };
      const bulkCreateWithWorkspaceConflictCheck = async (objects, options = {}) => {
        const {
          overwrite,
          namespace,
          workspaces
        } = options;
        const disallowedSavedObjects = [];
        const allowedSavedObjects = [];
        objects.forEach(item => {
          var _item$workspaces;
          const isImportIntoWorkspace = (workspaces === null || workspaces === void 0 ? void 0 : workspaces.length) || ((_item$workspaces = item.workspaces) === null || _item$workspaces === void 0 ? void 0 : _item$workspaces.length);
          // config can not be created inside a workspace
          if (this.isConfigType(item.type) && isImportIntoWorkspace) {
            disallowedSavedObjects.push(item);
            return;
          }

          // For 2.14, data source can only be created without workspace info
          if (this.isDataSourceType(item.type) && isImportIntoWorkspace) {
            disallowedSavedObjects.push(item);
            return;
          }
          allowedSavedObjects.push(item);
          return;
        });

        /**
         * When overwrite, filter out all the objects that have ids
         */
        const bulkGetDocs = overwrite ? allowedSavedObjects.filter(object => !!object.id).map(object => {
          /**
           * If the object waiting to import has id and type,
           * Add it to the buldGetDocs to fetch the latest metadata.
           */
          const {
            type,
            id
          } = object;
          return {
            type,
            id: id,
            fields: ['id', 'workspaces']
          };
        }) : [];
        const objectsConflictWithWorkspace = [];
        const objectsMapWorkspaces = {};
        if (bulkGetDocs.length) {
          /**
           * Get latest status of objects
           */
          const bulkGetResult = await wrapperOptions.client.bulkGet(bulkGetDocs);
          bulkGetResult.saved_objects.forEach(object => {
            const {
              id,
              type
            } = object;

            /**
             * If the object can not be found, create object by using options.workspaces
             */
            if (object.error && object.error.statusCode === 404) {
              objectsMapWorkspaces[this.getRawId({
                namespace,
                type,
                id
              })] = options.workspaces;
            }

            /**
             * Skip the items with error, wrapperOptions.client will handle the error
             */
            if (!object.error && object.id) {
              /**
               * When it is about to overwrite a object into options.workspace.
               * We need to check if the options.workspaces is the subset of object.workspaces,
               * Or it will be treated as a conflict
               */
              const filteredWorkspaces = filterWorkspacesAccordingToSourceWorkspaces(options.workspaces, object.workspaces);
              if (filteredWorkspaces.length) {
                /**
                 * options.workspaces is not a subset of object.workspaces,
                 * Add the item into conflict array.
                 */
                objectsConflictWithWorkspace.push({
                  id,
                  type,
                  attributes: {},
                  references: [],
                  error: {
                    ...errorContent(_server.SavedObjectsErrorHelpers.createConflictError(type, id)),
                    metadata: {
                      isNotOverwritable: true
                    }
                  }
                });
              } else {
                /**
                 * options.workspaces is a subset of object's workspaces
                 * Add the workspaces status into a objectId -> workspaces pairs for later use.
                 */
                objectsMapWorkspaces[this.getRawId({
                  namespace,
                  type,
                  id
                })] = object.workspaces;
              }
            }
          });
        }

        /**
         * Get all the objects that do not conflict on workspaces
         */
        const objectsNoWorkspaceConflictError = allowedSavedObjects.filter(item => !objectsConflictWithWorkspace.find(errorItems => this.getRawId({
          namespace,
          type: errorItems.type,
          id: errorItems.id
        }) === this.getRawId({
          namespace,
          type: item.type,
          id: item.id
        })));

        /**
         * Add the workspaces params back based on objects' workspaces value in index.
         */
        const objectsPayload = objectsNoWorkspaceConflictError.map(item => {
          if (item.id) {
            const workspacesParamsInIndex = objectsMapWorkspaces[this.getRawId({
              namespace,
              id: item.id,
              type: item.type
            })];
            if (workspacesParamsInIndex) {
              item.workspaces = workspacesParamsInIndex;
            }
          }
          return item;
        });

        /**
         * Bypass those objects that are not conflict on workspaces check.
         */
        const realBulkCreateResult = await wrapperOptions.client.bulkCreate(objectsPayload, options);

        /**
         * Merge the workspaceConflict result and real client bulkCreate result.
         */
        return {
          ...realBulkCreateResult,
          saved_objects: [...objectsConflictWithWorkspace, ...disallowedSavedObjects.map(item => ({
            ...item,
            error: {
              ..._server.SavedObjectsErrorHelpers.decorateBadRequestError(new Error(`'${item.type}' is not allowed to be imported in workspace.`), 'Unsupported type in workspace').output.payload,
              metadata: {
                isNotOverwritable: true
              }
            }
          })), ...((realBulkCreateResult === null || realBulkCreateResult === void 0 ? void 0 : realBulkCreateResult.saved_objects) || [])]
        };
      };
      const checkConflictWithWorkspaceConflictCheck = async (objects = [], options = {}) => {
        const objectsConflictWithWorkspace = [];
        /**
         * Fail early when no objects
         */
        if (objects.length === 0) {
          return {
            errors: []
          };
        }
        const {
          workspaces
        } = options;
        const disallowedSavedObjects = [];
        const allowedSavedObjects = [];
        objects.forEach(item => {
          const isImportIntoWorkspace = !!(workspaces !== null && workspaces !== void 0 && workspaces.length);
          // config can not be created inside a workspace
          if (this.isConfigType(item.type) && isImportIntoWorkspace) {
            disallowedSavedObjects.push(item);
            return;
          }

          // For 2.14, data source can only be created without workspace info
          if (this.isDataSourceType(item.type) && isImportIntoWorkspace) {
            disallowedSavedObjects.push(item);
            return;
          }
          allowedSavedObjects.push(item);
          return;
        });

        /**
         * Workspace conflict only happens when target workspaces params present.
         */
        if (options.workspaces) {
          const bulkGetDocs = allowedSavedObjects.map(object => {
            const {
              type,
              id
            } = object;
            return {
              type,
              id,
              fields: ['id', 'workspaces']
            };
          });
          if (bulkGetDocs.length) {
            const bulkGetResult = await wrapperOptions.client.bulkGet(bulkGetDocs);
            bulkGetResult.saved_objects.forEach(object => {
              const {
                id,
                type
              } = object;
              /**
               * Skip the error ones, real checkConflict in repository will handle that.
               */
              if (!object.error) {
                let workspaceConflict = false;
                const filteredWorkspaces = filterWorkspacesAccordingToSourceWorkspaces(options.workspaces, object.workspaces);
                if (filteredWorkspaces.length) {
                  workspaceConflict = true;
                }
                if (workspaceConflict) {
                  objectsConflictWithWorkspace.push({
                    id,
                    type,
                    error: {
                      ...errorContent(_server.SavedObjectsErrorHelpers.createConflictError(type, id)),
                      metadata: {
                        isNotOverwritable: true
                      }
                    }
                  });
                }
              }
            });
          }
        }
        const objectsNoWorkspaceConflictError = allowedSavedObjects.filter(item => !objectsConflictWithWorkspace.find(errorItems => this.getRawId({
          namespace: options.namespace,
          type: errorItems.type,
          id: errorItems.id
        }) === this.getRawId({
          namespace: options.namespace,
          type: item.type,
          id: item.id
        })));

        /**
         * Bypass those objects that are not conflict on workspaces
         */
        const realCheckConflictsResult = await wrapperOptions.client.checkConflicts(objectsNoWorkspaceConflictError, options);

        /**
         * Merge results from two conflict check.
         */
        const result = {
          ...realCheckConflictsResult,
          errors: [...objectsConflictWithWorkspace, ...disallowedSavedObjects.map(item => ({
            ...item,
            error: {
              ..._server.SavedObjectsErrorHelpers.decorateBadRequestError(new Error(`'${item.type}' is not allowed to be imported in workspace.`), 'Unsupported type in workspace').output.payload,
              metadata: {
                isNotOverwritable: true
              }
            }
          })), ...((realCheckConflictsResult === null || realCheckConflictsResult === void 0 ? void 0 : realCheckConflictsResult.errors) || [])]
        };
        return result;
      };
      return {
        ...wrapperOptions.client,
        create: createWithWorkspaceConflictCheck,
        bulkCreate: bulkCreateWithWorkspaceConflictCheck,
        checkConflicts: checkConflictWithWorkspaceConflictCheck,
        delete: wrapperOptions.client.delete,
        find: wrapperOptions.client.find,
        bulkGet: wrapperOptions.client.bulkGet,
        get: wrapperOptions.client.get,
        update: wrapperOptions.client.update,
        bulkUpdate: wrapperOptions.client.bulkUpdate,
        errors: wrapperOptions.client.errors,
        addToNamespaces: wrapperOptions.client.addToNamespaces,
        deleteFromNamespaces: wrapperOptions.client.deleteFromNamespaces
      };
    });
  }
}
exports.WorkspaceConflictSavedObjectsClientWrapper = WorkspaceConflictSavedObjectsClientWrapper;