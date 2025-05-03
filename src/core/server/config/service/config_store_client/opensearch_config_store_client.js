"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenSearchConfigStoreClient = void 0;
var _lodash = require("lodash");
var _constants = require("../../utils/constants");
var _utils = require("../../utils/utils");
function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }
function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }
function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }
function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }
function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
var _openSearchClient = /*#__PURE__*/new WeakMap();
var _cache = /*#__PURE__*/new WeakMap();
/**
 * This is the default client DAO when "dynamic_config_service.enabled: true" and no plugin has registered a DAO factory.
 * This client will fetch configs from .opensearch_dashboards_config alias.
 * The alias is important as it will always point to the latest "version" of the config index
 */
class OpenSearchConfigStoreClient {
  constructor(openSearchClient) {
    _classPrivateFieldInitSpec(this, _openSearchClient, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _cache, {
      writable: true,
      value: new Map()
    });
    _classPrivateFieldSet(this, _openSearchClient, openSearchClient);
  }

  /**
   * Inserts the config index and an alias that points to it
   *
   * TODO Add migration logic
   */
  async createDynamicConfigIndex() {
    const existsAliasResponse = await _classPrivateFieldGet(this, _openSearchClient).indices.existsAlias({
      name: _constants.DYNAMIC_APP_CONFIG_ALIAS
    });
    if (!existsAliasResponse.body) {
      const latestVersion = await this.searchLatestConfigIndex();
      if (latestVersion < 1) {
        await _classPrivateFieldGet(this, _openSearchClient).indices.create({
          index: (0, _utils.getDynamicConfigIndexName)(1),
          body: {
            aliases: {
              [_constants.DYNAMIC_APP_CONFIG_ALIAS]: {}
            }
          }
        });
      } else {
        await _classPrivateFieldGet(this, _openSearchClient).indices.updateAliases({
          body: {
            actions: [{
              add: {
                index: (0, _utils.getDynamicConfigIndexName)(latestVersion),
                alias: _constants.DYNAMIC_APP_CONFIG_ALIAS
              }
            }]
          }
        });
      }
    } else {
      const results = await _classPrivateFieldGet(this, _openSearchClient).indices.getAlias({
        name: _constants.DYNAMIC_APP_CONFIG_ALIAS
      });
      const indices = Object.keys(results.body);
      if (indices.length !== 1) {
        throw new Error(`Alias ${_constants.DYNAMIC_APP_CONFIG_ALIAS} is pointing to 0 or multiple indices. Please remove the alias(es) and restart the server`);
      }
      const numNonDynamicConfigIndices = indices.filter(index => !(0, _utils.isDynamicConfigIndex)(index)).length;
      if (numNonDynamicConfigIndices > 0) {
        throw new Error(`Alias ${_constants.DYNAMIC_APP_CONFIG_ALIAS} is pointing to a non dynamic config index. Please remove the alias and restart the server`);
      }
    }
  }
  async getConfig(namespace, options) {
    if (_classPrivateFieldGet(this, _cache).has(namespace)) {
      return _classPrivateFieldGet(this, _cache).get(namespace);
    }
    const result = (await this.searchConfigsRequest([namespace])).body.hits.hits;
    if (result.length <= 0) {
      _classPrivateFieldGet(this, _cache).set(namespace, undefined);
      return undefined;
    }
    const source = result[0]._source;
    this.setCacheFromSearch(result[0]);
    return source === null || source === void 0 ? void 0 : source.config_blob;
  }
  async bulkGetConfigs(namespaces, options) {
    const results = new Map();
    const configsToQuery = namespaces.filter(namespace => {
      const isCached = _classPrivateFieldGet(this, _cache).has(namespace);
      const config = _classPrivateFieldGet(this, _cache).get(namespace);
      if (config) {
        results.set(namespace, config);
      }
      return !isCached;
    });
    if (configsToQuery.length <= 0) {
      return results;
    }
    let nonExistentConfigs = [...configsToQuery];
    const configs = await this.searchConfigsRequest(configsToQuery);
    configs.body.hits.hits.forEach(config => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const {
        config_name,
        config_blob
      } = config._source;
      nonExistentConfigs = nonExistentConfigs.filter(name => name !== config_name);
      if (config_blob) {
        results.set(config_name, config_blob);
      }
      this.setCacheFromSearch(config);
    });

