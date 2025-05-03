"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DummyConfigStoreClient = void 0;
var _utils = require("../../utils/utils");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The DummyConfigStoreClient is the client DAO that will used when dynamic config service is "disabled".
 * The client will return nothing, which will cause the dynamic config service to return static configs only.
 * It is important to note that the DynamicConfigService will always exist as it's a core service.
 */
class DummyConfigStoreClient {
  async listConfigs(options) {
    return Promise.resolve(new Map());
  }
  async bulkCreateConfigs(bulkCreateConfigProps, options) {
    return Promise.resolve((0, _utils.createApiResponse)());
  }
  async createConfig(createConfigProps, options) {
    return Promise.resolve((0, _utils.createApiResponse)());
  }
  async bulkDeleteConfigs(bulkDeleteConfigs, options) {
    return Promise.resolve((0, _utils.createApiResponse)());
  }
  async deleteConfig(deleteConfigs, options) {
    return Promise.resolve((0, _utils.createApiResponse)());
  }
  async getConfig(namespace, options) {
    return Promise.resolve(undefined);
  }
  async bulkGetConfigs(namespaces, options) {
    return Promise.resolve(new Map());
  }
}
exports.DummyConfigStoreClient = DummyConfigStoreClient;