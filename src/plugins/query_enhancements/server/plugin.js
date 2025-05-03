"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueryEnhancementsPlugin = void 0;
var _operators = require("rxjs/operators");
var _common = require("../common");
var _routes = require("./routes");
var _search = require("./search");
var _utils = require("./utils");
var _ppl_raw_search_strategy = require("./search/ppl_raw_search_strategy");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class QueryEnhancementsPlugin {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "config$", void 0);
    this.logger = initializerContext.logger.get();
    this.config$ = initializerContext.config.legacy.globalConfig$;
  }
  setup(core, {
    data,
    dataSource
  }) {
    this.logger.debug('queryEnhancements: Setup');
    const router = core.http.createRouter();
    // Register server side APIs
    const client = core.opensearch.legacy.createClient('opensearch_observability', {
      plugins: [_utils.OpenSearchPPLPlugin, _utils.OpenSearchObservabilityPlugin]
    });
    if (dataSource) {
      dataSource.registerCustomApiSchema(_utils.OpenSearchPPLPlugin);
      dataSource.registerCustomApiSchema(_utils.OpenSearchObservabilityPlugin);
    }
    const pplSearchStrategy = (0, _search.pplSearchStrategyProvider)(this.config$, this.logger, client);
    const pplRawSearchStrategy = (0, _ppl_raw_search_strategy.pplRawSearchStrategyProvider)(this.config$, this.logger, client);
    const sqlSearchStrategy = (0, _search.sqlSearchStrategyProvider)(this.config$, this.logger, client);
    const sqlAsyncSearchStrategy = (0, _search.sqlAsyncSearchStrategyProvider)(this.config$, this.logger, client);
    data.search.registerSearchStrategy(_common.SEARCH_STRATEGY.PPL, pplSearchStrategy);
    data.search.registerSearchStrategy(_common.SEARCH_STRATEGY.PPL_RAW, pplRawSearchStrategy);
    data.search.registerSearchStrategy(_common.SEARCH_STRATEGY.SQL, sqlSearchStrategy);
    data.search.registerSearchStrategy(_common.SEARCH_STRATEGY.SQL_ASYNC, sqlAsyncSearchStrategy);
    core.http.registerRouteHandlerContext('query_assist', () => ({
      logger: this.logger,
      configPromise: this.initializerContext.config.create().pipe((0, _operators.first)()).toPromise(),
      dataSourceEnabled: !!dataSource
    }));
    core.http.registerRouteHandlerContext('data_source_connection', () => ({
      logger: this.logger,
      configPromise: this.initializerContext.config.create().pipe((0, _operators.first)()).toPromise(),
      dataSourceEnabled: !!dataSource
    }));
    (0, _routes.defineRoutes)(this.logger, router, {
      ppl: pplSearchStrategy,
      sql: sqlSearchStrategy,
      sqlasync: sqlAsyncSearchStrategy
    });
    this.logger.info('queryEnhancements: Setup complete');
    return {};
  }
  start(core) {
    this.logger.debug('queryEnhancements: Started');
    return {};
  }
  stop() {}
}
exports.QueryEnhancementsPlugin = QueryEnhancementsPlugin;