"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchSourceRequiredUiSettings = exports.SearchSource = void 0;
var _saferLodashSet = require("@elastic/safer-lodash-set");
var _std = require("@osd/std");
var _lodash = require("lodash");
var _normalize_sort_request = require("./normalize_sort_request");
var _filter_docvalue_fields = require("./filter_docvalue_fields");
var _common = require("../../../../opensearch_dashboards_utils/common");
var _data_frames = require("../../data_frames");
var _fetch = require("./fetch");
var _common2 = require("../../../common");
var _field_formats = require("../../../common/field_formats");
var _legacy = require("./legacy");
var _extract_references = require("./extract_references");
var _helpers = require("../../utils/helpers");
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
 */ /**
 * @name SearchSource
 *
 * @description A promise-based stream of search results that can inherit from other search sources.
 *
 * Because filters/queries in OpenSearch Dashboards have different levels of persistence and come from different
 * places, it is important to keep track of where filters come from for when they are saved back to
 * the savedObject store in the OpenSearch Dashboards index. To do this, we create trees of searchSource objects
 * that can have associated query parameters (index, query, filter, etc) which can also inherit from
 * other searchSource objects.
 *
 * At query time, all of the searchSource objects that have subscribers are "flattened", at which
 * point the query params from the searchSource are collected while traversing up the inheritance
 * chain. At each link in the chain a decision about how to merge the query params is made until a
 * single set of query parameters is created for each active searchSource (a searchSource with
 * subscribers).
 *
 * That set of query parameters is then sent to OpenSearch. This is how the filter hierarchy
 * works in OpenSearch Dashboards.
 *
 * Visualize, starting from a new search:
 *
 *  - the `savedVis.searchSource` is set as the `appSearchSource`.
 *  - The `savedVis.searchSource` would normally inherit from the `appSearchSource`, but now it is
 *    upgraded to inherit from the `rootSearchSource`.
 *  - Any interaction with the visualization will still apply filters to the `appSearchSource`, so
 *    they will be stored directly on the `savedVis.searchSource`.
 *  - Any interaction with the time filter will be written to the `rootSearchSource`, so those
 *    filters will not be saved by the `savedVis`.
 *  - When the `savedVis` is saved to OpenSearch, it takes with it all the filters that are
 *    defined on it directly, but none of the ones that it inherits from other places.
 *
 * Visualize, starting from an existing search:
 *
 *  - The `savedVis` loads the `savedSearch` on which it is built.
 *  - The `savedVis.searchSource` is set to inherit from the `saveSearch.searchSource` and set as
 *    the `appSearchSource`.
 *  - The `savedSearch.searchSource`, is set to inherit from the `rootSearchSource`.
 *  - Then the `savedVis` is written to OpenSearch it will be flattened and only include the
 *    filters created in the visualize application and will reconnect the filters from the
 *    `savedSearch` at runtime to prevent losing the relationship
 *
 * Dashboard search sources:
 *
 *  - Each panel in a dashboard has a search source.
 *  - The `savedDashboard` also has a searchsource, and it is set as the `appSearchSource`.
 *  - Each panel's search source inherits from the `appSearchSource`, meaning that they inherit from
 *    the dashboard search source.
 *  - When a filter is added to the search box, or via a visualization, it is written to the
 *    `appSearchSource`.
 */
/** @internal */
const searchSourceRequiredUiSettings = exports.searchSourceRequiredUiSettings = ['dateFormat:tz', _common2.UI_SETTINGS.COURIER_BATCH_SEARCHES, _common2.UI_SETTINGS.COURIER_CUSTOM_REQUEST_PREFERENCE, _common2.UI_SETTINGS.COURIER_IGNORE_FILTER_IF_FIELD_NOT_IN_INDEX, _common2.UI_SETTINGS.COURIER_MAX_CONCURRENT_SHARD_REQUESTS, _common2.UI_SETTINGS.COURIER_SET_REQUEST_PREFERENCE, _common2.UI_SETTINGS.DOC_HIGHLIGHT, _common2.UI_SETTINGS.META_FIELDS, _common2.UI_SETTINGS.QUERY_ALLOW_LEADING_WILDCARDS, _common2.UI_SETTINGS.QUERY_STRING_OPTIONS, _common2.UI_SETTINGS.SEARCH_INCLUDE_FROZEN, _common2.UI_SETTINGS.SORT_OPTIONS, _common2.UI_SETTINGS.QUERY_DATAFRAME_HYDRATION_STRATEGY, _common2.UI_SETTINGS.SEARCH_INCLUDE_ALL_FIELDS];
/** @public **/
class SearchSource {
  constructor(fields = {}, dependencies) {
    _defineProperty(this, "id", (0, _lodash.uniqueId)('data_source'));
    _defineProperty(this, "searchStrategyId", void 0);
    _defineProperty(this, "parent", void 0);
    _defineProperty(this, "requestStartHandlers", []);
    _defineProperty(this, "inheritOptions", {});
    _defineProperty(this, "history", []);
    _defineProperty(this, "fields", void 0);
    _defineProperty(this, "dependencies", void 0);
    this.fields = fields;
    this.dependencies = dependencies;
  }

