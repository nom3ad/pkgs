"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthenticationMethodRegistry = void 0;
var _std = require("@osd/std");
var _data_sources = require("../../common/data_sources");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class AuthenticationMethodRegistry {
  constructor() {
    _defineProperty(this, "authMethods", new Map());
  }
  /**
   * Register a authMethods with function to return credentials inside the registry.
   * Authentication Method can only be registered once. subsequent calls with the same method name will throw an error.
   */
  registerAuthenticationMethod(method) {
    if (method.name === _data_sources.AuthType.NoAuth || method.name === _data_sources.AuthType.UsernamePasswordType || method.name === _data_sources.AuthType.SigV4) {
      throw new Error(`Must not be no_auth or username_password or sigv4 for registered auth types`);
    }
    if (this.authMethods.has(method.name)) {
      throw new Error(`Authentication method '${method.name}' is already registered`);
    }
    this.authMethods.set(method.name, (0, _std.deepFreeze)(method));
  }
  getAllAuthenticationMethods() {
    return [...this.authMethods.values()];
  }
  getAuthenticationMethod(name) {
    return this.authMethods.get(name);
  }
}
exports.AuthenticationMethodRegistry = AuthenticationMethodRegistry;