"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InternalDynamicConfigurationClient = void 0;
var _operators = require("rxjs/operators");
var _utils = require("../utils/utils");
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
var _client = /*#__PURE__*/new WeakMap();
var _logger = /*#__PURE__*/new WeakMap();
var _schemas = /*#__PURE__*/new WeakMap();
var _configService = /*#__PURE__*/new WeakMap();
class InternalDynamicConfigurationClient {
  constructor(props) {
    _classPrivateFieldInitSpec(this, _client, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _logger, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _schemas, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _configService, {
      writable: true,
      value: void 0
    });
    const {
      client,
      logger,
      schemas,
      configService
    } = props;
    _classPrivateFieldSet(this, _client, client);
    _classPrivateFieldSet(this, _schemas, schemas);
    _classPrivateFieldSet(this, _configService, configService);
    _classPrivateFieldSet(this, _logger, logger);
  }
  async getConfig(getConfigProps, options) {
    const namespace = (0, _utils.pathToString)(getConfigProps);
    const defaultConfig = await this.getDefaultConfig(namespace);

    // If this call fails/returns undefined, default to the defaultConfig
    const configStoreConfig = await _classPrivateFieldGet(this, _client).getConfig(namespace, options);
    return configStoreConfig ? (0, _utils.mergeConfigs)(defaultConfig, configStoreConfig) : defaultConfig;
  }
  async bulkGetConfigs(bulkGetConfig, options) {
    const namespaces = bulkGetConfig.paths.map(path => (0, _utils.pathToString)(path));
    const defaultConfigsMap = new Map();

    // TODO Determine whether to pass through or completely fail a bulkGet() call if a namespace does not exist
    for (const namespace of namespaces) {
      const config = await this.getDefaultConfig(namespace);
      defaultConfigsMap.set(namespace, config);
    }

    // If this call fails/returns undefined, default to the defaultConfig
    const configStoreConfig = await _classPrivateFieldGet(this, _client).bulkGetConfigs(namespaces, options);
    if (!configStoreConfig.size) {
      return defaultConfigsMap;
    }
    const finalConfigsMap = new Map([...defaultConfigsMap]);
    configStoreConfig.forEach((newConfig, configName) => {
      const oldConfig = defaultConfigsMap.get(configName);
      if (!oldConfig) {
        _classPrivateFieldGet(this, _logger).warn(`Config ${configName} not found`);
        return defaultConfigsMap;
      }
      const finalConfig = (0, _utils.mergeConfigs)(oldConfig, newConfig);
      finalConfigsMap.set(configName, finalConfig);
    });
    return finalConfigsMap;
  }

  // TODO Determine if the listConfigs() should only list the configs for the config store or ALL configs
  async listConfigs(options) {
    return await _classPrivateFieldGet(this, _client).listConfigs(options);
  }
  async createConfig(createConfigProps, options) {
    // TODO Add validation logic
    return await _classPrivateFieldGet(this, _client).createConfig(createConfigProps, options);
  }
  async bulkCreateConfigs(bulkCreateConfigProps, options) {
    // TODO Add validation logic
    return await _classPrivateFieldGet(this, _client).bulkCreateConfigs(bulkCreateConfigProps, options);
  }
  async deleteConfig(deleteConfigs, options) {
    return await _classPrivateFieldGet(this, _client).deleteConfig(deleteConfigs, options);
  }
  async bulkDeleteConfigs(bulkDeleteConfigProps, options) {
    return await _classPrivateFieldGet(this, _client).bulkDeleteConfigs(bulkDeleteConfigProps, options);
  }

  /**
   * Given the top level config, obtain the top level config from the config store
   *
   * @param namespace The config name to fetch the registered schema
   * @private
   */
  async getDefaultConfig(namespace) {
    const schema = _classPrivateFieldGet(this, _schemas).get(namespace);
    if (!schema) {
      throw new Error(`schema for ${namespace} not found`);
    }
    return await _classPrivateFieldGet(this, _configService).atPath(namespace).pipe((0, _operators.first)()).toPromise();
  }

  /**
   * Returns the entire config as a Map of config names and schema values
   *
   * @private
   *
   * TODO This should only be implemented if listConfigs() will show configs not shown in config store
   * private async getAllDefaultConfigs(): Promise<Map<string, Record<string, any>>> {
   *  const configStore = await this.configService.getConfig$().toPromise();
   *  const configMap = new Map();
   *  Array.from(this.schemas.keys()).map((configName) => {
   *    configMap.set(configName, configStore.get(configName));
   *  });
   *  return configMap;
   * }
   */

  /**
   * TODO Implement validateConfig, which given a config blob and top level config name, validates it against the registered schema
   *  - see {@link ConfigService} validateAtPath() for reference
   *
   * @param configIdentifier
   * @param config
   * @private
   */
}
exports.InternalDynamicConfigurationClient = InternalDynamicConfigurationClient;