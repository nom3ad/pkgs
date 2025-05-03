"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthStatus = exports.AuthStateStorage = void 0;
var _router = require("./router");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */ /*
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
/**
 * Status indicating an outcome of the authentication.
 * @public
 */
let AuthStatus = exports.AuthStatus = /*#__PURE__*/function (AuthStatus) {
  AuthStatus["authenticated"] = "authenticated";
  AuthStatus["unauthenticated"] = "unauthenticated";
  AuthStatus["unknown"] = "unknown";
  return AuthStatus;
}({});
/**
 * Gets authentication state for a request. Returned by `auth` interceptor.
 * @param request {@link OpenSearchDashboardsRequest} - an incoming request.
 * @public
 */
/**
 * Returns authentication status for a request.
 * @param request {@link OpenSearchDashboardsRequest} - an incoming request.
 * @public
 */
/** @internal */
class AuthStateStorage {
  constructor(canBeAuthenticated) {
    this.canBeAuthenticated = canBeAuthenticated;
    _defineProperty(this, "storage", new WeakMap());
    _defineProperty(this, "set", (request, state) => {
      this.storage.set((0, _router.ensureRawRequest)(request), state);
    });
    _defineProperty(this, "get", request => {
      const key = (0, _router.ensureRawRequest)(request);
      const state = this.storage.get(key);
      const status = this.storage.has(key) ? AuthStatus.authenticated : this.canBeAuthenticated() ? AuthStatus.unauthenticated : AuthStatus.unknown;
      return {
        status,
        state
      };
    });
    _defineProperty(this, "isAuthenticated", request => {
      return this.get(request).status === AuthStatus.authenticated;
    });
  }
}
exports.AuthStateStorage = AuthStateStorage;