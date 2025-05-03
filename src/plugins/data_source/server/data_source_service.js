"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataSourceService = void 0;
var _client = require("./client");
var _legacy = require("./legacy");
var _configure_client = require("./client/configure_client");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class DataSourceService {
  constructor(logger) {
    this.logger = logger;
    _defineProperty(this, "openSearchClientPool", void 0);
    _defineProperty(this, "legacyClientPool", void 0);
    _defineProperty(this, "legacyLogger", void 0);
    this.legacyLogger = logger.get('legacy');
    this.openSearchClientPool = new _client.OpenSearchClientPool(logger);
    this.legacyClientPool = new _client.OpenSearchClientPool(this.legacyLogger);
  }
  async setup(config) {
    const opensearchClientPoolSetup = this.openSearchClientPool.setup(config);
    const legacyClientPoolSetup = this.legacyClientPool.setup(config);
    const getDataSourceClient = async params => {
      return (0, _configure_client.configureClient)(params, opensearchClientPoolSetup, config, this.logger);
    };
    const getDataSourceLegacyClient = params => {
      return {
        callAPI: (endpoint, clientParams, options) => (0, _legacy.configureLegacyClient)(params, {
          endpoint,
          clientParams,
          options
        }, legacyClientPoolSetup, config, this.legacyLogger)
      };
    };
    return {
      getDataSourceClient,
      getDataSourceLegacyClient
    };
  }
  start() {}
  stop() {
    this.openSearchClientPool.stop();
  }
}
exports.DataSourceService = DataSourceService;