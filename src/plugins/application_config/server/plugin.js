"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ApplicationConfigPlugin = void 0;
var _operators = require("rxjs/operators");
var _lruCache = _interopRequireDefault(require("lru-cache"));
var _routes = require("./routes");
var _opensearch_config_client = require("./opensearch_config_client");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class ApplicationConfigPlugin {
  constructor(initializerContext) {
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "config$", void 0);
    _defineProperty(this, "configurationClient", void 0);
    _defineProperty(this, "configurationIndexName", void 0);
    _defineProperty(this, "clusterClient", void 0);
    _defineProperty(this, "cache", void 0);
    this.logger = initializerContext.logger.get();
    this.config$ = initializerContext.config.legacy.globalConfig$;
    this.configurationIndexName = '';
    this.clusterClient = null;
    this.cache = new _lruCache.default({
      max: 100,
      // at most 100 entries
      maxAge: 10 * 60 * 1000 // 10 mins
    });
  }

  registerConfigurationClient(configurationClient) {
    this.logger.info('Register a configuration client.');
    if (this.configurationClient) {
      const errorMessage = 'Configuration client is already registered! Cannot register again!';
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    this.configurationClient = configurationClient;
  }
  getConfigurationClient(request) {
    if (this.configurationClient) {
      return this.configurationClient;
    }
    const openSearchConfigurationClient = new _opensearch_config_client.OpenSearchConfigurationClient(this.clusterClient.asScoped(request), this.configurationIndexName, this.logger, this.cache);
    return openSearchConfigurationClient;
  }
  async setup(core) {
    const router = core.http.createRouter();
    const config = await this.config$.pipe((0, _operators.first)()).toPromise();
    this.configurationIndexName = config.opensearchDashboards.configIndex;

    // Register server side APIs
    (0, _routes.defineRoutes)(router, this.getConfigurationClient.bind(this), this.logger);
    return {
      getConfigurationClient: this.getConfigurationClient.bind(this),
      registerConfigurationClient: this.registerConfigurationClient.bind(this)
    };
  }
  start(core) {
    this.clusterClient = core.opensearch.client;
    return {};
  }
  stop() {}
}
exports.ApplicationConfigPlugin = ApplicationConfigPlugin;