  /** ***
   * PUBLIC API
   *****/

  /**
   * internal, dont use
   * @param searchStrategyId
   */
  setPreferredSearchStrategyId(searchStrategyId) {
    this.searchStrategyId = searchStrategyId;
  }

  /**
   * sets value to a single search source feild
   * @param field: field name
   * @param value: value for the field
   */
  setField(field, value) {
    if (value == null) {
      delete this.fields[field];
    } else {
      this.fields[field] = value;
    }
    return this;
  }

  /**
   * Internal, do not use. Overrides all search source fields with the new field array.
   *
   * @private
   * @param newFields New field array.
   */
  setFields(newFields) {
    this.fields = newFields;
    return this;
  }

  /**
   * returns search source id
   */
  getId() {
    return this.id;
  }

  /**
   * returns all search source fields
   */
  getFields() {
    return {
      ...this.fields
    };
  }

  /**
   * Gets a single field from the fields
   */
  getField(field, recurse = true) {
    if (!recurse || this.fields[field] !== void 0) {
      return this.fields[field];
    }
    const parent = this.getParent();
    return parent && parent.getField(field);
  }

  /**
   * Get the field from our own fields, don't traverse up the chain
   */
  getOwnField(field) {
    return this.getField(field, false);
  }

  /**
   * @deprecated Don't use.
   */
  create() {
    return new SearchSource({}, this.dependencies);
  }

  /**
   * creates a copy of this search source (without its children)
   */
  createCopy() {
    const newSearchSource = new SearchSource({}, this.dependencies);
    newSearchSource.setFields({
      ...this.fields
    });
    // when serializing the internal fields we lose the internal classes used in the index
    // pattern, so we have to set it again to workaround this behavior
    newSearchSource.setField('index', this.getField('index'));
    newSearchSource.setParent(this.getParent());
    return newSearchSource;
  }

  /**
   * creates a new child search source
   * @param options
   */
  createChild(options = {}) {
    const childSearchSource = new SearchSource({}, this.dependencies);
    childSearchSource.setParent(this, options);
    return childSearchSource;
  }

  /**
   * Set a searchSource that this source should inherit from
   * @param  {SearchSource} parent - the parent searchSource
   * @param  {SearchSourceOptions} options - the inherit options
   * @return {this} - chainable
   */
  setParent(parent, options = {}) {
    this.parent = parent;
    this.inheritOptions = options;
    return this;
  }

  /**
   * Get the parent of this SearchSource
   * @return {undefined|searchSource}
   */
  getParent() {
    return this.parent;
  }

  /**
   * Get the data frame of this SearchSource
   * @return {undefined|IDataFrame}
   */
  getDataFrame() {
    return this.dependencies.df.get();
  }

  /**
   * Set the data frame of this SearchSource
   *
   * @async
   * @return {undefined|IDataFrame}
   */
  async setDataFrame(dataFrame) {
    if (dataFrame) {
      await this.dependencies.df.set(dataFrame);
    } else {
      this.destroyDataFrame();
    }
    return this.getDataFrame();
  }

  /**
   * Create and set the data frame of this SearchSource
   *
   * @async
   * @return {undefined|IDataFrame}
   */
  async createDataFrame(searchRequest) {
    const dataFrame = (0, _data_frames.createDataFrame)({
      name: searchRequest.index.title || searchRequest.index,
      fields: []
    });
    await this.setDataFrame(dataFrame);
    return this.getDataFrame();
  }

