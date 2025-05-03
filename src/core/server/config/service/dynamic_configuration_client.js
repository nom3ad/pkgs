"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DynamicConfigurationClient = void 0;
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet2(e, t) { var r = _classPrivateFieldGet(t, e); return _classApplyDescriptorGet(e, r); }
function _classApplyDescriptorGet(e, t) { return t.get ? t.get.call(e) : t.value; }
function _classPrivateFieldSet(e, t, r) { var s = _classPrivateFieldGet(t, e); return _classApplyDescriptorSet(e, s, r), r; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function _classApplyDescriptorSet(e, t, l) { if (t.set) t.set.call(e, l);else { if (!t.writable) throw new TypeError("attempted to set read only private field"); t.value = l; } }
var _dynamicConfigurationClient = /*#__PURE__*/new WeakMap();
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

class DynamicConfigurationClient {
  constructor(internalDynamicConfigurationClient) {
    _classPrivateFieldInitSpec(this, _dynamicConfigurationClient, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet(this, _dynamicConfigurationClient, internalDynamicConfigurationClient);
  }
  async getConfig(props, options) {
    return _classPrivateFieldGet2(this, _dynamicConfigurationClient).getConfig(props, options);
  }
  async bulkGetConfigs(props, options) {
    return _classPrivateFieldGet2(this, _dynamicConfigurationClient).bulkGetConfigs(props, options);
  }
  async listConfigs(options) {
    return _classPrivateFieldGet2(this, _dynamicConfigurationClient).listConfigs(options);
  }
}
exports.DynamicConfigurationClient = DynamicConfigurationClient;