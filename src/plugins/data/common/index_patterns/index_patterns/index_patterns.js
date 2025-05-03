"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IndexPatternsService = void 0;
var _i18n = require("@osd/i18n");
var _ = require(".");
var _index_pattern = require("./index_pattern");
var _ensure_default_index_pattern = require("./ensure_default_index_pattern");
var _common = require("../../../common");
var _common2 = require("../../../../opensearch_dashboards_utils/common");
var _lib = require("../lib");
var _utils = require("../utils");
var _errors = require("../errors");
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
const indexPatternCache = (0, _.createIndexPatternCache)();
const MAX_ATTEMPTS_TO_RESOLVE_CONFLICTS = 3;
const savedObjectType = 'index-pattern';
class IndexPatternsService {
  constructor({
    uiSettings,
    savedObjectsClient,
    apiClient,
    fieldFormats,
    onNotification,
    onError,
    onUnsupportedTimePattern,
    onRedirectNoIndexPattern = () => {},
    canUpdateUiSetting
  }) {
    _defineProperty(this, "config", void 0);
    _defineProperty(this, "savedObjectsClient", void 0);
    _defineProperty(this, "savedObjectsCache", void 0);
    _defineProperty(this, "apiClient", void 0);
    _defineProperty(this, "fieldFormats", void 0);
    _defineProperty(this, "onNotification", void 0);
    _defineProperty(this, "onError", void 0);
    _defineProperty(this, "onUnsupportedTimePattern", void 0);
    _defineProperty(this, "ensureDefaultIndexPattern", void 0);
    _defineProperty(this, "getDataSource", async id => {
      return await this.savedObjectsClient.get('data-source', id);
    });
    /**
     * Finds a data source by its title.
     *
     * @param title - The title of the data source to find.
     * @param size - The number of results to return. Defaults to 10.
     * @returns The first matching data source or undefined if not found.
     */
    _defineProperty(this, "findDataSourceByTitle", async (title, size = 10) => {
      const savedObjectsResponse = await this.savedObjectsClient.find({
        type: 'data-source',
        fields: ['title'],
        search: title,
        searchFields: ['title'],
        perPage: size
      });
      return savedObjectsResponse[0] || undefined;
    });
    /**
     * Get list of index pattern ids
     * @param refresh Force refresh of index pattern list
     */
    _defineProperty(this, "getIds", async (refresh = false) => {
      if (!this.savedObjectsCache || refresh) {
        await this.refreshSavedObjectsCache();
      }
      if (!this.savedObjectsCache) {
        return [];
      }
      return this.savedObjectsCache.map(obj => obj === null || obj === void 0 ? void 0 : obj.id);
    });
    /**
     * Get list of index pattern titles
     * @param refresh Force refresh of index pattern list
     */
    _defineProperty(this, "getTitles", async (refresh = false) => {
      if (!this.savedObjectsCache || refresh) {
        await this.refreshSavedObjectsCache();
      }
      if (!this.savedObjectsCache) {
        return [];
      }
      return this.savedObjectsCache.map(obj => {
        var _obj$attributes;
        return obj === null || obj === void 0 || (_obj$attributes = obj.attributes) === null || _obj$attributes === void 0 ? void 0 : _obj$attributes.title;
      });
    });
    /**
     * Get list of index pattern ids with titles
     * @param refresh Force refresh of index pattern list
     */
    _defineProperty(this, "getIdsWithTitle", async (refresh = false) => {
      if (!this.savedObjectsCache || refresh) {
        await this.refreshSavedObjectsCache();
      }
      if (!this.savedObjectsCache) {
        return [];
      }
      return this.savedObjectsCache.map(obj => {
        var _obj$attributes2;
        return {
          id: obj === null || obj === void 0 ? void 0 : obj.id,
          title: obj === null || obj === void 0 || (_obj$attributes2 = obj.attributes) === null || _obj$attributes2 === void 0 ? void 0 : _obj$attributes2.title
        };
      });
    });
    /**
     * Clear index pattern list cache
     * @param id optionally clear a single id
     */
    _defineProperty(this, "clearCache", (id, clearSavedObjectsCache = true) => {
      if (clearSavedObjectsCache) {
        this.savedObjectsCache = null;
      }
      if (id) {
        indexPatternCache.clear(id);
      } else {
        indexPatternCache.clearAll();
      }
    });
    _defineProperty(this, "getCache", async () => {
      if (!this.savedObjectsCache) {
        await this.refreshSavedObjectsCache();
      }
      return this.savedObjectsCache;
    });
    _defineProperty(this, "saveToCache", (id, indexPattern) => {
      indexPatternCache.set(id, indexPattern);
    });
    /**
     * Get default index pattern
     */
    _defineProperty(this, "getDefault", async () => {
      const defaultIndexPatternId = await this.config.get('defaultIndex');
      if (defaultIndexPatternId) {
        return await this.get(defaultIndexPatternId);
      }
      return null;
    });
    /**
     * Optionally set default index pattern, unless force = true
     * @param id
     * @param force
     */
    _defineProperty(this, "setDefault", async (id, force = false) => {
      if (force || !this.config.get('defaultIndex')) {
        await this.config.set('defaultIndex', id);
      }
    });
    /**
     * Get field list by providing { pattern }
     * @param options
     */
    _defineProperty(this, "getFieldsForWildcard", async (options = {}) => {
      const metaFields = await this.config.get(_common.UI_SETTINGS.META_FIELDS);
      return this.apiClient.getFieldsForWildcard({
        pattern: options.pattern,
        metaFields,
        type: options.type,
        params: options.params || {},
        dataSourceId: options.dataSourceId
      });
    });
    /**
     * Get field list by providing an index patttern (or spec)
     * @param options
     */
    _defineProperty(this, "getFieldsForIndexPattern", async (indexPattern, options = {}) => {
      var _indexPattern$dataSou;
      return this.getFieldsForWildcard({
        pattern: indexPattern.title,
        ...options,
        type: indexPattern.type,
        params: indexPattern.typeMeta && indexPattern.typeMeta.params,
        dataSourceId: (_indexPattern$dataSou = indexPattern.dataSourceRef) === null || _indexPattern$dataSou === void 0 ? void 0 : _indexPattern$dataSou.id
      });
    });
    /**
     * Refresh field list for a given index pattern
     * @param indexPattern
     */
    _defineProperty(this, "refreshFields", async (indexPattern, skipType = false) => {
      try {
        const indexPatternCopy = skipType ? {
          ...indexPattern,
          type: undefined
        } : indexPattern;
        const fields = await this.getFieldsForIndexPattern(indexPatternCopy);
        const scripted = indexPattern.getScriptedFields().map(field => field.spec);
        indexPattern.fields.replaceAll([...fields, ...scripted]);
      } catch (err) {
        if (err instanceof _lib.IndexPatternMissingIndices) {
          this.onNotification({
            title: err.message,
            color: 'danger',
            iconType: 'alert'
          });
        }
        this.onError(err, {
          title: _i18n.i18n.translate('data.indexPatterns.fetchFieldErrorTitle', {
            defaultMessage: 'Error fetching fields for index pattern {title} (ID: {id})',
            values: {
              id: indexPattern.id,
              title: indexPattern.title
            }
          })
        });
      }
    });
    /**
     * Refreshes a field list from a spec before an index pattern instance is created
     * @param fields
     * @param id
     * @param title
     * @param options
     */
    _defineProperty(this, "refreshFieldSpecMap", async (fields, id, title, options) => {
      const scriptdFields = Object.values(fields).filter(field => field.scripted);
      try {
        const newFields = await this.getFieldsForWildcard(options);
        return this.fieldArrayToMap([...newFields, ...scriptdFields]);
      } catch (err) {
        if (err instanceof _lib.IndexPatternMissingIndices) {
          this.onNotification({
            title: err.message,
            color: 'danger',
            iconType: 'alert'
          });
          return {};
        }
        this.onError(err, {
          title: _i18n.i18n.translate('data.indexPatterns.fetchFieldErrorTitle', {
            defaultMessage: 'Error fetching fields for index pattern {title} (ID: {id})',
            values: {
              id,
              title
            }
          })
        });
      }
      return fields;
    });
    /**
     * Applies a set of formats to a set of fields
     * @param fieldSpecs
     * @param fieldFormatMap
     */
    _defineProperty(this, "addFormatsToFields", (fieldSpecs, fieldFormatMap) => {
      Object.entries(fieldFormatMap).forEach(([fieldName, value]) => {
        const field = fieldSpecs.find(fld => fld.name === fieldName);
        if (field) {
          field.format = value;
        }
      });
    });
    /**
     * Converts field array to map
     * @param fields
     */
    _defineProperty(this, "fieldArrayToMap", fields => fields.reduce((collector, field) => {
      collector[field.name] = field;
      return collector;
    }, {}));
    /**
     * Converts index pattern saved object to index pattern spec
     * @param savedObject
     */
    _defineProperty(this, "savedObjectToSpec", savedObject => {
      const {
        id,
        version,
        attributes: {
          title,
          timeFieldName,
          intervalName,
          fields,
          sourceFilters,
          fieldFormatMap,
          typeMeta,
          type
        },
        references
      } = savedObject;
      const parsedSourceFilters = sourceFilters ? JSON.parse(sourceFilters) : undefined;
      const parsedTypeMeta = typeMeta ? JSON.parse(typeMeta) : undefined;
      const parsedFieldFormatMap = fieldFormatMap ? JSON.parse(fieldFormatMap) : {};
      const parsedFields = fields ? JSON.parse(fields) : [];
      const dataSourceRef = Array.isArray(references) ? references[0] : undefined;
      this.addFormatsToFields(parsedFields, parsedFieldFormatMap);
      return {
        id,
        version,
        title,
        intervalName,
        timeFieldName,
        sourceFilters: parsedSourceFilters,
        fields: this.fieldArrayToMap(parsedFields),
        typeMeta: parsedTypeMeta,
        type,
        dataSourceRef
      };
    });
    /**
     * Get an index pattern by id. Cache optimized
     * @param id
     * @param onlyCheckCache - Only check cache for index pattern if it doesn't exist it will not error out
     */
    _defineProperty(this, "get", async (id, onlyCheckCache = false) => {
      const cache = indexPatternCache.get(id);
      if (cache || onlyCheckCache) {
        return cache;
      }
      const savedObject = await this.savedObjectsClient.get(savedObjectType, id);
      if (!savedObject.version) {
        throw new _common2.SavedObjectNotFound(savedObjectType, id, 'management/opensearch-dashboards/indexPatterns');
      }
      const spec = this.savedObjectToSpec(savedObject);
      const {
        title,
        type,
        typeMeta,
        dataSourceRef
      } = spec;
      const parsedFieldFormats = savedObject.attributes.fieldFormatMap ? JSON.parse(savedObject.attributes.fieldFormatMap) : {};
      const isFieldRefreshRequired = this.isFieldRefreshRequired(spec.fields);
      let isSaveRequired = isFieldRefreshRequired;
      try {
        spec.fields = isFieldRefreshRequired ? await this.refreshFieldSpecMap(spec.fields || {}, id, spec.title, {
          pattern: title,
          metaFields: await this.config.get(_common.UI_SETTINGS.META_FIELDS),
          type,
          params: typeMeta && typeMeta.params,
          dataSourceId: dataSourceRef === null || dataSourceRef === void 0 ? void 0 : dataSourceRef.id
        }) : spec.fields;
      } catch (err) {
        isSaveRequired = false;
        if (err instanceof _lib.IndexPatternMissingIndices) {
          this.onNotification({
            title: err.message,
            color: 'danger',
            iconType: 'alert'
          });
        } else {
          this.onError(err, {
            title: _i18n.i18n.translate('data.indexPatterns.fetchFieldErrorTitle', {
              defaultMessage: 'Error fetching fields for index pattern {title} (ID: {id})',
              values: {
                id,
                title
              }
            })
          });
        }
      }
      Object.entries(parsedFieldFormats).forEach(([fieldName, value]) => {
        var _spec$fields;
        const field = (_spec$fields = spec.fields) === null || _spec$fields === void 0 ? void 0 : _spec$fields[fieldName];
        if (field) {
          field.format = value;
        }
      });
      const indexPattern = await this.create(spec, true);
      indexPatternCache.set(id, indexPattern);
      if (isSaveRequired) {
        try {
          this.updateSavedObject(indexPattern);
        } catch (err) {
          this.onError(err, {
            title: _i18n.i18n.translate('data.indexPatterns.fetchFieldSaveErrorTitle', {
              defaultMessage: 'Error saving after fetching fields for index pattern {title} (ID: {id})',
              values: {
                id: indexPattern.id,
                title: indexPattern.title
              }
            })
          });
        }
      }
      if (indexPattern.isUnsupportedTimePattern()) {
        this.onUnsupportedTimePattern({
          id: indexPattern.id,
          title: indexPattern.title,
          index: indexPattern.getIndex()
        });
      }
      indexPattern.resetOriginalSavedObjectBody();
      return indexPattern;
    });
    /**
     * Get an index pattern by title if cached
     * @param id
     */
    _defineProperty(this, "getByTitle", (title, ignoreErrors = false) => {
      const indexPattern = indexPatternCache.getByTitle(title);
      if (!indexPattern && !ignoreErrors) {
        throw new _errors.MissingIndexPatternError(`Missing index pattern: ${title}`);
      }
      return indexPattern;
    });
    _defineProperty(this, "find", async (search, size = 10) => {
      const savedObjects = await this.savedObjectsClient.find({
        type: 'index-pattern',
        fields: ['title'],
        search,
        searchFields: ['title'],
        perPage: size
      });
      const getIndexPatternPromises = savedObjects.map(async savedObject => {
        return await this.get(savedObject.id);
      });
      return await Promise.all(getIndexPatternPromises);
    });
    this.apiClient = apiClient;
    this.config = uiSettings;
    this.savedObjectsClient = savedObjectsClient;
    this.fieldFormats = fieldFormats;
    this.onNotification = onNotification;
    this.onError = onError;
    this.onUnsupportedTimePattern = onUnsupportedTimePattern;
    this.ensureDefaultIndexPattern = (0, _ensure_default_index_pattern.createEnsureDefaultIndexPattern)(uiSettings, onRedirectNoIndexPattern, canUpdateUiSetting);
  }