  /**
   * Clear the data frame of this SearchSource
   */
  destroyDataFrame() {
    this.dependencies.df.clear();
  }

  /**
   * Fetch this source and reject the returned Promise on error
   *
   * @async
   */
  async fetch(options = {}) {
    const {
      getConfig
    } = this.dependencies;
    await this.requestIsStarting(options);
    const searchRequest = await this.flatten();
    this.history = [searchRequest];
    let response;
    if (getConfig(_common2.UI_SETTINGS.COURIER_BATCH_SEARCHES)) {
      response = await this.legacyFetch(searchRequest, options);
    } else if (this.isUnsupportedRequest(searchRequest)) {
      response = await this.fetchExternalSearch(searchRequest, options);
    } else {
      var _indexPattern$dataSou;
      const indexPattern = this.getField('index');
      searchRequest.dataSourceId = indexPattern === null || indexPattern === void 0 || (_indexPattern$dataSou = indexPattern.dataSourceRef) === null || _indexPattern$dataSou === void 0 ? void 0 : _indexPattern$dataSou.id;
      response = await this.fetchSearch(searchRequest, options);
    }

    // TODO: Remove casting when https://github.com/elastic/elasticsearch-js/issues/1287 is resolved
    if (response.error) {
      throw new _fetch.RequestFailure(null, response);
    }
    return response;
  }

  /**
   *  Add a handler that will be notified whenever requests start
   *  @param  {Function} handler
   *  @return {undefined}
   */
  onRequestStart(handler) {
    this.requestStartHandlers.push(handler);
  }

  /**
   * Returns body contents of the search request, often referred as query DSL.
   */
  async getSearchRequestBody() {
    const searchRequest = await this.flatten();
    return searchRequest.body;
  }

  /**
   * Completely destroy the SearchSource.
   * @return {undefined}
   */
  destroy() {
    this.requestStartHandlers.length = 0;
  }

  /** ****
   * PRIVATE APIS
   ******/

  /**
   * Run a search using the search service
   * @return {Promise<SearchResponse<unknown>>}
   */
  fetchSearch(searchRequest, options) {
    const {
      search,
      getConfig,
      onResponse
    } = this.dependencies;
    const params = (0, _fetch.getSearchParamsFromRequest)(searchRequest, {
      getConfig,
      getDataFrame: this.getDataFrame.bind(this),
      destroyDataFrame: this.destroyDataFrame.bind(this)
    });
    return search({
      params,
      indexType: searchRequest.indexType,
      dataSourceId: searchRequest.dataSourceId
    }, options).then(response => onResponse(searchRequest, response.rawResponse));
  }

  /**
   * Run a non-native search using the search service
   * @return {Promise<SearchResponse<unknown>>}
   */
  async fetchExternalSearch(searchRequest, options) {
    var _searchRequest$index;
    const {
      search,
      getConfig,
      onResponse
    } = this.dependencies;
    const currentDataframe = this.getDataFrame();
    if (!currentDataframe || currentDataframe.name !== ((_searchRequest$index = searchRequest.index) === null || _searchRequest$index === void 0 ? void 0 : _searchRequest$index.id)) {
      await this.createDataFrame(searchRequest);
    }
    const params = (0, _fetch.getExternalSearchParamsFromRequest)(searchRequest, {
      getConfig
    });
    return search({
      params
    }, options).then(async response => {
      if (response.hasOwnProperty('type')) {
        if (response.type === _data_frames.DATA_FRAME_TYPES.DEFAULT) {
          const dataFrameResponse = response;
          await this.setDataFrame(dataFrameResponse.body);
          return onResponse(searchRequest, (0, _data_frames.convertResult)(response));
        }
        if (response.type === _data_frames.DATA_FRAME_TYPES.POLLING) {
          const startTime = Date.now();
          const {
            status
          } = response;
          let results;
          if (status === 'success') {
            results = response;
          } else if (status === 'started') {
            const {
              body: {
                queryStatusConfig
              }
            } = response;
            if (!queryStatusConfig) {
              throw new Error('Cannot poll results for undefined query status config');
            }
            results = await (0, _helpers.handleQueryResults)({
              pollQueryResults: async () => search({
                params: {
                  ...params,
                  pollQueryResultsParams: {
                    ...queryStatusConfig
                  }
                }
              }, options),
              queryId: queryStatusConfig.queryId
            });
          } else {
            throw new Error('Invalid query state');
          }
          const elapsedMs = Date.now() - startTime;
          results.took = elapsedMs;
          await this.setDataFrame(results.body);
          return onResponse(searchRequest, (0, _data_frames.convertResult)(results));
        }
        if (response.type === _data_frames.DATA_FRAME_TYPES.ERROR) {
          const dataFrameError = response;
          throw new _fetch.RequestFailure(null, dataFrameError);
        }
      }
      return onResponse(searchRequest, response.rawResponse);
    });
  }

