"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SearchService = void 0;
var _rxjs = require("rxjs");
var _lodash = require("lodash");
var _operators = require("rxjs/operators");
var _aggs = require("./aggs");
var _routes = require("./routes");
var _opensearch_search = require("./opensearch_search");
var _register = require("./collectors/register");
var _usage = require("./collectors/usage");
var _saved_objects = require("../saved_objects");
var _search = require("../../common/search");
var _shard_delay = require("../../common/search/aggs/buckets/shard_delay");
var _shard_delay_fn = require("../../common/search/aggs/buckets/shard_delay_fn");
var _common = require("../../common");
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
/** @internal */

/** @internal */

/** @internal */

class SearchService {
  constructor(initializerContext, logger) {
    this.initializerContext = initializerContext;
    this.logger = logger;
    _defineProperty(this, "aggsService", new _aggs.AggsService());
    _defineProperty(this, "searchSourceService", new _search.SearchSourceService());
    _defineProperty(this, "dfCache", (0, _common.createDataFrameCache)());
    _defineProperty(this, "defaultSearchStrategyName", _opensearch_search.OPENSEARCH_SEARCH_STRATEGY);
    _defineProperty(this, "searchStrategies", {});
    _defineProperty(this, "registerSearchStrategy", (name, strategy) => {
      this.searchStrategies[name] = strategy;
    });
    _defineProperty(this, "search", (context, searchRequest, options) => {
      return this.getSearchStrategy(options.strategy || this.defaultSearchStrategyName).search(context, searchRequest, options);
    });
    _defineProperty(this, "getSearchStrategy", name => {
      const strategy = this.searchStrategies[name];
      if (!strategy) {
        throw new Error(`Search strategy ${name} not found`);
      }
      return strategy;
    });
  }
  async setup(core, {
    registerFunction,
    usageCollection,
    dataSource
  }) {
    const config = await this.initializerContext.config.create().pipe((0, _operators.first)()).toPromise();
    const usage = usageCollection ? (0, _usage.usageProvider)(core, config) : undefined;
    const router = core.http.createRouter();
    const routeDependencies = {
      getStartServices: core.getStartServices,
      globalConfig$: this.initializerContext.config.legacy.globalConfig$
    };
    (0, _routes.registerSearchRoute)(router, routeDependencies);
    (0, _routes.registerMsearchRoute)(router, routeDependencies);
    this.registerSearchStrategy(_opensearch_search.OPENSEARCH_SEARCH_STRATEGY, (0, _opensearch_search.opensearchSearchStrategyProvider)(this.initializerContext.config.legacy.globalConfig$, this.logger, usage, dataSource, core.opensearch));
    this.registerSearchStrategy(_search.OPENSEARCH_SEARCH_WITH_LONG_NUMERALS_STRATEGY, (0, _opensearch_search.opensearchSearchStrategyProvider)(this.initializerContext.config.legacy.globalConfig$, this.logger, usage, dataSource, core.opensearch, true));
    core.savedObjects.registerType(_saved_objects.searchTelemetry);
    if (usageCollection) {
      (0, _register.registerUsageCollector)(usageCollection, this.initializerContext);
    }
    const aggs = this.aggsService.setup({
      registerFunction
    });
    this.initializerContext.config.create().pipe((0, _operators.first)()).toPromise().then(value => {
      var _value$search;
      if (value !== null && value !== void 0 && (_value$search = value.search) !== null && _value$search !== void 0 && (_value$search = _value$search.aggs) !== null && _value$search !== void 0 && (_value$search = _value$search.shardDelay) !== null && _value$search !== void 0 && _value$search.enabled) {
        aggs.types.registerBucket(_shard_delay.SHARD_DELAY_AGG_NAME, _shard_delay.getShardDelayBucketAgg);
        registerFunction(_shard_delay_fn.aggShardDelay);
      }
    });
    return {
      __enhance: enhancements => {
        if (!enhancements) return;
        if (this.searchStrategies.hasOwnProperty(enhancements.defaultStrategy)) {
          this.defaultSearchStrategyName = enhancements.defaultStrategy;
        }
      },
      aggs,
      registerSearchStrategy: this.registerSearchStrategy,
      usage
    };
  }
  start({
    opensearch,
    savedObjects,
    uiSettings
  }, {
    fieldFormats,
    indexPatterns
  }) {
    return {
      aggs: this.aggsService.start({
        fieldFormats,
        uiSettings
      }),
      getSearchStrategy: this.getSearchStrategy,
      search: (context, searchRequest, options) => {
        return this.search(context, searchRequest, options);
      },
      searchSource: {
        asScoped: async request => {
          const opensearchClient = opensearch.client.asScoped(request);
          const savedObjectsClient = savedObjects.getScopedClient(request);
          const scopedIndexPatterns = await indexPatterns.indexPatternsServiceFactory(request);
          const uiSettingsClient = uiSettings.asScopedToClient(savedObjectsClient);

          // cache ui settings, only including items which are explicitly needed by SearchSource
          const uiSettingsCache = (0, _lodash.pick)(await uiSettingsClient.getAll(), _search.searchSourceRequiredUiSettings);
          const dfService = {
            get: () => this.dfCache.get(),
            set: dataFrame => {
              this.dfCache.set(dataFrame);
            },
            clear: () => {
              if (this.dfCache.get() === undefined) return;
              this.dfCache.clear();
            }
          };
          const searchSourceDependencies = {
            getConfig: key => uiSettingsCache[key],
            search: (searchRequest, options) => {
              /**
               * Unless we want all SearchSource users to provide both a OpenSearchDashboardsRequest
               * (needed for index patterns) AND the RequestHandlerContext (needed for
               * low-level search), we need to fake the context as it can be derived
               * from the request object anyway. This will pose problems for folks who
               * are registering custom search strategies as they are only getting a
               * subset of the entire context. Ideally low-level search should be
               * refactored to only require the needed dependencies: opensearchClient & uiSettings.
               */
              const fakeRequestHandlerContext = {
                core: {
                  opensearch: {
                    client: opensearchClient
                  },
                  uiSettings: {
                    client: uiSettingsClient
                  }
                }
              };
              return this.search(fakeRequestHandlerContext, searchRequest, options);
            },
            // onResponse isn't used on the server, so we just return the original value
            onResponse: (req, res) => res,
            legacy: {
              callMsearch: (0, _routes.getCallMsearch)({
                opensearchClient,
                globalConfig$: this.initializerContext.config.legacy.globalConfig$,
                uiSettings: uiSettingsClient
              }),
              loadingCount$: new _rxjs.BehaviorSubject(0)
            },
            df: dfService
          };
          return this.searchSourceService.start(scopedIndexPatterns, searchSourceDependencies);
        }
      }
    };
  }
  stop() {
    this.aggsService.stop();
  }
}
exports.SearchService = SearchService;