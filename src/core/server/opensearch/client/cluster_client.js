"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClusterClient = void 0;
var _http = require("../../http");
var _router = require("../../http/router");
var _configure_client = require("./configure_client");
var _scoped_cluster_client = require("./scoped_cluster_client");
var _default_headers = require("../default_headers");
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
const noop = () => undefined;

/**
 * Represents an OpenSearch cluster API client created by the platform.
 * It allows to call API on behalf of the internal OpenSearch Dashboards user and
 * the actual user that is derived from the request headers (via `asScoped(...)`).
 *
 * @public
 **/

/**
 * See {@link IClusterClient}
 *
 * @public
 */

/** @internal **/
class ClusterClient {
  constructor(config, logger, getAuthHeaders = noop) {
    this.config = config;
    this.getAuthHeaders = getAuthHeaders;
    _defineProperty(this, "asInternalUser", void 0);
    _defineProperty(this, "rootScopedClient", void 0);
    _defineProperty(this, "asInternalUserWithLongNumeralsSupport", void 0);
    _defineProperty(this, "rootScopedClientWithLongNumeralsSupport", void 0);
    _defineProperty(this, "isClosed", false);
    this.asInternalUser = (0, _configure_client.configureClient)(config, {
      logger
    });
    this.rootScopedClient = (0, _configure_client.configureClient)(config, {
      logger,
      scoped: true
    });
    this.asInternalUserWithLongNumeralsSupport = (0, _configure_client.configureClient)(config, {
      logger,
      withLongNumeralsSupport: true
    });
    this.rootScopedClientWithLongNumeralsSupport = (0, _configure_client.configureClient)(config, {
      logger,
      scoped: true,
      withLongNumeralsSupport: true
    });
  }
  asScoped(request) {
    const scopedHeaders = this.getScopedHeaders(request);
    const scopedClient = this.rootScopedClient.child({
      headers: scopedHeaders
    });
    const scopedClientWithLongNumeralsSupport = this.rootScopedClientWithLongNumeralsSupport.child({
      headers: scopedHeaders
    });
    return new _scoped_cluster_client.ScopedClusterClient(this.asInternalUser, scopedClient, this.asInternalUserWithLongNumeralsSupport, scopedClientWithLongNumeralsSupport);
  }
  async close() {
    if (this.isClosed) {
      return;
    }
    this.isClosed = true;
    await Promise.all([this.asInternalUser.close(noop), this.rootScopedClient.close(noop), this.asInternalUserWithLongNumeralsSupport.close(noop), this.rootScopedClientWithLongNumeralsSupport.close(noop)]);
  }
  getScopedHeaders(request) {
    let scopedHeaders;
    if ((0, _http.isRealRequest)(request)) {
      const requestHeaders = (0, _router.ensureRawRequest)(request).headers;
      const requestIdHeaders = (0, _http.isOpenSearchDashboardsRequest)(request) ? {
        'x-opaque-id': request.id
      } : {};
      const authHeaders = this.getAuthHeaders(request);
      scopedHeaders = (0, _router.filterHeaders)({
        ...requestHeaders,
        ...requestIdHeaders,
        ...authHeaders
      }, ['x-opaque-id', ...this.config.requestHeadersWhitelist]);
    } else {
      var _request$headers;
      scopedHeaders = (0, _router.filterHeaders)((_request$headers = request === null || request === void 0 ? void 0 : request.headers) !== null && _request$headers !== void 0 ? _request$headers : {}, this.config.requestHeadersWhitelist);
    }
    return {
      ..._default_headers.DEFAULT_HEADERS,
      ...this.config.customHeaders,
      ...scopedHeaders
    };
  }
}
exports.ClusterClient = ClusterClient;