  /**
   * Refresh cache of index pattern ids and titles
   */
  async refreshSavedObjectsCache() {
    this.savedObjectsCache = await this.savedObjectsClient.find({
      type: 'index-pattern',
      fields: ['title'],
      perPage: 10000
    });
    this.savedObjectsCache = await Promise.all(this.savedObjectsCache.map(async obj => {
      // TODO: This behaviour will cause the index pattern title to be resolved differently depending on how its fetched since the get method in this service will not append the datasource title
      if (obj.type === 'index-pattern') {
        const result = {
          ...obj
        };
        result.attributes.title = await (0, _utils.getIndexPatternTitle)(obj.attributes.title, obj.references, this.getDataSource);
        return result;
      } else {
        return obj;
      }
    }));
  }
  isFieldRefreshRequired(specs) {
    if (!specs) {
      return true;
    }
    return Object.values(specs).every(spec => {
      // See https://github.com/elastic/kibana/pull/8421
      const hasFieldCaps = 'aggregatable' in spec && 'searchable' in spec;

      // See https://github.com/elastic/kibana/pull/11969
      const hasDocValuesFlag = ('readFromDocValues' in spec);
      return !hasFieldCaps || !hasDocValuesFlag;
    });
  }
  migrate(indexPattern, newTitle) {
    return this.savedObjectsClient.update(savedObjectType, indexPattern.id, {
      title: newTitle,
      intervalName: null
    }, {
      version: indexPattern.version
    }).then(({
      attributes: {
        title,
        intervalName
      }
    }) => {
      indexPattern.title = title;
      indexPattern.intervalName = intervalName;
    }).then(() => this);
  }

