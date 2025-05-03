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
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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
    const client = core.opensearch.legacy.createClient('opensearch_enhancements', {
      plugins: [_utils.OpenSearchEnhancements]
    });
    if (dataSource) {
      dataSource.registerCustomApiSchema(_utils.OpenSearchEnhancements);
    }
    const pplSearchStrategy = (0, _search.pplSearchStrategyProvider)(this.config$, this.logger, client);
    const pplRawSearchStrategy = (0, _search.pplRawSearchStrategyProvider)(this.config$, this.logger, client);
    const sqlSearchStrategy = (0, _search.sqlSearchStrategyProvider)(this.config$, this.logger, client);
    const sqlAsyncSearchStrategy = (0, _search.sqlAsyncSearchStrategyProvider)(this.config$, this.logger, client);
    const pplAsyncSearchStrategy = (0, _search.pplAsyncSearchStrategyProvider)(this.config$, this.logger, client);
    data.search.registerSearchStrategy(_common.SEARCH_STRATEGY.PPL, pplSearchStrategy);
    data.search.registerSearchStrategy(_common.SEARCH_STRATEGY.PPL_RAW, pplRawSearchStrategy);
    data.search.registerSearchStrategy(_common.SEARCH_STRATEGY.SQL, sqlSearchStrategy);
    data.search.registerSearchStrategy(_common.SEARCH_STRATEGY.SQL_ASYNC, sqlAsyncSearchStrategy);
    data.search.registerSearchStrategy(_common.SEARCH_STRATEGY.PPL_ASYNC, pplAsyncSearchStrategy);
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
    (0, _routes.defineRoutes)(this.logger, router, client, {
      ppl: pplSearchStrategy,
      sql: sqlSearchStrategy,
      sqlasync: sqlAsyncSearchStrategy,
      pplasync: pplAsyncSearchStrategy
    });
    this.logger.info('queryEnhancements: Setup complete');
    return {
      defineSearchStrategyRoute: (0, _routes.defineSearchStrategyRouteProvider)(this.logger, router)
    };
  }
  start(core) {
    this.logger.debug('queryEnhancements: Started');
    return {};
  }
  stop() {}
}
exports.QueryEnhancementsPlugin = QueryEnhancementsPlugin;