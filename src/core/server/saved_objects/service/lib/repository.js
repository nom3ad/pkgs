"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SavedObjectsRepository = void 0;
var _lodash = require("lodash");
var _uuid = _interopRequireDefault(require("uuid"));
var _mappings = require("../../mappings");
var _repository_opensearch_client = require("./repository_opensearch_client");
var _search_dsl = require("./search_dsl");
var _included_fields = require("./included_fields");
var _errors = require("./errors");
var _version = require("../../version");
var _serialization = require("../../serialization");
var _filter_utils = require("./filter_utils");
var _utils = require("./utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */ /*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
// BEWARE: The SavedObjectClient depends on the implementation details of the SavedObjectsRepository
// so any breaking changes to this repository are considered breaking changes to the SavedObjectsClient.

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions

const isLeft = either => either.tag === 'Left';
const isRight = either => either.tag === 'Right';

/**
 * @public
 */

/**
 *
 * @public
 */

const DEFAULT_REFRESH_SETTING = 'wait_for';

/**
 * See {@link SavedObjectsRepository}
 *
 * @public
 */

/**
 * @public
 */
class SavedObjectsRepository {
  /**
   * A factory function for creating SavedObjectRepository instances.
   *
   * @internalRemarks
   * Tests are located in ./repository_create_repository.test.ts
   *
   * @internal
   */
  static createRepository(migrator, typeRegistry, indexName, client, includedHiddenTypes = [], injectedConstructor = SavedObjectsRepository) {
    const mappings = migrator.getActiveMappings();
    const allTypes = typeRegistry.getAllTypes().map(t => t.name);
    const serializer = new _serialization.SavedObjectsSerializer(typeRegistry);
    const visibleTypes = allTypes.filter(type => !typeRegistry.isHidden(type));
    const missingTypeMappings = includedHiddenTypes.filter(type => !allTypes.includes(type));
    if (missingTypeMappings.length > 0) {
      throw new Error(`Missing mappings for saved objects types: '${missingTypeMappings.join(', ')}'`);
    }
    const allowedTypes = [...new Set(visibleTypes.concat(includedHiddenTypes))];
    return new injectedConstructor({
      index: indexName,
      migrator,
      mappings,
      typeRegistry,
      serializer,
      allowedTypes,
      client
    });
  }
  constructor(options) {
    _defineProperty(this, "_migrator", void 0);
    _defineProperty(this, "_index", void 0);
    _defineProperty(this, "_mappings", void 0);
    _defineProperty(this, "_registry", void 0);
    _defineProperty(this, "_allowedTypes", void 0);
    _defineProperty(this, "client", void 0);
    _defineProperty(this, "_serializer", void 0);
    const {
      index,
      mappings,
      client,
      typeRegistry,
      serializer,
      migrator,
      allowedTypes = []
    } = options;

    // It's important that we migrate documents / mark them as up-to-date
    // prior to writing them to the index. Otherwise, we'll cause unnecessary
    // index migrations to run at OpenSearch Dashboards startup, and those will probably fail
    // due to invalidly versioned documents in the index.
    //
    // The migrator performs double-duty, and validates the documents prior
    // to returning them.
    this._migrator = migrator;
    this._index = index;
    this._mappings = mappings;
    this._registry = typeRegistry;
    this.client = (0, _repository_opensearch_client.createRepositoryOpenSearchClient)(client);
    if (allowedTypes.length === 0) {
      throw new Error('Empty or missing types for saved object repository!');
    }
    this._allowedTypes = allowedTypes;
    this._serializer = serializer;
  }

  /**
   * Persists an object
   *
   * @param {string} type
   * @param {object} attributes
   * @param {object} [options={}]
   * @property {string} [options.id] - force id on creation, not recommended
   * @property {boolean} [options.overwrite=false]
   * @property {object} [options.migrationVersion=undefined]
   * @property {string} [options.namespace]
   * @property {array} [options.references=[]] - [{ name, type, id }]
   * @returns {promise} - { id, type, version, attributes }
   */
  async create(type, attributes, options = {}) {
    const {
      id,
      migrationVersion,
      overwrite = false,
      references = [],
      refresh = DEFAULT_REFRESH_SETTING,
      originId,
      initialNamespaces,
      version,
      workspaces,
      permissions
    } = options;
    const namespace = normalizeNamespace(options.namespace);
    if (initialNamespaces) {
      if (!this._registry.isMultiNamespace(type)) {
        throw _errors.SavedObjectsErrorHelpers.createBadRequestError('"options.initialNamespaces" can only be used on multi-namespace types');
      } else if (!initialNamespaces.length) {
        throw _errors.SavedObjectsErrorHelpers.createBadRequestError('"options.initialNamespaces" must be a non-empty array of strings');
      }
    }
    if (!this._allowedTypes.includes(type)) {
      throw _errors.SavedObjectsErrorHelpers.createUnsupportedTypeError(type);
    }
    const time = this._getCurrentTime();
    let savedObjectNamespace;
    let savedObjectNamespaces;
    if (this._registry.isSingleNamespace(type) && namespace) {
      savedObjectNamespace = namespace;
    } else if (this._registry.isMultiNamespace(type)) {
      if (id && overwrite) {
        // we will overwrite a multi-namespace saved object if it exists; if that happens, ensure we preserve its included namespaces
        // note: this check throws an error if the object is found but does not exist in this namespace
        const existingNamespaces = await this.preflightGetNamespaces(type, id, namespace);
        savedObjectNamespaces = initialNamespaces || existingNamespaces;
      } else {
        savedObjectNamespaces = initialNamespaces || getSavedObjectNamespaces(namespace);
      }
    }
    const migrated = this._migrator.migrateDocument({
      id,
      type,
      ...(savedObjectNamespace && {
        namespace: savedObjectNamespace
      }),
      ...(savedObjectNamespaces && {
        namespaces: savedObjectNamespaces
      }),
      originId,
      attributes,
      migrationVersion,
      updated_at: time,
      ...(Array.isArray(references) && {
        references
      }),
      ...(Array.isArray(workspaces) && {
        workspaces
      }),
      ...(permissions && {
        permissions
      })
    });
    const raw = this._serializer.savedObjectToRaw(migrated);
    const requestParams = {
      id: raw._id,
      index: this.getIndexForType(type),
      refresh,
      body: raw._source,
      ...(overwrite && version ? (0, _version.decodeRequestVersion)(version) : {})
    };
    const {
      body
    } = id && overwrite ? await this.client.index(requestParams) : await this.client.create(requestParams);
    return this._rawToSavedObject({
      ...raw,
      ...body
    });
  }

  /**
   * Creates multiple documents at once
   *
   * @param {array} objects - [{ type, id, attributes, references, migrationVersion }]
   * @param {object} [options={}]
   * @property {boolean} [options.overwrite=false] - overwrites existing documents
   * @property {string} [options.namespace]
   * @returns {promise} -  {saved_objects: [[{ id, type, version, references, attributes, error: { message } }]}
   */
  async bulkCreate(objects, options = {}) {
    const {
      overwrite = false,
      refresh = DEFAULT_REFRESH_SETTING
    } = options;
    const namespace = normalizeNamespace(options.namespace);
    const time = this._getCurrentTime();
    let bulkGetRequestIndexCounter = 0;
    const expectedResults = objects.map(object => {
      let error;
      if (!this._allowedTypes.includes(object.type)) {
        error = _errors.SavedObjectsErrorHelpers.createUnsupportedTypeError(object.type);
      } else if (object.initialNamespaces) {
        if (!this._registry.isMultiNamespace(object.type)) {
          error = _errors.SavedObjectsErrorHelpers.createBadRequestError('"initialNamespaces" can only be used on multi-namespace types');
        } else if (!object.initialNamespaces.length) {
          error = _errors.SavedObjectsErrorHelpers.createBadRequestError('"initialNamespaces" must be a non-empty array of strings');
        }
      }
      if (error) {
        return {
          tag: 'Left',
          error: {
            id: object.id,
            type: object.type,
            error: errorContent(error)
          }
        };
      }
      const method = object.id && overwrite ? 'index' : 'create';
      const requiresNamespacesCheck = object.id && this._registry.isMultiNamespace(object.type);
      if (object.id == null) object.id = _uuid.default.v1();
      return {
        tag: 'Right',
        value: {
          method,
          object,
          ...(requiresNamespacesCheck && {
            opensearchRequestIndex: bulkGetRequestIndexCounter++
          })
        }
      };
    });
    const bulkGetDocs = expectedResults.filter(isRight).filter(({
      value
    }) => value.opensearchRequestIndex !== undefined).map(({
      value: {
        object: {
          type,
          id
        }
      }
    }) => ({
      _id: this._serializer.generateRawId(namespace, type, id),
      _index: this.getIndexForType(type),
      _source: ['type', 'namespaces']
    }));
    const bulkGetResponse = bulkGetDocs.length ? await this.client.mget({
      body: {
        docs: bulkGetDocs
      }
    }, {
      ignore: [404]
    }) : undefined;
    let bulkRequestIndexCounter = 0;
    const bulkCreateParams = [];
    const expectedBulkResults = expectedResults.map(expectedBulkGetResult => {
      if (isLeft(expectedBulkGetResult)) {
        return expectedBulkGetResult;
      }
      let savedObjectNamespace;
      let savedObjectNamespaces;
      let versionProperties;
      const {
        opensearchRequestIndex,
        object: {
          initialNamespaces,
          version,
          ...object
        },
        method
      } = expectedBulkGetResult.value;
      if (opensearchRequestIndex !== undefined) {
        const indexFound = (bulkGetResponse === null || bulkGetResponse === void 0 ? void 0 : bulkGetResponse.statusCode) !== 404;
        const actualResult = indexFound ? bulkGetResponse === null || bulkGetResponse === void 0 ? void 0 : bulkGetResponse.body.docs[opensearchRequestIndex] : undefined;
        const docFound = indexFound && (actualResult === null || actualResult === void 0 ? void 0 : actualResult.found) === true;
        // @ts-expect-error MultiGetHit._source is optional
        if (docFound && !this.rawDocExistsInNamespace(actualResult, namespace)) {
          const {
            id,
            type
          } = object;
          return {
            tag: 'Left',
            error: {
              id,
              type,
              error: {
                ...errorContent(_errors.SavedObjectsErrorHelpers.createConflictError(type, id)),
                metadata: {
                  isNotOverwritable: true
                }
              }
            }
          };
        }
        savedObjectNamespaces = initialNamespaces ||
        // @ts-expect-error MultiGetHit._source is optional
        getSavedObjectNamespaces(namespace, docFound ? actualResult : undefined);
        // @ts-expect-error MultiGetHit._source is optional
        versionProperties = getExpectedVersionProperties(version, actualResult);
      } else {
        if (this._registry.isSingleNamespace(object.type)) {
          savedObjectNamespace = initialNamespaces ? initialNamespaces[0] : namespace;
        } else if (this._registry.isMultiNamespace(object.type)) {
          savedObjectNamespaces = initialNamespaces || getSavedObjectNamespaces(namespace);
        }
        versionProperties = getExpectedVersionProperties(version);
      }
      let savedObjectWorkspaces = options.workspaces;
      if (expectedBulkGetResult.value.method !== 'create') {
        savedObjectWorkspaces = object.workspaces;
      }
      const expectedResult = {
        opensearchRequestIndex: bulkRequestIndexCounter++,
        requestedId: object.id,
        rawMigratedDoc: this._serializer.savedObjectToRaw(this._migrator.migrateDocument({
          id: object.id,
          type: object.type,
          attributes: object.attributes,
          migrationVersion: object.migrationVersion,
          ...(savedObjectNamespace && {
            namespace: savedObjectNamespace
          }),
          ...(savedObjectNamespaces && {
            namespaces: savedObjectNamespaces
          }),
          updated_at: time,
          references: object.references || [],
          originId: object.originId,
          ...(savedObjectWorkspaces && {
            workspaces: savedObjectWorkspaces
          }),
          ...(object.permissions && {
            permissions: object.permissions
          })
        }))
      };
      bulkCreateParams.push({
        [method]: {
          _id: expectedResult.rawMigratedDoc._id,
          _index: this.getIndexForType(object.type),
          ...(overwrite && versionProperties)
        }
      }, expectedResult.rawMigratedDoc._source);
      return {
        tag: 'Right',
        value: expectedResult
      };
    });
    const bulkResponse = bulkCreateParams.length ? await this.client.bulk({
      refresh,
      body: bulkCreateParams
    }) : undefined;
    return {
      saved_objects: expectedBulkResults.map(expectedResult => {
        var _bulkResponse$body$it;
        if (isLeft(expectedResult)) {
          return expectedResult.error;
        }
        const {
          requestedId,
          rawMigratedDoc,
          opensearchRequestIndex
        } = expectedResult.value;
        const {
          error,
          ...rawResponse
        } = Object.values((_bulkResponse$body$it = bulkResponse === null || bulkResponse === void 0 ? void 0 : bulkResponse.body.items[opensearchRequestIndex]) !== null && _bulkResponse$body$it !== void 0 ? _bulkResponse$body$it : {})[0];
        if (error) {
          return {
            id: requestedId,
            type: rawMigratedDoc._source.type,
            error: getBulkOperationError(error, rawMigratedDoc._source.type, requestedId)
          };
        }

        // When method == 'index' the bulkResponse doesn't include the indexed
        // _source so we return rawMigratedDoc but have to spread the latest
        // _seq_no and _primary_term values from the rawResponse.
        return this._rawToSavedObject({
          ...rawMigratedDoc,
          ...{
            _seq_no: rawResponse._seq_no,
            _primary_term: rawResponse._primary_term
          }
        });
      })
    };
  }

  /**
   * Check what conflicts will result when creating a given array of saved objects. This includes "unresolvable conflicts", which are
   * multi-namespace objects that exist in a different namespace; such conflicts cannot be resolved/overwritten.
   */
  async checkConflicts(objects = [], options = {}) {
    if (objects.length === 0) {
      return {
        errors: []
      };
    }
    const namespace = normalizeNamespace(options.namespace);
    let bulkGetRequestIndexCounter = 0;
    const expectedBulkGetResults = objects.map(object => {
      const {
        type,
        id
      } = object;
      if (!this._allowedTypes.includes(type)) {
        return {
          tag: 'Left',
          error: {
            id,
            type,
            error: errorContent(_errors.SavedObjectsErrorHelpers.createUnsupportedTypeError(type))
          }
        };
      }
      return {
        tag: 'Right',
        value: {
          type,
          id,
          opensearchRequestIndex: bulkGetRequestIndexCounter++
        }
      };
    });
    const bulkGetDocs = expectedBulkGetResults.filter(isRight).map(({
      value: {
        type,
        id
      }
    }) => ({
      _id: this._serializer.generateRawId(namespace, type, id),
      _index: this.getIndexForType(type),
      _source: ['type', 'namespaces']
    }));
    const bulkGetResponse = bulkGetDocs.length ? await this.client.mget({
      body: {
        docs: bulkGetDocs
      }
    }, {
      ignore: [404]
    }) : undefined;
    const errors = [];
    expectedBulkGetResults.forEach(expectedResult => {
      if (isLeft(expectedResult)) {
        errors.push(expectedResult.error);
        return;
      }
      const {
        type,
        id,
        opensearchRequestIndex
      } = expectedResult.value;
      const doc = bulkGetResponse === null || bulkGetResponse === void 0 ? void 0 : bulkGetResponse.body.docs[opensearchRequestIndex];
      if (doc !== null && doc !== void 0 && doc.found) {
        errors.push({
          id,
          type,
          error: {
            ...errorContent(_errors.SavedObjectsErrorHelpers.createConflictError(type, id)),
            // @ts-expect-error MultiGetHit._source is optional
            ...(!this.rawDocExistsInNamespace(doc, namespace) && {
              metadata: {
                isNotOverwritable: true
              }
            })
          }
        });
      }
    });
    return {
      errors
    };
  }

  /**
   * Deletes an object
   *
   * @param {string} type
   * @param {string} id
   * @param {object} [options={}]
   * @property {string} [options.namespace]
   * @returns {promise}
   */
  async delete(type, id, options = {}) {
    if (!this._allowedTypes.includes(type)) {
      throw _errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id);
    }
    const {
      refresh = DEFAULT_REFRESH_SETTING,
      force
    } = options;
    const namespace = normalizeNamespace(options.namespace);
    const rawId = this._serializer.generateRawId(namespace, type, id);
    let preflightResult;
    if (this._registry.isMultiNamespace(type)) {
      var _getSavedObjectNamesp;
      preflightResult = await this.preflightCheckIncludesNamespace(type, id, namespace);
      const existingNamespaces = (_getSavedObjectNamesp = getSavedObjectNamespaces(undefined, preflightResult)) !== null && _getSavedObjectNamesp !== void 0 ? _getSavedObjectNamesp : [];
      if (!force && (existingNamespaces.length > 1 || existingNamespaces.includes(_utils.ALL_NAMESPACES_STRING))) {
        throw _errors.SavedObjectsErrorHelpers.createBadRequestError('Unable to delete saved object that exists in multiple namespaces, use the `force` option to delete it anyway');
      }
    }
    const {
      body,
      statusCode
    } = await this.client.delete({
      id: rawId,
      index: this.getIndexForType(type),
      ...getExpectedVersionProperties(undefined, preflightResult),
      refresh
    }, {
      ignore: [404]
    });
    const deleted = body.result === 'deleted';
    if (deleted) {
      return {};
    }
    const deleteDocNotFound = body.result === 'not_found';
    const deleteIndexNotFound = body.error && body.error.type === 'index_not_found_exception';
    if (deleteDocNotFound || deleteIndexNotFound) {
      // see "404s from missing index" above
      throw _errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id);
    }
    throw new Error(`Unexpected OpenSearch DELETE response: ${JSON.stringify({
      type,
      id,
      response: {
        body,
        statusCode
      }
    })}`);
  }

  /**
   * Deletes all objects from the provided namespace.
   *
   * @param {string} namespace
   * @returns {promise} - { took, timed_out, total, deleted, batches, version_conflicts, noops, retries, failures }
   */
  async deleteByNamespace(namespace, options = {}) {
    if (!namespace || typeof namespace !== 'string' || namespace === '*') {
      throw new TypeError(`namespace is required, and must be a string that is not equal to '*'`);
    }
    const allTypes = Object.keys((0, _mappings.getRootPropertiesObjects)(this._mappings));
    const typesToUpdate = allTypes.filter(type => !this._registry.isNamespaceAgnostic(type));
    const {
      body
    } = await this.client.updateByQuery({
      index: this.getIndicesForTypes(typesToUpdate),
      refresh: options.refresh,
      body: {
        script: {
          source: `
              if (!ctx._source.containsKey('namespaces')) {
                ctx.op = "delete";
              } else {
                ctx._source['namespaces'].removeAll(Collections.singleton(params['namespace']));
                if (ctx._source['namespaces'].empty) {
                  ctx.op = "delete";
                }
              }
            `,
          lang: 'painless',
          params: {
            namespace
          }
        },
        conflicts: 'proceed',
        ...(0, _search_dsl.getSearchDsl)(this._mappings, this._registry, {
          namespaces: namespace ? [namespace] : undefined,
          type: typesToUpdate
        })
      }
    }, {
      ignore: [404]
    });
    return body;
  }

  /**
   * Deletes all objects from the provided workspace.
   *
   * @param {string} workspace - workspace id
   * @param options SavedObjectsDeleteByWorkspaceOptions
   * @returns {promise} - { took, timed_out, total, deleted, batches, version_conflicts, noops, retries, failures }
   */
  async deleteByWorkspace(workspace, options = {}) {
    if (!workspace || typeof workspace !== 'string' || workspace === '*') {
      throw new TypeError(`workspace is required, and must be a string that is not equal to '*'`);
    }
    const allTypes = Object.keys((0, _mappings.getRootPropertiesObjects)(this._mappings));
    const {
      body
    } = await this.client.updateByQuery({
      index: this.getIndicesForTypes(allTypes),
      refresh: options.refresh,
      body: {
        script: {
          source: `
              if (!ctx._source.containsKey('workspaces')) {
                ctx.op = "delete";
              } else {
                ctx._source['workspaces'].removeAll(Collections.singleton(params['workspace']));
                if (ctx._source['workspaces'].empty) {
                  ctx.op = "delete";
                }
              }
            `,
          lang: 'painless',
          params: {
            workspace
          }
        },
        conflicts: 'proceed',
        ...(0, _search_dsl.getSearchDsl)(this._mappings, this._registry, {
          workspaces: [workspace],
          type: allTypes
        })
      }
    }, {
      ignore: [404]
    });
    return body;
  }

  /**
   * @param {object} [options={}]
   * @property {(string|Array<string>)} [options.type]
   * @property {string} [options.search]
   * @property {string} [options.defaultSearchOperator]
   * @property {Array<string>} [options.searchFields] - see OpenSearch Simple Query String
   *                                        Query field argument for more information
   * @property {integer} [options.page=1]
   * @property {integer} [options.perPage=20]
   * @property {string} [options.sortField]
   * @property {string} [options.sortOrder]
   * @property {Array<string>} [options.fields]
   * @property {string} [options.namespace]
   * @property {object} [options.hasReference] - { type, id }
   * @property {string} [options.preference]
   * @returns {promise} - { saved_objects: [{ id, type, version, attributes }], total, per_page, page }
   */
  async find(options) {
    const {
      search,
      defaultSearchOperator = 'OR',
      searchFields,
      rootSearchFields,
      hasReference,
      page = _utils.FIND_DEFAULT_PAGE,
      perPage = _utils.FIND_DEFAULT_PER_PAGE,
      sortField,
      sortOrder,
      fields,
      namespaces,
      type,
      typeToNamespacesMap,
      filter,
      preference,
      workspaces,
      workspacesSearchOperator,
      ACLSearchParams
    } = options;
    if (!type && !typeToNamespacesMap) {
      throw _errors.SavedObjectsErrorHelpers.createBadRequestError('options.type must be a string or an array of strings');
    } else if ((namespaces === null || namespaces === void 0 ? void 0 : namespaces.length) === 0 && !typeToNamespacesMap) {
      throw _errors.SavedObjectsErrorHelpers.createBadRequestError('options.namespaces cannot be an empty array');
    } else if (type && typeToNamespacesMap) {
      throw _errors.SavedObjectsErrorHelpers.createBadRequestError('options.type must be an empty string when options.typeToNamespacesMap is used');
    } else if ((!namespaces || namespaces !== null && namespaces !== void 0 && namespaces.length) && typeToNamespacesMap) {
      throw _errors.SavedObjectsErrorHelpers.createBadRequestError('options.namespaces must be an empty array when options.typeToNamespacesMap is used');
    }
    const types = type ? Array.isArray(type) ? type : [type] : Array.from(typeToNamespacesMap.keys());
    const allowedTypes = types.filter(t => this._allowedTypes.includes(t));
    if (allowedTypes.length === 0) {
      return _utils.SavedObjectsUtils.createEmptyFindResponse(options);
    }
    if (searchFields && !Array.isArray(searchFields)) {
      throw _errors.SavedObjectsErrorHelpers.createBadRequestError('options.searchFields must be an array');
    }
    if (fields && !Array.isArray(fields)) {
      throw _errors.SavedObjectsErrorHelpers.createBadRequestError('options.fields must be an array');
    }
    let kueryNode;
    try {
      if (filter) {
        kueryNode = (0, _filter_utils.validateConvertFilterToKueryNode)(allowedTypes, filter, this._mappings);
      }
    } catch (e) {
      if (e.name === 'DQLSyntaxError') {
        throw _errors.SavedObjectsErrorHelpers.createBadRequestError('DQLSyntaxError: ' + e.message);
      } else {
        throw e;
      }
    }
    const opensearchOptions = {
      index: this.getIndicesForTypes(allowedTypes),
      size: perPage,
      from: perPage * (page - 1),
      _source: (0, _included_fields.includedFields)(type, fields),
      rest_total_hits_as_int: true,
      preference,
      body: {
        seq_no_primary_term: true,
        ...(0, _search_dsl.getSearchDsl)(this._mappings, this._registry, {
          search,
          defaultSearchOperator,
          searchFields,
          rootSearchFields,
          type: allowedTypes,
          sortField,
          sortOrder,
          namespaces,
          typeToNamespacesMap,
          hasReference,
          kueryNode,
          workspaces,
          workspacesSearchOperator,
          ACLSearchParams
        })
      }
    };
    const {
      body,
      statusCode
    } = await this.client.search(opensearchOptions, {
      ignore: [404]
    });
    if (statusCode === 404) {
      // 404 is only possible here if the index is missing, which
      // we don't want to leak, see "404s from missing index" above
      return {
        page,
        per_page: perPage,
        total: 0,
        saved_objects: []
      };
    }
    return {
      page,
      per_page: perPage,
      total: body.hits.total,
      saved_objects: body.hits.hits.map(hit => ({
        // @ts-expect-error @opensearch-project/opensearch _source is optional
        ...this._rawToSavedObject(hit),
        score: hit._score,
        // @ts-expect-error @opensearch-project/opensearch _source is optional
        sort: hit.sort
      }))
    };
  }

  /**
   * Returns an array of objects by id
   *
   * @param {array} objects - an array of objects containing id, type and optionally fields
   * @param {object} [options={}]
   * @property {string} [options.namespace]
   * @returns {promise} - { saved_objects: [{ id, type, version, attributes }] }
   * @example
   *
   * bulkGet([
   *   { id: 'one', type: 'config' },
   *   { id: 'foo', type: 'index-pattern' }
   * ])
   */
  async bulkGet(objects = [], options = {}) {
    const namespace = normalizeNamespace(options.namespace);
    if (objects.length === 0) {
      return {
        saved_objects: []
      };
    }
    let bulkGetRequestIndexCounter = 0;
    const expectedBulkGetResults = objects.map(object => {
      const {
        type,
        id,
        fields
      } = object;
      if (!this._allowedTypes.includes(type)) {
        return {
          tag: 'Left',
          error: {
            id,
            type,
            error: errorContent(_errors.SavedObjectsErrorHelpers.createUnsupportedTypeError(type))
          }
        };
      }
      return {
        tag: 'Right',
        value: {
          type,
          id,
          fields,
          opensearchRequestIndex: bulkGetRequestIndexCounter++
        }
      };
    });
    const bulkGetDocs = expectedBulkGetResults.filter(isRight).map(({
      value: {
        type,
        id,
        fields
      }
    }) => ({
      _id: this._serializer.generateRawId(namespace, type, id),
      _index: this.getIndexForType(type),
      _source: (0, _included_fields.includedFields)(type, fields)
    }));
    const bulkGetResponse = bulkGetDocs.length ? await this.client.mget({
      body: {
        docs: bulkGetDocs
      }
    }, {
      ignore: [404]
    }) : undefined;
    return {
      saved_objects: expectedBulkGetResults.map(expectedResult => {
        if (isLeft(expectedResult)) {
          return expectedResult.error;
        }
        const {
          type,
          id,
          opensearchRequestIndex
        } = expectedResult.value;
        const doc = bulkGetResponse === null || bulkGetResponse === void 0 ? void 0 : bulkGetResponse.body.docs[opensearchRequestIndex];

        // @ts-expect-error MultiGetHit._source is optional
        if (!(doc !== null && doc !== void 0 && doc.found) || !this.rawDocExistsInNamespace(doc, namespace)) {
          return {
            id,
            type,
            error: errorContent(_errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id))
          };
        }

        // @ts-expect-error MultiGetHit._source is optional
        return getSavedObjectFromSource(this._registry, type, id, doc);
      })
    };
  }

  /**
   * Gets a single object
   *
   * @param {string} type
   * @param {string} id
   * @param {object} [options={}]
   * @property {string} [options.namespace]
   * @returns {promise} - { id, type, version, attributes }
   */
  async get(type, id, options = {}) {
    if (!this._allowedTypes.includes(type)) {
      throw _errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id);
    }
    const namespace = normalizeNamespace(options.namespace);
    const {
      body,
      statusCode
    } = await this.client.get({
      id: this._serializer.generateRawId(namespace, type, id),
      index: this.getIndexForType(type)
    }, {
      ignore: [404]
    });
    const indexNotFound = statusCode === 404;
    if (!isFoundGetResponse(body) || indexNotFound || !this.rawDocExistsInNamespace(body, namespace)) {
      // see "404s from missing index" above
      throw _errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id);
    }
    const {
      originId,
      updated_at: updatedAt,
      permissions,
      workspaces
    } = body._source;
    let namespaces = [];
    if (!this._registry.isNamespaceAgnostic(type)) {
      var _body$_source$namespa;
      namespaces = (_body$_source$namespa = body._source.namespaces) !== null && _body$_source$namespa !== void 0 ? _body$_source$namespa : [_utils.SavedObjectsUtils.namespaceIdToString(body._source.namespace)];
    }
    return {
      id,
      type,
      namespaces,
      ...(originId && {
        originId
      }),
      ...(updatedAt && {
        updated_at: updatedAt
      }),
      ...(permissions && {
        permissions
      }),
      ...(workspaces && {
        workspaces
      }),
      version: (0, _version.encodeHitVersion)(body),
      attributes: body._source[type],
      references: body._source.references || [],
      migrationVersion: body._source.migrationVersion
    };
  }

  /**
   * Updates an object
   *
   * @param {string} type
   * @param {string} id
   * @param {object} [options={}]
   * @property {string} options.version - ensures version matches that of persisted object
   * @property {string} [options.namespace]
   * @property {array} [options.references] - [{ name, type, id }]
   * @returns {promise}
   */
  async update(type, id, attributes, options = {}) {
    var _body$get$_source, _body$get;
    if (!this._allowedTypes.includes(type)) {
      throw _errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id);
    }
    const {
      version,
      references,
      refresh = DEFAULT_REFRESH_SETTING,
      permissions,
      workspaces
    } = options;
    const namespace = normalizeNamespace(options.namespace);
    let preflightResult;
    if (this._registry.isMultiNamespace(type)) {
      preflightResult = await this.preflightCheckIncludesNamespace(type, id, namespace);
    }
    const time = this._getCurrentTime();
    const doc = {
      [type]: attributes,
      updated_at: time,
      ...(Array.isArray(references) && {
        references
      }),
      ...(permissions && {
        permissions
      }),
      ...(workspaces && {
        workspaces
      })
    };
    const {
      body,
      statusCode
    } = await this.client.update({
      id: this._serializer.generateRawId(namespace, type, id),
      index: this.getIndexForType(type),
      ...getExpectedVersionProperties(version, preflightResult),
      refresh,
      body: {
        doc
      },
      _source_includes: ['namespace', 'namespaces', 'originId']
    }, {
      ignore: [404]
    });
    if (statusCode === 404) {
      // see "404s from missing index" above
      throw _errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id);
    }
    const {
      originId
    } = (_body$get$_source = (_body$get = body.get) === null || _body$get === void 0 ? void 0 : _body$get._source) !== null && _body$get$_source !== void 0 ? _body$get$_source : {};
    let namespaces = [];
    if (!this._registry.isNamespaceAgnostic(type)) {
      var _body$get$_source$nam, _body$get2, _body$get3;
      namespaces = (_body$get$_source$nam = (_body$get2 = body.get) === null || _body$get2 === void 0 ? void 0 : _body$get2._source.namespaces) !== null && _body$get$_source$nam !== void 0 ? _body$get$_source$nam : [_utils.SavedObjectsUtils.namespaceIdToString((_body$get3 = body.get) === null || _body$get3 === void 0 ? void 0 : _body$get3._source.namespace)];
    }
    return {
      id,
      type,
      updated_at: time,
      version: (0, _version.encodeHitVersion)(body),
      namespaces,
      ...(originId && {
        originId
      }),
      ...(permissions && {
        permissions
      }),
      ...(workspaces && {
        workspaces
      }),
      references,
      attributes
    };
  }

  /**
   * Adds one or more namespaces to a given multi-namespace saved object. This method and
   * [`deleteFromNamespaces`]{@link SavedObjectsRepository.deleteFromNamespaces} are the only ways to change which Spaces a multi-namespace
   * saved object is shared to.
   */
  async addToNamespaces(type, id, namespaces, options = {}) {
    if (!this._allowedTypes.includes(type)) {
      throw _errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id);
    }
    if (!this._registry.isMultiNamespace(type)) {
      throw _errors.SavedObjectsErrorHelpers.createBadRequestError(`${type} doesn't support multiple namespaces`);
    }
    if (!namespaces.length) {
      throw _errors.SavedObjectsErrorHelpers.createBadRequestError('namespaces must be a non-empty array of strings');
    }
    const {
      version,
      namespace,
      refresh = DEFAULT_REFRESH_SETTING
    } = options;
    // we do not need to normalize the namespace to its ID format, since it will be converted to a namespace string before being used

    const rawId = this._serializer.generateRawId(undefined, type, id);
    const preflightResult = await this.preflightCheckIncludesNamespace(type, id, namespace);
    const existingNamespaces = getSavedObjectNamespaces(undefined, preflightResult);
    // there should never be a case where a multi-namespace object does not have any existing namespaces
    // however, it is a possibility if someone manually modifies the document in OpenSearch
    const time = this._getCurrentTime();
    const doc = {
      updated_at: time,
      namespaces: existingNamespaces ? unique(existingNamespaces.concat(namespaces)) : namespaces
    };
    const {
      statusCode
    } = await this.client.update({
      id: rawId,
      index: this.getIndexForType(type),
      ...getExpectedVersionProperties(version, preflightResult),
      refresh,
      body: {
        doc
      }
    }, {
      ignore: [404]
    });
    if (statusCode === 404) {
      // see "404s from missing index" above
      throw _errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id);
    }
    return {
      namespaces: doc.namespaces
    };
  }

  /**
   * Removes one or more namespaces from a given multi-namespace saved object. If no namespaces remain, the saved object is deleted
   * entirely. This method and [`addToNamespaces`]{@link SavedObjectsRepository.addToNamespaces} are the only ways to change which Spaces a
   * multi-namespace saved object is shared to.
   */
  async deleteFromNamespaces(type, id, namespaces, options = {}) {
    if (!this._allowedTypes.includes(type)) {
      throw _errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id);
    }
    if (!this._registry.isMultiNamespace(type)) {
      throw _errors.SavedObjectsErrorHelpers.createBadRequestError(`${type} doesn't support multiple namespaces`);
    }
    if (!namespaces.length) {
      throw _errors.SavedObjectsErrorHelpers.createBadRequestError('namespaces must be a non-empty array of strings');
    }
    const {
      namespace,
      refresh = DEFAULT_REFRESH_SETTING
    } = options;
    // we do not need to normalize the namespace to its ID format, since it will be converted to a namespace string before being used

    const rawId = this._serializer.generateRawId(undefined, type, id);
    const preflightResult = await this.preflightCheckIncludesNamespace(type, id, namespace);
    const existingNamespaces = getSavedObjectNamespaces(undefined, preflightResult);
    // if there are somehow no existing namespaces, allow the operation to proceed and delete this saved object
    const remainingNamespaces = existingNamespaces === null || existingNamespaces === void 0 ? void 0 : existingNamespaces.filter(x => !namespaces.includes(x));
    if (remainingNamespaces !== null && remainingNamespaces !== void 0 && remainingNamespaces.length) {
      // if there is 1 or more namespace remaining, update the saved object
      const time = this._getCurrentTime();
      const doc = {
        updated_at: time,
        namespaces: remainingNamespaces
      };
      const {
        statusCode
      } = await this.client.update({
        id: rawId,
        index: this.getIndexForType(type),
        ...getExpectedVersionProperties(undefined, preflightResult),
        refresh,
        body: {
          doc
        }
      }, {
        ignore: [404]
      });
      if (statusCode === 404) {
        // see "404s from missing index" above
        throw _errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id);
      }
      return {
        namespaces: doc.namespaces
      };
    } else {
      // if there are no namespaces remaining, delete the saved object
      const {
        body,
        statusCode
      } = await this.client.delete({
        id: this._serializer.generateRawId(undefined, type, id),
        refresh,
        ...getExpectedVersionProperties(undefined, preflightResult),
        index: this.getIndexForType(type)
      }, {
        ignore: [404]
      });
      const deleted = body.result === 'deleted';
      if (deleted) {
        return {
          namespaces: []
        };
      }
      const deleteDocNotFound = body.result === 'not_found';
      const deleteIndexNotFound = body.error && body.error.type === 'index_not_found_exception';
      if (deleteDocNotFound || deleteIndexNotFound) {
        // see "404s from missing index" above
        throw _errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id);
      }
      throw new Error(`Unexpected OpenSearch DELETE response: ${JSON.stringify({
        type,
        id,
        response: {
          body,
          statusCode
        }
      })}`);
    }
  }

  /**
   * Updates multiple objects in bulk
   *
   * @param {array} objects - [{ type, id, attributes, options: { version, namespace } references }]
   * @property {string} options.version - ensures version matches that of persisted object
   * @property {string} [options.namespace]
   * @returns {promise} -  {saved_objects: [[{ id, type, version, references, attributes, error: { message } }]}
   */
  async bulkUpdate(objects, options = {}) {
    const time = this._getCurrentTime();
    const namespace = normalizeNamespace(options.namespace);
    let bulkGetRequestIndexCounter = 0;
    const expectedBulkGetResults = objects.map(object => {
      const {
        type,
        id
      } = object;
      if (!this._allowedTypes.includes(type)) {
        return {
          tag: 'Left',
          error: {
            id,
            type,
            error: errorContent(_errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id))
          }
        };
      }
      const {
        attributes,
        references,
        version,
        namespace: objectNamespace,
        permissions,
        workspaces
      } = object;
      if (objectNamespace === _utils.ALL_NAMESPACES_STRING) {
        return {
          tag: 'Left',
          error: {
            id,
            type,
            error: errorContent(_errors.SavedObjectsErrorHelpers.createBadRequestError('"namespace" cannot be "*"'))
          }
        };
      }
      // `objectNamespace` is a namespace string, while `namespace` is a namespace ID.
      // The object namespace string, if defined, will supersede the operation's namespace ID.

      const documentToSave = {
        [type]: attributes,
        updated_at: time,
        ...(Array.isArray(references) && {
          references
        }),
        ...(permissions && {
          permissions
        }),
        ...(workspaces && {
          workspaces
        })
      };
      const requiresNamespacesCheck = this._registry.isMultiNamespace(object.type);
      return {
        tag: 'Right',
        value: {
          type,
          id,
          version,
          documentToSave,
          objectNamespace,
          ...(requiresNamespacesCheck && {
            opensearchRequestIndex: bulkGetRequestIndexCounter++
          })
        }
      };
    });
    const getNamespaceId = objectNamespace => objectNamespace !== undefined ? _utils.SavedObjectsUtils.namespaceStringToId(objectNamespace) : namespace;
    const getNamespaceString = objectNamespace => objectNamespace !== null && objectNamespace !== void 0 ? objectNamespace : _utils.SavedObjectsUtils.namespaceIdToString(namespace);
    const bulkGetDocs = expectedBulkGetResults.filter(isRight).filter(({
      value
    }) => value.opensearchRequestIndex !== undefined).map(({
      value: {
        type,
        id,
        objectNamespace
      }
    }) => ({
      _id: this._serializer.generateRawId(getNamespaceId(objectNamespace), type, id),
      _index: this.getIndexForType(type),
      _source: ['type', 'namespaces']
    }));
    const bulkGetResponse = bulkGetDocs.length ? await this.client.mget({
      body: {
        docs: bulkGetDocs
      }
    }, {
      ignore: [404]
    }) : undefined;
    let bulkUpdateRequestIndexCounter = 0;
    const bulkUpdateParams = [];
    const expectedBulkUpdateResults = expectedBulkGetResults.map(expectedBulkGetResult => {
      if (isLeft(expectedBulkGetResult)) {
        return expectedBulkGetResult;
      }
      const {
        opensearchRequestIndex,
        id,
        type,
        version,
        documentToSave,
        objectNamespace
      } = expectedBulkGetResult.value;
      let namespaces;
      let versionProperties;
      if (opensearchRequestIndex !== undefined) {
        var _source$namespaces;
        const indexFound = (bulkGetResponse === null || bulkGetResponse === void 0 ? void 0 : bulkGetResponse.statusCode) !== 404;
        const actualResult = indexFound ? bulkGetResponse === null || bulkGetResponse === void 0 ? void 0 : bulkGetResponse.body.docs[opensearchRequestIndex] : undefined;
        const docFound = indexFound && (actualResult === null || actualResult === void 0 ? void 0 : actualResult.found) === true;
        if (!docFound ||
        // @ts-expect-error MultiGetHit is incorrectly missing _id, _source
        !this.rawDocExistsInNamespace(actualResult, getNamespaceId(objectNamespace))) {
          return {
            tag: 'Left',
            error: {
              id,
              type,
              error: errorContent(_errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id))
            }
          };
        }
        // @ts-expect-error MultiGetHit is incorrectly missing _id, _source
        namespaces = (_source$namespaces = actualResult._source.namespaces) !== null && _source$namespaces !== void 0 ? _source$namespaces : [
        // @ts-expect-error MultiGetHit is incorrectly missing _id, _source
        _utils.SavedObjectsUtils.namespaceIdToString(actualResult._source.namespace)];
        // @ts-expect-error MultiGetHit is incorrectly missing _id, _source
        versionProperties = getExpectedVersionProperties(version, actualResult);
      } else {
        if (this._registry.isSingleNamespace(type)) {
          // if `objectNamespace` is undefined, fall back to `options.namespace`
          namespaces = [getNamespaceString(objectNamespace)];
        }
        versionProperties = getExpectedVersionProperties(version);
      }
      const expectedResult = {
        type,
        id,
        namespaces,
        opensearchRequestIndex: bulkUpdateRequestIndexCounter++,
        documentToSave: expectedBulkGetResult.value.documentToSave
      };
      bulkUpdateParams.push({
        update: {
          _id: this._serializer.generateRawId(getNamespaceId(objectNamespace), type, id),
          _index: this.getIndexForType(type),
          ...versionProperties
        }
      }, {
        doc: documentToSave
      });
      return {
        tag: 'Right',
        value: expectedResult
      };
    });
    const {
      refresh = DEFAULT_REFRESH_SETTING
    } = options;
    const bulkUpdateResponse = bulkUpdateParams.length ? await this.client.bulk({
      refresh,
      body: bulkUpdateParams,
      _source_includes: ['originId']
    }) : undefined;
    return {
      saved_objects: expectedBulkUpdateResults.map(expectedResult => {
        var _bulkUpdateResponse$b;
        if (isLeft(expectedResult)) {
          return expectedResult.error;
        }
        const {
          type,
          id,
          namespaces,
          documentToSave,
          opensearchRequestIndex
        } = expectedResult.value;
        const response = (_bulkUpdateResponse$b = bulkUpdateResponse === null || bulkUpdateResponse === void 0 ? void 0 : bulkUpdateResponse.body.items[opensearchRequestIndex]) !== null && _bulkUpdateResponse$b !== void 0 ? _bulkUpdateResponse$b : {};
        // When a bulk update operation is completed, any fields specified in `_sourceIncludes` will be found in the "get" value of the
        // returned object. We need to retrieve the `originId` if it exists so we can return it to the consumer.
        const {
          error,
          _seq_no: seqNo,
          _primary_term: primaryTerm,
          get
        } = Object.values(response)[0];
        const {
          [type]: attributes,
          references,
          updated_at: updatedAt,
          permissions,
          workspaces
        } = documentToSave;
        if (error) {
          return {
            id,
            type,
            error: getBulkOperationError(error, type, id)
          };
        }
        const {
          originId
        } = get._source;
        return {
          id,
          type,
          ...(namespaces && {
            namespaces
          }),
          ...(originId && {
            originId
          }),
          updated_at: updatedAt,
          version: (0, _version.encodeVersion)(seqNo, primaryTerm),
          attributes,
          references,
          ...(permissions && {
            permissions
          }),
          ...(workspaces && {
            workspaces
          })
        };
      })
    };
  }

  /**
   * Increases a counter field by incrementValue which by default is 1. Creates the document if one doesn't exist for the given id.
   *
   * @param {string} type
   * @param {string} id
   * @param {string} counterFieldName
   * @param {object} [options={}]
   * @param {number} [incrementValue=1]
   * @property {object} [options.migrationVersion=undefined]
   * @returns {promise}
   */
  async incrementCounter(type, id, counterFieldName, options = {}, incrementValue = 1) {
    var _body$get$_source2, _body$get4, _body$get$_source$ref, _body$get5, _body$get6;
    if (typeof type !== 'string') {
      throw new Error('"type" argument must be a string');
    }
    if (typeof counterFieldName !== 'string') {
      throw new Error('"counterFieldName" argument must be a string');
    }
    if (!this._allowedTypes.includes(type)) {
      throw _errors.SavedObjectsErrorHelpers.createUnsupportedTypeError(type);
    }
    const {
      migrationVersion,
      refresh = DEFAULT_REFRESH_SETTING
    } = options;
    const namespace = normalizeNamespace(options.namespace);
    const time = this._getCurrentTime();
    let savedObjectNamespace;
    let savedObjectNamespaces;
    if (this._registry.isSingleNamespace(type) && namespace) {
      savedObjectNamespace = namespace;
    } else if (this._registry.isMultiNamespace(type)) {
      savedObjectNamespaces = await this.preflightGetNamespaces(type, id, namespace);
    }
    const migrated = this._migrator.migrateDocument({
      id,
      type,
      ...(savedObjectNamespace && {
        namespace: savedObjectNamespace
      }),
      ...(savedObjectNamespaces && {
        namespaces: savedObjectNamespaces
      }),
      attributes: {
        [counterFieldName]: incrementValue
      },
      migrationVersion,
      updated_at: time
    });
    const raw = this._serializer.savedObjectToRaw(migrated);
    const {
      body
    } = await this.client.update({
      id: raw._id,
      index: this.getIndexForType(type),
      refresh,
      _source: 'true',
      body: {
        script: {
          source: `
              if (ctx._source[params.type][params.counterFieldName] == null) {
                ctx._source[params.type][params.counterFieldName] = params.count;
              }
              else {
                ctx._source[params.type][params.counterFieldName] += params.count;
              }
              ctx._source.updated_at = params.time;
            `,
          lang: 'painless',
          params: {
            count: incrementValue,
            time,
            type,
            counterFieldName
          }
        },
        upsert: raw._source
      }
    });
    const {
      originId
    } = (_body$get$_source2 = (_body$get4 = body.get) === null || _body$get4 === void 0 ? void 0 : _body$get4._source) !== null && _body$get$_source2 !== void 0 ? _body$get$_source2 : {};
    return {
      id,
      type,
      ...(savedObjectNamespaces && {
        namespaces: savedObjectNamespaces
      }),
      ...(originId && {
        originId
      }),
      updated_at: time,
      references: (_body$get$_source$ref = (_body$get5 = body.get) === null || _body$get5 === void 0 ? void 0 : _body$get5._source.references) !== null && _body$get$_source$ref !== void 0 ? _body$get$_source$ref : [],
      version: (0, _version.encodeHitVersion)(body),
      attributes: (_body$get6 = body.get) === null || _body$get6 === void 0 ? void 0 : _body$get6._source[type]
    };
  }

  /**
   * Returns index specified by the given type or the default index
   *
   * @param type - the type
   */
  getIndexForType(type) {
    return this._registry.getIndex(type) || this._index;
  }

  /**
   * Returns an array of indices as specified in `this._registry` for each of the
   * given `types`. If any of the types don't have an associated index, the
   * default index `this._index` will be included.
   *
   * @param types The types whose indices should be retrieved
   */
  getIndicesForTypes(types) {
    return unique(types.map(t => this.getIndexForType(t)));
  }
  _getCurrentTime() {
    return new Date().toISOString();
  }
  _rawToSavedObject(raw) {
    const savedObject = this._serializer.rawToSavedObject(raw);
    const {
      namespace,
      type
    } = savedObject;
    if (this._registry.isSingleNamespace(type)) {
      savedObject.namespaces = [_utils.SavedObjectsUtils.namespaceIdToString(namespace)];
    }
    return (0, _lodash.omit)(savedObject, 'namespace');
  }

  /**
   * Check to ensure that a raw document exists in a namespace. If the document is not a multi-namespace type, then this returns `true` as
   * we rely on the guarantees of the document ID format. If the document is a multi-namespace type, this checks to ensure that the
   * document's `namespaces` value includes the string representation of the given namespace.
   *
   * WARNING: This should only be used for documents that were retrieved from OpenSearch. Otherwise, the guarantees of the document ID
   * format mentioned above do not apply.
   */
  rawDocExistsInNamespace(raw, namespace) {
    const rawDocType = raw._source.type;

    // if the type is namespace isolated, or namespace agnostic, we can continue to rely on the guarantees
    // of the document ID format and don't need to check this
    if (!this._registry.isMultiNamespace(rawDocType)) {
      return true;
    }
    const namespaces = raw._source.namespaces;
    const existsInNamespace = (namespaces === null || namespaces === void 0 ? void 0 : namespaces.includes(_utils.SavedObjectsUtils.namespaceIdToString(namespace))) || (namespaces === null || namespaces === void 0 ? void 0 : namespaces.includes('*'));
    return existsInNamespace !== null && existsInNamespace !== void 0 ? existsInNamespace : false;
  }

  /**
   * Pre-flight check to get a multi-namespace saved object's included namespaces. This ensures that, if the saved object exists, it
   * includes the target namespace.
   *
   * @param type The type of the saved object.
   * @param id The ID of the saved object.
   * @param namespace The target namespace.
   * @returns Array of namespaces that this saved object currently includes, or (if the object does not exist yet) the namespaces that a
   * newly-created object will include. Value may be undefined if an existing saved object has no namespaces attribute; this should not
   * happen in normal operations, but it is possible if the OpenSearch document is manually modified.
   * @throws Will throw an error if the saved object exists and it does not include the target namespace.
   */
  async preflightGetNamespaces(type, id, namespace) {
    if (!this._registry.isMultiNamespace(type)) {
      throw new Error(`Cannot make preflight get request for non-multi-namespace type '${type}'.`);
    }
    const {
      body,
      statusCode
    } = await this.client.get({
      id: this._serializer.generateRawId(undefined, type, id),
      index: this.getIndexForType(type)
    }, {
      ignore: [404]
    });
    const indexFound = statusCode !== 404;
    if (indexFound && isFoundGetResponse(body)) {
      if (!this.rawDocExistsInNamespace(body, namespace)) {
        throw _errors.SavedObjectsErrorHelpers.createConflictError(type, id);
      }
      return getSavedObjectNamespaces(namespace, body);
    }
    return getSavedObjectNamespaces(namespace);
  }

  /**
   * Pre-flight check for a multi-namespace saved object's namespaces. This ensures that, if the saved object exists, it includes the target
   * namespace.
   *
   * @param type The type of the saved object.
   * @param id The ID of the saved object.
   * @param namespace The target namespace.
   * @returns Raw document from OpenSearch.
   * @throws Will throw an error if the saved object is not found, or if it doesn't include the target namespace.
   */
  async preflightCheckIncludesNamespace(type, id, namespace) {
    if (!this._registry.isMultiNamespace(type)) {
      throw new Error(`Cannot make preflight get request for non-multi-namespace type '${type}'.`);
    }
    const rawId = this._serializer.generateRawId(undefined, type, id);
    const {
      body,
      statusCode
    } = await this.client.get({
      id: rawId,
      index: this.getIndexForType(type)
    }, {
      ignore: [404]
    });
    const indexFound = statusCode !== 404;
    if (!indexFound || !isFoundGetResponse(body) || !this.rawDocExistsInNamespace(body, namespace)) {
      throw _errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id);
    }
    return body;
  }
}
exports.SavedObjectsRepository = SavedObjectsRepository;
function getBulkOperationError(error, type, id) {
  switch (error.type) {
    case 'version_conflict_engine_exception':
      return errorContent(_errors.SavedObjectsErrorHelpers.createConflictError(type, id));
    case 'document_missing_exception':
      return errorContent(_errors.SavedObjectsErrorHelpers.createGenericNotFoundError(type, id));
    default:
      return {
        message: error.reason || JSON.stringify(error)
      };
  }
}

