"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ApplicationConfigPlugin = void 0;
var _operators = require("rxjs/operators");
var _lruCache = _interopRequireDefault(require("lru-cache"));
var _routes = require("./routes");
var _opensearch_config_client = require("./opensearch_config_client");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
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