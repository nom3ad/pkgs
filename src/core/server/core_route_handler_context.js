"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoreRouteHandlerContext = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldSet(e, t, r) { var s = _classPrivateFieldGet2(t, e); return _classApplyDescriptorSet(e, s, r), r; }
function _classApplyDescriptorSet(e, t, l) { if (t.set) t.set.call(e, l);else { if (!t.writable) throw new TypeError("attempted to set read only private field"); t.value = l; } }
function _classPrivateFieldGet(e, t) { var r = _classPrivateFieldGet2(t, e); return _classApplyDescriptorGet(e, r); }
function _classPrivateFieldGet2(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function _classApplyDescriptorGet(e, t) { return t.get ? t.get.call(e) : t.value; }
var _client = /*#__PURE__*/new WeakMap();
var _legacy = /*#__PURE__*/new WeakMap();
/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// eslint-disable-next-line max-classes-per-file

class CoreOpenSearchRouteHandlerContext {
  constructor(opensearchStart, request) {
    this.opensearchStart = opensearchStart;
    this.request = request;
    _classPrivateFieldInitSpec(this, _client, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _legacy, {
      writable: true,
      value: void 0
    });
  }
  get client() {
    if (_classPrivateFieldGet(this, _client) == null) {
      _classPrivateFieldSet(this, _client, this.opensearchStart.client.asScoped(this.request));
    }
    return _classPrivateFieldGet(this, _client);
  }
  get legacy() {
    if (_classPrivateFieldGet(this, _legacy) == null) {
      _classPrivateFieldSet(this, _legacy, {
        client: this.opensearchStart.legacy.client.asScoped(this.request)
      });
    }
    return _classPrivateFieldGet(this, _legacy);
  }
}
var _scopedSavedObjectsClient = /*#__PURE__*/new WeakMap();
var _typeRegistry = /*#__PURE__*/new WeakMap();
class CoreSavedObjectsRouteHandlerContext {
  constructor(savedObjectsStart, request) {
    this.savedObjectsStart = savedObjectsStart;
    this.request = request;
    _classPrivateFieldInitSpec(this, _scopedSavedObjectsClient, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _typeRegistry, {
      writable: true,
      value: void 0
    });
  }
  get client() {
    if (_classPrivateFieldGet(this, _scopedSavedObjectsClient) == null) {
      _classPrivateFieldSet(this, _scopedSavedObjectsClient, this.savedObjectsStart.getScopedClient(this.request));
    }
    return _classPrivateFieldGet(this, _scopedSavedObjectsClient);
  }
  get typeRegistry() {
    if (_classPrivateFieldGet(this, _typeRegistry) == null) {
      _classPrivateFieldSet(this, _typeRegistry, this.savedObjectsStart.getTypeRegistry());
    }
    return _classPrivateFieldGet(this, _typeRegistry);
  }
}
var _client2 = /*#__PURE__*/new WeakMap();
class CoreUiSettingsRouteHandlerContext {
  constructor(uiSettingsStart, savedObjectsRouterHandlerContext) {
    this.uiSettingsStart = uiSettingsStart;
    this.savedObjectsRouterHandlerContext = savedObjectsRouterHandlerContext;
    _classPrivateFieldInitSpec(this, _client2, {
      writable: true,
      value: void 0
    });
  }
  get client() {
    if (_classPrivateFieldGet(this, _client2) == null) {
      _classPrivateFieldSet(this, _client2, this.uiSettingsStart.asScopedToClient(this.savedObjectsRouterHandlerContext.client));
    }
    return _classPrivateFieldGet(this, _client2);
  }
}
var _client3 = /*#__PURE__*/new WeakMap();
var _asyncLocalStore = /*#__PURE__*/new WeakMap();
class CoreDynamicConfigRouteHandlerContext {
  constructor(dynamicConfigServiceStart) {
    this.dynamicConfigServiceStart = dynamicConfigServiceStart;
    _classPrivateFieldInitSpec(this, _client3, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _asyncLocalStore, {
      writable: true,
      value: void 0
    });
  }
  get client() {
    _classPrivateFieldSet(this, _client3, this.dynamicConfigServiceStart.getClient());
    return _classPrivateFieldGet(this, _client3);
  }
  get asyncLocalStore() {
    _classPrivateFieldSet(this, _asyncLocalStore, this.dynamicConfigServiceStart.getAsyncLocalStore());
    return _classPrivateFieldGet(this, _asyncLocalStore);
  }
}
var _auditor = /*#__PURE__*/new WeakMap();
class CoreRouteHandlerContext {
  constructor(coreStart, request) {
    this.coreStart = coreStart;
    this.request = request;
    _classPrivateFieldInitSpec(this, _auditor, {
      writable: true,
      value: void 0
    });
    _defineProperty(this, "opensearch", void 0);
    _defineProperty(this, "savedObjects", void 0);
    _defineProperty(this, "uiSettings", void 0);
    _defineProperty(this, "dynamicConfig", void 0);
    this.opensearch = new CoreOpenSearchRouteHandlerContext(this.coreStart.opensearch, this.request);
    this.savedObjects = new CoreSavedObjectsRouteHandlerContext(this.coreStart.savedObjects, this.request);
    this.uiSettings = new CoreUiSettingsRouteHandlerContext(this.coreStart.uiSettings, this.savedObjects);
    this.dynamicConfig = new CoreDynamicConfigRouteHandlerContext(this.coreStart.dynamicConfig);
  }
  get auditor() {
    if (_classPrivateFieldGet(this, _auditor) == null) {
      _classPrivateFieldSet(this, _auditor, this.coreStart.auditTrail.asScoped(this.request));
    }
    return _classPrivateFieldGet(this, _auditor);
  }
}
exports.CoreRouteHandlerContext = CoreRouteHandlerContext;