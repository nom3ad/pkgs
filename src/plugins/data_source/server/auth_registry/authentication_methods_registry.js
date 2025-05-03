"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthenticationMethodRegistry = void 0;
var _std = require("@osd/std");
var _data_sources = require("../../common/data_sources");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
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