/**
 * Returns an object with the expected version properties. This facilitates OpenSearch's Optimistic Concurrency Control.
 *
 * @param version Optional version specified by the consumer.
 * @param document Optional existing document that was obtained in a preflight operation.
 */
function getExpectedVersionProperties(version, document) {
  if (version) {
    return (0, _version.decodeRequestVersion)(version);
  } else if (document) {
    return {
      if_seq_no: document._seq_no,
      if_primary_term: document._primary_term
    };
  }
  return {};
}

/**
 * Returns a string array of namespaces for a given saved object. If the saved object is undefined, the result is an array that contains the
 * current namespace. Value may be undefined if an existing saved object has no namespaces attribute; this should not happen in normal
 * operations, but it is possible if the OpenSearch document is manually modified.
 *
 * @param namespace The current namespace.
 * @param document Optional existing saved object that was obtained in a preflight operation.
 */
function getSavedObjectNamespaces(namespace, document) {
  if (document) {
    var _document$_source;
    return (_document$_source = document._source) === null || _document$_source === void 0 ? void 0 : _document$_source.namespaces;
  }
  return [_utils.SavedObjectsUtils.namespaceIdToString(namespace)];
}

/**
 * Gets a saved object from a raw OpenSearch document.
 *
 * @param registry Registry which holds the registered saved object types information.
 * @param type The type of the saved object.
 * @param id The ID of the saved object.
 * @param doc Doc contains _source and optional _seq_no and _primary_term.
 *
 * @internal
 */
