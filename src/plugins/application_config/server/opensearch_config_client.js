"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenSearchConfigurationClient = void 0;
var _string_utils = require("./string_utils");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class OpenSearchConfigurationClient {
  constructor(scopedClusterClient, configurationIndexName, logger, cache) {
    _defineProperty(this, "client", void 0);
    _defineProperty(this, "configurationIndexName", void 0);
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "cache", void 0);
    this.client = scopedClusterClient;
    this.configurationIndexName = configurationIndexName;
    this.logger = logger;
    this.cache = cache;
  }
  async getEntityConfig(entity) {
    const entityValidated = (0, _string_utils.validate)(entity, this.logger);
    if (this.cache.has(entityValidated)) {
      return this.cache.get(entityValidated);
    }
    this.logger.info(`Key ${entityValidated} is not found from cache.`);
    try {
      var _data$body;
      const data = await this.client.asInternalUser.get({
        index: this.configurationIndexName,
        id: entityValidated
      });
      const value = data === null || data === void 0 || (_data$body = data.body) === null || _data$body === void 0 || (_data$body = _data$body._source) === null || _data$body === void 0 ? void 0 : _data$body.value;
      this.cache.set(entityValidated, value);
      return value;
    } catch (e) {
      const errorMessage = `Failed to get entity ${entityValidated} due to error ${e}`;
      this.logger.error(errorMessage);
      this.cache.set(entityValidated, undefined);
      throw e;
    }
  }
  async updateEntityConfig(entity, newValue) {
    const entityValidated = (0, _string_utils.validate)(entity, this.logger);
    const newValueValidated = (0, _string_utils.validate)(newValue, this.logger);
    try {
      await this.client.asCurrentUser.index({
        index: this.configurationIndexName,
        id: entityValidated,
        body: {
          value: newValueValidated
        }
      });
      this.cache.set(entityValidated, newValueValidated);
      return newValueValidated;
    } catch (e) {
      const errorMessage = `Failed to update entity ${entityValidated} with newValue ${newValueValidated} due to error ${e}`;
      this.logger.error(errorMessage);
      throw e;
    }
  }
  async deleteEntityConfig(entity) {
    const entityValidated = (0, _string_utils.validate)(entity, this.logger);
    try {
      await this.client.asCurrentUser.delete({
        index: this.configurationIndexName,
        id: entityValidated
      });
      this.cache.del(entityValidated);
      return entityValidated;
    } catch (e) {
      var _e$body, _e$body2;
      if ((e === null || e === void 0 || (_e$body = e.body) === null || _e$body === void 0 || (_e$body = _e$body.error) === null || _e$body === void 0 ? void 0 : _e$body.type) === 'index_not_found_exception') {
        this.logger.info('Attemp to delete a not found index.');
        this.cache.del(entityValidated);
        return entityValidated;
      }
      if ((e === null || e === void 0 || (_e$body2 = e.body) === null || _e$body2 === void 0 ? void 0 : _e$body2.result) === 'not_found') {
        this.logger.info('Attemp to delete a not found document.');
        this.cache.del(entityValidated);
        return entityValidated;
      }
      const errorMessage = `Failed to delete entity ${entityValidated} due to error ${e}`;
      this.logger.error(errorMessage);
      throw e;
    }
  }
  async getConfig() {
    try {
      const data = await this.client.asInternalUser.search({
        index: this.configurationIndexName
      });
      return this.transformIndexSearchResponse(data.body.hits.hits);
    } catch (e) {
      const errorMessage = `Failed to call getConfig due to error ${e}`;
      this.logger.error(errorMessage);
      throw e;
    }
  }
  transformIndexSearchResponse(hits) {
    const configurations = {};
    for (let i = 0; i < hits.length; i++) {
      var _doc$_source;
      const doc = hits[i];
      configurations[doc._id] = doc === null || doc === void 0 || (_doc$_source = doc._source) === null || _doc$_source === void 0 ? void 0 : _doc$_source.value;
    }
    return configurations;
  }
}
exports.OpenSearchConfigurationClient = OpenSearchConfigurationClient;