"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DummyDynamicConfigStoreFactory = void 0;
var _dummy_config_store_client = require("./dummy_config_store_client");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

class DummyDynamicConfigStoreFactory {
  create() {
    return new _dummy_config_store_client.DummyConfigStoreClient();
  }
}
exports.DummyDynamicConfigStoreFactory = DummyDynamicConfigStoreFactory;