function getSavedObjectFromSource(registry, type, id, doc) {
  const {
    originId,
    updated_at: updatedAt,
    workspaces,
    permissions
  } = doc._source;
  let namespaces = [];
  if (!registry.isNamespaceAgnostic(type)) {
    var _doc$_source$namespac;
    namespaces = (_doc$_source$namespac = doc._source.namespaces) !== null && _doc$_source$namespac !== void 0 ? _doc$_source$namespac : [_utils.SavedObjectsUtils.namespaceIdToString(doc._source.namespace)];
  }
  return {
    id,
    type,
    namespaces,
    ...(originId && {
      originId
    }),
    ...(updatedAt && {
      updated_at: updatedAt
    }),
    ...(workspaces && {
      workspaces
    }),
    version: (0, _version.encodeHitVersion)(doc),
    attributes: doc._source[type],
    references: doc._source.references || [],
    migrationVersion: doc._source.migrationVersion,
    ...(permissions && {
      permissions
    })
  };
}

/**
 * Ensure that a namespace is always in its namespace ID representation.
 * This allows `'default'` to be used interchangeably with `undefined`.
 */
const normalizeNamespace = namespace => {
  if (namespace === _utils.ALL_NAMESPACES_STRING) {
    throw _errors.SavedObjectsErrorHelpers.createBadRequestError('"options.namespace" cannot be "*"');
  } else if (namespace === undefined) {
    return namespace;
  } else {
    return _utils.SavedObjectsUtils.namespaceStringToId(namespace);
  }
};

/**
 * Extracts the contents of a decorated error to return the attributes for bulk operations.
 */
const errorContent = error => error.output.payload;
const unique = array => [...new Set(array)];

/**
 * Type and type guard function for converting a possibly not existant doc to an existant doc.
 */

const isFoundGetResponse = doc => doc.found;