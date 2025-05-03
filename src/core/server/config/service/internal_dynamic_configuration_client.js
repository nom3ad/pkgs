"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InternalDynamicConfigurationClient = void 0;
var _operators = require("rxjs/operators");
var _utils = require("../utils/utils");
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet2(e, t) { var r = _classPrivateFieldGet(t, e); return _classApplyDescriptorGet(e, r); }
function _classApplyDescriptorGet(e, t) { return t.get ? t.get.call(e) : t.value; }
function _classPrivateFieldSet(e, t, r) { var s = _classPrivateFieldGet(t, e); return _classApplyDescriptorSet(e, s, r), r; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function _classApplyDescriptorSet(e, t, l) { if (t.set) t.set.call(e, l);else { if (!t.writable) throw new TypeError("attempted to set read only private field"); t.value = l; } } /*
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
    const configStoreConfig = await _classPrivateFieldGet2(this, _client).getConfig(namespace, options);
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
    const configStoreConfig = await _classPrivateFieldGet2(this, _client).bulkGetConfigs(namespaces, options);
    if (!configStoreConfig.size) {
      return defaultConfigsMap;
    }
    const finalConfigsMap = new Map([...defaultConfigsMap]);
    configStoreConfig.forEach((newConfig, configName) => {
      const oldConfig = defaultConfigsMap.get(configName);
      if (!oldConfig) {
        _classPrivateFieldGet2(this, _logger).warn(`Config ${configName} not found`);
        return defaultConfigsMap;
      }
      const finalConfig = (0, _utils.mergeConfigs)(oldConfig, newConfig);
      finalConfigsMap.set(configName, finalConfig);
    });
    return finalConfigsMap;
  }

  // TODO Determine if the listConfigs() should only list the configs for the config store or ALL configs
  async listConfigs(options) {
    return await _classPrivateFieldGet2(this, _client).listConfigs(options);
  }
  async createConfig(createConfigProps, options) {
    // TODO Add validation logic
    return await _classPrivateFieldGet2(this, _client).createConfig(createConfigProps, options);
  }
  async bulkCreateConfigs(bulkCreateConfigProps, options) {
    // TODO Add validation logic
    return await _classPrivateFieldGet2(this, _client).bulkCreateConfigs(bulkCreateConfigProps, options);
  }
  async deleteConfig(deleteConfigs, options) {
    return await _classPrivateFieldGet2(this, _client).deleteConfig(deleteConfigs, options);
  }
  async bulkDeleteConfigs(bulkDeleteConfigProps, options) {
    return await _classPrivateFieldGet2(this, _client).bulkDeleteConfigs(bulkDeleteConfigProps, options);
  }

  /**
   * Given the top level config, obtain the top level config from the config store
   *
   * @param namespace The config name to fetch the registered schema
   * @private
   */
  async getDefaultConfig(namespace) {
    const schema = _classPrivateFieldGet2(this, _schemas).get(namespace);
    if (!schema) {
      throw new Error(`schema for ${namespace} not found`);
    }
    return await _classPrivateFieldGet2(this, _configService).atPath(namespace).pipe((0, _operators.first)()).toPromise();
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