"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenSearchDynamicConfigStoreFactory = void 0;
var _opensearch_config_store_client = require("./opensearch_config_store_client");
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
    return new _opensearch_config_store_client.OpenSearchConfigStoreClient(_classPrivateFieldGet2(this, _opensearchClient));
  }
}
exports.OpenSearchDynamicConfigStoreFactory = OpenSearchDynamicConfigStoreFactory;