  /**
   * Create a new index pattern instance
   * @param spec
   * @param skipFetchFields
   */
  async create(spec, skipFetchFields = false) {
    const shortDotsEnable = await this.config.get(_common.UI_SETTINGS.SHORT_DOTS_ENABLE);
    const metaFields = await this.config.get(_common.UI_SETTINGS.META_FIELDS);
    const indexPattern = new _index_pattern.IndexPattern({
      spec,
      savedObjectsClient: this.savedObjectsClient,
      fieldFormats: this.fieldFormats,
      shortDotsEnable,
      metaFields
    });
    if (!skipFetchFields) {
      await this.refreshFields(indexPattern);
    }
    return indexPattern;
  }
  /**
   * Create a new index pattern and save it right away
   * @param spec
   * @param override Overwrite if existing index pattern exists
   * @param skipFetchFields
   */

  async createAndSave(spec, override = false, skipFetchFields = false) {
    const indexPattern = await this.create(spec, skipFetchFields);
    await this.createSavedObject(indexPattern, override);
    await this.setDefault(indexPattern.id);
    return indexPattern;
  }

  /**
   * Save a new index pattern
   * @param indexPattern
   * @param override Overwrite if existing index pattern exists
   */

  async createSavedObject(indexPattern, override = false) {
    var _indexPattern$dataSou2;
    const dupe = await (0, _utils.findByTitle)(this.savedObjectsClient, indexPattern.title, (_indexPattern$dataSou2 = indexPattern.dataSourceRef) === null || _indexPattern$dataSou2 === void 0 ? void 0 : _indexPattern$dataSou2.id);
    if (dupe) {
      if (override) {
        await this.delete(dupe.id);
      } else {
        throw new _errors.DuplicateIndexPatternError(`Duplicate index pattern: ${indexPattern.title}`);
      }
    }
    const body = indexPattern.getAsSavedObjectBody();
    const references = indexPattern.getSaveObjectReference();
    const response = await this.savedObjectsClient.create(savedObjectType, body, {
      id: indexPattern.id,
      references
    });
    indexPattern.id = response.id;
    indexPatternCache.set(indexPattern.id, indexPattern);
    return indexPattern;
  }