  /**
   * Run a search using the search service
   * @return {Promise<SearchResponse<unknown>>}
   */
  async legacyFetch(searchRequest, options) {
    const {
      getConfig,
      legacy,
      onResponse
    } = this.dependencies;
    return await (0, _legacy.fetchSoon)(searchRequest, {
      ...(this.searchStrategyId && {
        searchStrategyId: this.searchStrategyId
      }),
      ...options
    }, {
      getConfig,
      onResponse,
      legacy
    });
  }
  isUnsupportedRequest(request) {
    return request.body.query.hasOwnProperty('type') && request.body.query.type === 'unsupported';
  }

  /**
   *  Called by requests of this search source when they are started
   *  @param options
   *  @return {Promise<undefined>}
   */
  requestIsStarting(options = {}) {
    const handlers = [...this.requestStartHandlers];
    // If callParentStartHandlers has been set to true, we also call all
    // handlers of parent search sources.
    if (this.inheritOptions.callParentStartHandlers) {
      let searchSource = this.getParent();
      while (searchSource) {
        handlers.push(...searchSource.requestStartHandlers);
        searchSource = searchSource.getParent();
      }
    }
    return Promise.all(handlers.map(fn => fn(this, options)));
  }

  /**
   * Used to merge properties into the data within ._flatten().
   * The data is passed in and modified by the function
   *
   * @param  {object} data - the current merged data
   * @param  {*} val - the value at `key`
   * @param  {*} key - The key of `val`
   * @return {undefined}
   */
  mergeProp(data, val, key) {
    val = typeof val === 'function' ? val(this) : val;
    if (val == null || !key) return;
    const addToRoot = (rootKey, value) => {
      data[rootKey] = value;
    };

    /**
     * Add the key and val to the body of the request
     */
    const addToBody = (bodyKey, value) => {
      // ignore if we already have a value
      if (data.body[bodyKey] == null) {
        data.body[bodyKey] = value;
      }
    };
    const {
      getConfig
    } = this.dependencies;
    switch (key) {
      case 'filter':
        return addToRoot('filters', (data.filters || []).concat(val));
      case 'query':
        return addToRoot(key, (data[key] || []).concat(val));
      case 'fields':
        const fields = (0, _lodash.uniq)((data[key] || []).concat(val));
        return addToRoot(key, fields);
      case 'index':
      case 'type':
      case 'highlightAll':
        return key && data[key] == null && addToRoot(key, val);
      case 'searchAfter':
        return addToBody('search_after', val);
      case 'source':
        return addToBody('_source', val);
      case 'sort':
        const sort = (0, _normalize_sort_request.normalizeSortRequest)(val, this.getField('index'), getConfig(_common2.UI_SETTINGS.SORT_OPTIONS));
        return addToBody(key, sort);
      default:
        return addToBody(key, val);
    }
  }