    // Cache results that weren't found
    nonExistentConfigs.forEach(name => {
      _classPrivateFieldGet(this, _cache).set(name, undefined);
    });
    return results;
  }
  async listConfigs(options) {
    // Cannot get from cache since config keys can be missing
    const configs = await _classPrivateFieldGet(this, _openSearchClient).search({
      index: _constants.DYNAMIC_APP_CONFIG_ALIAS,
      body: {
        size: _constants.DYNAMIC_APP_CONFIG_MAX_RESULT_SIZE,
        query: {
          match_all: {}
        }
      }
    });
    const results = new Map(configs.body.hits.hits.filter(config => {
      var _config$_source;
      this.setCacheFromSearch(config);
      return !!((_config$_source = config._source) !== null && _config$_source !== void 0 && _config$_source.config_blob);
    }).map(config => {
      var _config$_source2, _config$_source3;
      return [(_config$_source2 = config._source) === null || _config$_source2 === void 0 ? void 0 : _config$_source2.config_name, (_config$_source3 = config._source) === null || _config$_source3 === void 0 ? void 0 : _config$_source3.config_blob];
    }));
    return results;
  }
  async createConfig(createConfigProps, options) {
    const {
      config
    } = createConfigProps;
    const name = (0, _utils.pathToString)(config);
    return await this.createConfigsRequest(new Map([[name, {
      configBlob: config
    }]]));
  }
  async bulkCreateConfigs(bulkCreateConfigProps, options) {
    return await this.createConfigsRequest(new Map(bulkCreateConfigProps.configs.map(configBlob => {
      const name = (0, _utils.pathToString)(configBlob);
      return [name, {
        configBlob
      }];
    })));
  }
  async deleteConfig(deleteConfigs, options) {
    const name = (0, _utils.pathToString)(deleteConfigs);
    return await this.deleteConfigsRequest([name]);
  }
  async bulkDeleteConfigs(bulkDeleteConfigs, options) {
    const namespaces = bulkDeleteConfigs.paths.map(path => {
      return (0, _utils.pathToString)(path);
    });
    return await this.deleteConfigsRequest(namespaces);
  }
  clearCache() {
    _classPrivateFieldGet(this, _cache).clear();
  }

  /**
   * Adds config names to the cache from search hits
   *
   * @param config
   */
  setCacheFromSearch(config) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const {
      config_blob,
      config_name
    } = config._source;
    _classPrivateFieldGet(this, _cache).set(config_name, config_blob);
  }

  /**
   * Adds config names to the cache from a config document
   *
   * @param config
   */
  setCache(config) {
    _classPrivateFieldGet(this, _cache).set(config.config_name, config.config_blob);
  }

  /**
   * Sends a bulk update/request to create/update the new configs
   *
   * @param configMap config name and config blob key/pair values
   */
  async createConfigsRequest(configMap) {
    const existingConfigs = await this.searchConfigsRequest([...configMap.keys()], true);
    const existingConfigNames = [];

    // Update the existing configs with the new config blob
    const bulkConfigs = existingConfigs.body.hits.hits.flatMap(config => {
      var _config$_source4, _configMap$get;
      const configName = (_config$_source4 = config._source) === null || _config$_source4 === void 0 ? void 0 : _config$_source4.config_name;
      existingConfigNames.push(configName);
      const configBlob = (_configMap$get = configMap.get(configName)) === null || _configMap$get === void 0 ? void 0 : _configMap$get.configBlob.updatedConfig;
      this.setCache({
        ...config._source,
        config_blob: configBlob
      });
      return [{
        update: {
          _id: config._id,
          _index: _constants.DYNAMIC_APP_CONFIG_ALIAS,
          retry_on_conflict: 2,
          routing: '',
          version: config._version + 1,
          version_type: 'external'
        }
      }, {
        doc: {
          // Only need to update the blob
          config_blob: configBlob
        }
      }];
    });

    // Create the rest
    const configsToCreate = [...configMap.keys()].filter(name => !existingConfigNames.includes(name));
    configsToCreate.forEach(name => {
      const {
        configBlob
      } = configMap.get(name);
      const newConfigDocument = {
        config_name: name,
        config_blob: configBlob.updatedConfig
      };
      this.setCache(newConfigDocument);
      bulkConfigs.push({
        create: {
          _id: (0, _lodash.uniqueId)(),
          _index: _constants.DYNAMIC_APP_CONFIG_ALIAS,
          retry_on_conflict: 2,
          routing: '',
          version: 1,
          version_type: 'external'
        }
      }, newConfigDocument);
    });
    return await _classPrivateFieldGet(this, _openSearchClient).bulk({
      index: _constants.DYNAMIC_APP_CONFIG_ALIAS,
      body: bulkConfigs
    });
  }

  /**
   * Deletes documents whose config name matches the query
   *
   * @param namespaces list of config names to search
   * @returns
   */
  async deleteConfigsRequest(namespaces) {
    namespaces.forEach(name => _classPrivateFieldGet(this, _cache).delete(name));
    return await _classPrivateFieldGet(this, _openSearchClient).deleteByQuery({
      index: _constants.DYNAMIC_APP_CONFIG_ALIAS,
      body: {
        query: {
          bool: {
            should: [{
              terms: {
                config_name: namespaces
              }
            }]
          }
        }
      }
    });
  }

  /**
   * Returns documents whose config name matches the query
   *
   * @param namespaces list of config names to search
   * @param excludeConfigBlob whether to include the config blob in the response
   * @returns
   */
  async searchConfigsRequest(namespaces, excludeConfigBlob = false) {
    return await _classPrivateFieldGet(this, _openSearchClient).search({
      ...(excludeConfigBlob && {
        _source: ['config_name']
      }),
      index: _constants.DYNAMIC_APP_CONFIG_ALIAS,
      body: {
        query: {
          bool: {
            should: [{
              terms: {
                config_name: namespaces
              }
            }]
          }
        }
      }
    });
  }

  /**
   * Finds the most updated dynamic config index
   *
   * @returns the latest version number or 0 if not found
   */
  async searchLatestConfigIndex() {
    const configIndices = await _classPrivateFieldGet(this, _openSearchClient).cat.indices({
      index: `${_constants.DYNAMIC_APP_CONFIG_INDEX_PREFIX}_*`,
      format: 'json'
    });
    if (configIndices.body.length < 1) {
      return 0;
    }
    const validIndices = configIndices.body.map(hit => {
      var _hit$index;
      return (_hit$index = hit.index) === null || _hit$index === void 0 ? void 0 : _hit$index.toString();
    }).filter(index => index && (0, _utils.isDynamicConfigIndex)(index));
    return validIndices.length === 0 ? 0 : validIndices.map(configIndex => {
      return configIndex ? (0, _utils.extractVersionFromDynamicConfigIndex)(configIndex) : 0;
    }).reduce((currentMax, currentNum) => {
      return currentMax && currentNum && currentMax > currentNum ? currentMax : currentNum;
    });
  }
}
exports.OpenSearchConfigStoreClient = OpenSearchConfigStoreClient;