  /**
   * Save existing index pattern. Will attempt to merge differences if there are conflicts
   * @param indexPattern
   * @param saveAttempts
   */

  async updateSavedObject(indexPattern, saveAttempts = 0, ignoreErrors = false) {
    if (!indexPattern.id) return;

    // get the list of attributes
    const body = indexPattern.getAsSavedObjectBody();
    const originalBody = indexPattern.getOriginalSavedObjectBody();

    // get changed keys
    const originalChangedKeys = [];
    Object.entries(body).forEach(([key, value]) => {
      if (value !== originalBody[key]) {
        originalChangedKeys.push(key);
      }
    });
    return this.savedObjectsClient.update(savedObjectType, indexPattern.id, body, {
      version: indexPattern.version
    }).then(resp => {
      indexPattern.id = resp.id;
      indexPattern.version = resp.version;
    }).catch(async err => {
      var _err$res;
      if ((err === null || err === void 0 || (_err$res = err.res) === null || _err$res === void 0 ? void 0 : _err$res.status) === 409 && saveAttempts++ < MAX_ATTEMPTS_TO_RESOLVE_CONFLICTS) {
        const samePattern = await this.get(indexPattern.id);
        // What keys changed from now and what the server returned
        const updatedBody = samePattern.getAsSavedObjectBody();

        // Build a list of changed keys from the server response
        // and ensure we ignore the key if the server response
        // is the same as the original response (since that is expected
        // if we made a change in that key)

        const serverChangedKeys = [];
        Object.entries(updatedBody).forEach(([key, value]) => {
          if (value !== body[key] && value !== originalBody[key]) {
            serverChangedKeys.push(key);
          }
        });
        let unresolvedCollision = false;
        for (const originalKey of originalChangedKeys) {
          for (const serverKey of serverChangedKeys) {
            if (originalKey === serverKey) {
              unresolvedCollision = true;
              break;
            }
          }
        }
        if (unresolvedCollision) {
          if (ignoreErrors) {
            return;
          }
          const title = _i18n.i18n.translate('data.indexPatterns.unableWriteLabel', {
            defaultMessage: 'Unable to write index pattern! Refresh the page to get the most up to date changes for this index pattern.'
          });
          this.onNotification({
            title,
            color: 'danger'
          });
          throw err;
        }

        // Set the updated response on this object
        serverChangedKeys.forEach(key => {
          indexPattern[key] = samePattern[key];
        });
        indexPattern.version = samePattern.version;

        // Clear cache
        indexPatternCache.clear(indexPattern.id);

        // Try the save again
        return this.updateSavedObject(indexPattern, saveAttempts, ignoreErrors);
      }
      throw err;
    });
  }

  /**
   * Deletes an index pattern from .kibana index
   * @param indexPatternId: Id of OpenSearch Dashboards Index Pattern to delete
   */
  async delete(indexPatternId) {
    indexPatternCache.clear(indexPatternId);
    return this.savedObjectsClient.delete('index-pattern', indexPatternId);
  }
  isLongNumeralsSupported() {
    return this.config.get(_common.UI_SETTINGS.DATA_WITH_LONG_NUMERALS);
  }
}
exports.IndexPatternsService = IndexPatternsService;