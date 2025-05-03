"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenSearchDynamicConfigStoreFactory = void 0;
var _opensearch_config_store_client = require("./opensearch_config_store_client");
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
var _opensearchClient = /*#__PURE__*/new WeakMap();
class OpenSearchDynamicConfigStoreFactory {
  constructor(opensearch) {
    _classPrivateFieldInitSpec(this, _opensearchClient, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet(this, _opensearchClient, opensearch.client.asInternalUser);
  }

  /**
   * TODO Once the OpenSearch client is implemented, finish implementing factory method
   */
  create() {
    return new _opensearch_config_store_client.OpenSearchConfigStoreClient(_classPrivateFieldGet(this, _opensearchClient));
  }
}
exports.OpenSearchDynamicConfigStoreFactory = OpenSearchDynamicConfigStoreFactory;