  /**
   * Walk the inheritance chain of a source and return its
   * flat representation (taking into account merging rules)
   * @returns {Promise}
   * @resolved {Object|null} - the flat data of the SearchSource
   */
  mergeProps(root = this, searchRequest = {
    body: {}
  }) {
    Object.entries(this.fields).forEach(([key, value]) => {
      this.mergeProp(searchRequest, value, key);
    });
    if (this.parent) {
      this.parent.mergeProps(root, searchRequest);
    }
    return searchRequest;
  }
  getIndexType(index) {
    if (this.searchStrategyId) {
      return this.searchStrategyId === 'default' ? undefined : this.searchStrategyId;
    } else {
      return index === null || index === void 0 ? void 0 : index.type;
    }
  }
  flatten() {
    const searchRequest = this.mergeProps();
    const {
      getConfig
    } = this.dependencies;
    searchRequest.body = searchRequest.body || {};
    const {
      body,
      index,
      fields,
      query,
      filters,
      highlightAll
    } = searchRequest;
    searchRequest.indexType = this.getIndexType(index);
    const computedFields = index ? index.getComputedFields() : {};
    body.stored_fields = computedFields.storedFields;
    body.script_fields = body.script_fields || {};
    if (getConfig(_common2.UI_SETTINGS.SEARCH_INCLUDE_ALL_FIELDS)) {
      body.fields = ['*'];
    }
    (0, _lodash.extend)(body.script_fields, computedFields.scriptFields);
    const defaultDocValueFields = computedFields.docvalueFields ? computedFields.docvalueFields : [];
    body.docvalue_fields = body.docvalue_fields || defaultDocValueFields;
    if (!body.hasOwnProperty('_source') && index) {
      body._source = index.getSourceFiltering();
    }
    if (body._source) {
      // exclude source fields for this index pattern specified by the user
      const filter = (0, _common.fieldWildcardFilter)(body._source.excludes, getConfig(_common2.UI_SETTINGS.META_FIELDS));
      body.docvalue_fields = body.docvalue_fields.filter(docvalueField => filter(docvalueField.field));
    }

    // if we only want to search for certain fields
    if (fields) {
      // filter out the docvalue_fields, and script_fields to only include those that we are concerned with
      body.docvalue_fields = (0, _filter_docvalue_fields.filterDocvalueFields)(body.docvalue_fields, fields);
      body.script_fields = (0, _lodash.pick)(body.script_fields, fields);

      // request the remaining fields from both stored_fields and _source
      const remainingFields = (0, _lodash.difference)(fields, (0, _lodash.keys)(body.script_fields));
      body.stored_fields = remainingFields;
      (0, _saferLodashSet.setWith)(body, '_source.includes', remainingFields, nsValue => (0, _lodash.isObject)(nsValue) ? {} : nsValue);
    }
    const opensearchQueryConfigs = (0, _common2.getOpenSearchQueryConfig)({
      get: getConfig
    });
    body.query = (0, _common2.buildOpenSearchQuery)(index, query, filters, opensearchQueryConfigs);
    if (highlightAll && body.query) {
      body.highlight = (0, _field_formats.getHighlightRequest)(body.query, getConfig(_common2.UI_SETTINGS.DOC_HIGHLIGHT));
      delete searchRequest.highlightAll;
    }
    return searchRequest;
  }

  /**
   * serializes search source fields (which can later be passed to {@link ISearchStartSearchSource})
   */
  getSerializedFields() {
    const {
      filter: originalFilters,
      ...searchSourceFields
    } = (0, _lodash.omit)(this.getFields(), ['sort', 'size']);
    let serializedSearchSourceFields = {
      ...searchSourceFields,
      index: searchSourceFields.index ? searchSourceFields.index.id : undefined
    };
    if (originalFilters) {
      const filters = this.getFilters(originalFilters);
      serializedSearchSourceFields = {
        ...serializedSearchSourceFields,
        filter: filters
      };
    }
    return serializedSearchSourceFields;
  }

  /**
   * Serializes the instance to a JSON string and a set of referenced objects.
   * Use this method to get a representation of the search source which can be stored in a saved object.
   *
   * The references returned by this function can be mixed with other references in the same object,
   * however make sure there are no name-collisions. The references will be named `kibanaSavedObjectMeta.searchSourceJSON.index`
   * and `kibanaSavedObjectMeta.searchSourceJSON.filter[<number>].meta.index`.
   *
   * Using `createSearchSource`, the instance can be re-created.
   * @public */
  serialize() {
    const [searchSourceFields, references] = (0, _extract_references.extractReferences)(this.getSerializedFields());
    return {
      searchSourceJSON: (0, _std.stringify)(searchSourceFields),
      references
    };
  }
  getFilters(filterField) {
    if (!filterField) {
      return [];
    }
    if (Array.isArray(filterField)) {
      return filterField;
    }
    if ((0, _lodash.isFunction)(filterField)) {
      return this.getFilters(filterField());
    }
    return [filterField];
  }
}
exports.SearchSource = SearchSource;