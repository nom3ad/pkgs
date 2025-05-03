"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenSearchClientPool = void 0;
var _lruCache = _interopRequireDefault(require("lru-cache"));
var _data_sources = require("../../common/data_sources");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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