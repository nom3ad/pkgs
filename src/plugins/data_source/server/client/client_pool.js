"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenSearchClientPool = void 0;
var _lruCache = _interopRequireDefault(require("lru-cache"));
var _data_sources = require("../../common/data_sources");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * OpenSearch client pool for data source.
 *
 * This client pool uses an LRU cache to manage OpenSearch Js client objects.
 * It reuse TPC connections for each OpenSearch endpoint.
 */
class OpenSearchClientPool {
  constructor(logger) {
    this.logger = logger;
    // LRU cache of client
    //   key: data source endpoint
    //   value: OpenSearch client | Legacy client
    _defineProperty(this, "clientCache", void 0);
    // LRU cache of aws clients
    //   key: endpoint + dataSourceId + lastUpdatedTime together to support update case.
    //   value: OpenSearch client | Legacy client
    _defineProperty(this, "awsClientCache", void 0);
    _defineProperty(this, "isClosed", false);
  }
  setup(config) {
    const logger = this.logger;
    const {
      size
    } = config.clientPool;
    const MAX_AGE = 15 * 60 * 1000; // by default, TCP connection times out in 15 minutes

    this.clientCache = new _lruCache.default({
      max: size,
      maxAge: MAX_AGE,
      async dispose(key, client) {
        try {
          await client.close();
        } catch (error) {
          // log and do nothing since we are anyways evicting the client object from cache
          logger.warn(`Error closing OpenSearch client when removing from client pool: ${error.message}`);
        }
      }
    });
    this.logger.info(`Created data source client pool of size ${size}`);

    // aws client specific pool
    this.awsClientCache = new _lruCache.default({
      max: size,
      maxAge: MAX_AGE,
      async dispose(key, client) {
        try {
          await client.close();
        } catch (error) {
          logger.warn(`Error closing OpenSearch client when removing from aws client pool: ${error.message}`);
        }
      }
    });
    this.logger.info(`Created data source aws client pool of size ${size}`);
    const getClientFromPool = (key, authType) => {
      const selectedCache = authType === _data_sources.AuthType.SigV4 ? this.awsClientCache : this.clientCache;
      return selectedCache.get(key);
    };
    const addClientToPool = (key, authType, client) => {
      const selectedCache = authType === _data_sources.AuthType.SigV4 ? this.awsClientCache : this.clientCache;
      if (!(selectedCache !== null && selectedCache !== void 0 && selectedCache.has(key))) {
        return selectedCache.set(key, client);
      }
    };
    return {
      getClientFromPool,
      addClientToPool
    };
  }
  start() {}

  // close all clients in the pool
  async stop() {
    if (this.isClosed) {
      return;
    }
    try {
      await Promise.all([...this.clientCache.values().map(client => client.close()), ...this.awsClientCache.values().map(client => client.close())]);
      this.isClosed = true;
    } catch (error) {
      this.logger.error(`Error closing clients in pool. ${error}`);
    }
  }
}
exports.OpenSearchClientPool = OpenSearchClientPool;