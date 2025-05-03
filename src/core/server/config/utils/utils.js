"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pathToString = exports.mergeConfigs = exports.isDynamicConfigIndex = exports.getDynamicConfigIndexName = exports.extractVersionFromDynamicConfigIndex = exports.createLocalStoreFromOsdRequest = exports.createLocalStore = exports.createApiResponse = void 0;
var _lodash = _interopRequireDefault(require("lodash"));
var _constants = require("./constants");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Given a configIdentifier:
 *  - if name is provided, convert it from camelCase to snake_case
 *  - if pluginConfigPath is provided (for plugin configs ONLY), convert the ["config", "path"] to config.path
 *
 * @param configIdentifier
 */
const pathToString = configIdentifier => {
  const {
    name,
    pluginConfigPath
  } = configIdentifier;
  if (pluginConfigPath) {
    return Array.isArray(pluginConfigPath) ? pluginConfigPath.join('.') : pluginConfigPath;
  }
  return _lodash.default.snakeCase(name);
};
exports.pathToString = pathToString;
const createApiResponse = (opts = {}) => {
  return {
    body: {},
    statusCode: 200,
    headers: {},
    warnings: [],
    meta: {},
    ...opts
  };
};

/**
 * Given the config from the config file and the config store, merge the two configs.
 *
 * @param defaultConfigs
 * @param configStoreConfigs
 */
exports.createApiResponse = createApiResponse;
const mergeConfigs = (defaultConfigs, configStoreConfigs) => {
  // Ensures that the entire array of the configStoreConfigs overrides existing configs
  const mergeCustomizer = (target, source) => {
    if (_lodash.default.isArray(target)) {
      return source;
    }
  };
  return _lodash.default.mergeWith(defaultConfigs, configStoreConfigs, mergeCustomizer);
};
exports.mergeConfigs = mergeConfigs;
const createLocalStore = (logger, request, headers) => {
  return new Map(headers.map(header => {
    try {
      return [header, request.headers[header]];
    } catch (err) {
      logger.warn(`Header ${header} not found in request`);
      return [header, undefined];
    }
  }));
};
exports.createLocalStore = createLocalStore;
const getDynamicConfigIndexName = n => {
  return `${_constants.DYNAMIC_APP_CONFIG_INDEX_PREFIX}_${n}`;
};

/**
 * Basic check to ensure the index matches the pattern (will pass for ${DYNAMIC_APP_CONFIG_INDEX_PREFIX}_0)
 *
 * @param index
 * @returns
 */
exports.getDynamicConfigIndexName = getDynamicConfigIndexName;
const isDynamicConfigIndex = index => {
  const regex = new RegExp(`^${_constants.DYNAMIC_APP_CONFIG_INDEX_PREFIX}_\\d+$`);
  return regex.test(index);
};
exports.isDynamicConfigIndex = isDynamicConfigIndex;
const extractVersionFromDynamicConfigIndex = index => {
  if (!isDynamicConfigIndex(index)) {
    return 0;
  }
  const indexSuffix = index.replace(`${_constants.DYNAMIC_APP_CONFIG_INDEX_PREFIX}_`, '');
  return Number(indexSuffix);
};
exports.extractVersionFromDynamicConfigIndex = extractVersionFromDynamicConfigIndex;
const createLocalStoreFromOsdRequest = (logger, request, headers) => {
  if (!request.auth.isAuthenticated) {
    return undefined;
  }
  return new Map(headers.map(header => {
    try {
      logger.debug(`${header}: ${request.headers[header]}`);
      return [header, request.headers[header]];
    } catch (err) {
      logger.warn(`Header ${header} not found in request`);
      return [header, undefined];
    }
  }));
};
exports.createLocalStoreFromOsdRequest = createLocalStoreFromOsdRequest;