"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LegacyClusterClient = void 0;
var _elasticsearch = require("elasticsearch");
var _lodash = require("lodash");
var _errors = require("./errors");
var _http = require("../../http");
var _router = require("../../http/router");
var _opensearch_client_config = require("./opensearch_client_config");
var _scoped_cluster_client = require("./scoped_cluster_client");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
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
 * Support Legacy platform request for the period of migration.
 *
 * @public
 */

const noop = () => undefined;

/**
 * Calls the OpenSearch API endpoint with the specified parameters.
 * @param client Raw OpenSearch JS client instance to use.
 * @param endpoint Name of the API endpoint to call.
 * @param clientParams Parameters that will be directly passed to the
 * OpenSearch JS client.
 * @param options Options that affect the way we call the API and process the result.
 */
const callAPI = async (client, endpoint, clientParams = {}, options = {
  wrap401Errors: true
}) => {
  const clientPath = endpoint.split('.');
  const api = (0, _lodash.get)(client, clientPath);
  if (!api) {
    throw new Error(`called with an invalid endpoint: ${endpoint}`);
  }
  const apiContext = clientPath.length === 1 ? client : (0, _lodash.get)(client, clientPath.slice(0, -1));
  try {
    return await new Promise((resolve, reject) => {
      const request = api.call(apiContext, clientParams);
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          request.abort();
          reject(new Error('Request was aborted'));
        });
      }
      return request.then(resolve, reject);
    });
  } catch (err) {
    if (!options.wrap401Errors || err.statusCode !== 401) {
      throw err;
    }
    throw _errors.LegacyOpenSearchErrorHelpers.decorateNotAuthorizedError(err);
  }
};

/**
 * Represents an OpenSearch cluster API client created by the platform.
 * It allows to call API on behalf of the internal OpenSearch Dashboards user and
 * the actual user that is derived from the request headers (via `asScoped(...)`).
 *
 * See {@link LegacyClusterClient}.
 *
 * @deprecated Use {@link IClusterClient}.
 * @public
 */

/**
 * Represents an OpenSearch cluster API client created by a plugin.
 * It allows to call API on behalf of the internal OpenSearch Dashboards user and
 * the actual user that is derived from the request headers (via `asScoped(...)`).
 *
 * See {@link LegacyClusterClient}.
 * @deprecated Use {@link ICustomClusterClient}.
 * @public
 */

/**
 * {@inheritDoc IClusterClient}
 * @deprecated Use {@link IClusterClient}.
 * @public
 */
class LegacyClusterClient {
  constructor(config, log, getAuditorFactory, getAuthHeaders = noop) {
    this.config = config;
    this.log = log;
    this.getAuditorFactory = getAuditorFactory;
    this.getAuthHeaders = getAuthHeaders;
    /**
     * Raw OpenSearch JS client that acts on behalf of the OpenSearch Dashboards internal user.
     */
    _defineProperty(this, "client", void 0);
    /**
     * Optional raw OpenSearch JS client that is shared between all the scoped clients created
     * from this cluster client. Every API call is attributed by the wh
     */
    _defineProperty(this, "scopedClient", void 0);
    /**
     * Indicates whether this cluster client (and all internal raw OpenSearch JS clients) has been closed.
     */
    _defineProperty(this, "isClosed", false);
    /**
     * Calls specified endpoint with provided clientParams on behalf of the
     * OpenSearch Dashboards internal user.
     * See {@link LegacyAPICaller}.
     *
     * @param endpoint - String descriptor of the endpoint e.g. `cluster.getSettings` or `ping`.
     * @param clientParams - A dictionary of parameters that will be passed directly to the OpenSearch JS client.
     * @param options - Options that affect the way we call the API and process the result.
     */
    _defineProperty(this, "callAsInternalUser", async (endpoint, clientParams = {}, options) => {
      this.assertIsNotClosed();
      return await callAPI.bind(null, this.client)(endpoint, clientParams, options);
    });
    /**
     * Calls specified endpoint with provided clientParams on behalf of the
     * user initiated request to the OpenSearch Dashboards server (via HTTP request headers).
     * See {@link LegacyAPICaller}.
     *
     * @param endpoint - String descriptor of the endpoint e.g. `cluster.getSettings` or `ping`.
     * @param clientParams - A dictionary of parameters that will be passed directly to the OpenSearch JS client.
     * @param options - Options that affect the way we call the API and process the result.
     */
    _defineProperty(this, "callAsCurrentUser", async (endpoint, clientParams = {}, options) => {
      this.assertIsNotClosed();
      return await callAPI.bind(null, this.scopedClient)(endpoint, clientParams, options);
    });
    this.client = new _elasticsearch.Client((0, _opensearch_client_config.parseOpenSearchClientConfig)(config, log));
  }
  /**
   * Closes the cluster client. After that client cannot be used and one should
   * create a new client instance to be able to interact with OpenSearch API.
   */
  close() {
    if (this.isClosed) {
      return;
    }
    this.isClosed = true;
    this.client.close();
    if (this.scopedClient !== undefined) {
      this.scopedClient.close();
    }
  }

  /**
   * Creates an instance of {@link ILegacyScopedClusterClient} based on the configuration the
   * current cluster client that exposes additional `callAsCurrentUser` method
   * scoped to the provided req. Consumers shouldn't worry about closing
   * scoped client instances, these will be automatically closed as soon as the
   * original cluster client isn't needed anymore and closed.
   *
   * @param request - Request the `IScopedClusterClient` instance will be scoped to.
   * Supports request optionality, Legacy.Request & FakeRequest for BWC with LegacyPlatform
   */
  asScoped(request) {
    // It'd have been quite expensive to create and configure client for every incoming
    // request since it involves parsing of the config, reading of the SSL certificate and
    // key files etc. Moreover scoped client needs two OpenSearch JS clients at the same
    // time: one to support `callAsInternalUser` and another one for `callAsCurrentUser`.
    // To reduce that overhead we create one scoped client per cluster client and share it
    // between all scoped client instances.
    if (this.scopedClient === undefined) {
      this.scopedClient = new _elasticsearch.Client((0, _opensearch_client_config.parseOpenSearchClientConfig)(this.config, this.log, {
        auth: false,
        ignoreCertAndKey: !this.config.ssl || !this.config.ssl.alwaysPresentCertificate
      }));
    }
    return new _scoped_cluster_client.LegacyScopedClusterClient(this.callAsInternalUser, this.callAsCurrentUser, (0, _router.filterHeaders)(this.getHeaders(request), ['x-opaque-id', ...this.config.requestHeadersWhitelist]), this.getScopedAuditor(request));
  }
  getScopedAuditor(request) {
    // TODO: support alternative credential owners from outside of Request context in #39430
    if (request && (0, _http.isRealRequest)(request)) {
      const opensearchDashboardsRequest = (0, _http.isOpenSearchDashboardsRequest)(request) ? request : _http.OpenSearchDashboardsRequest.from(request);
      const auditorFactory = this.getAuditorFactory();
      return auditorFactory.asScoped(opensearchDashboardsRequest);
    }
  }
  assertIsNotClosed() {
    if (this.isClosed) {
      throw new Error('Cluster client cannot be used after it has been closed.');
    }
  }
  getHeaders(request) {
    if (!(0, _http.isRealRequest)(request)) {
      return request && request.headers ? request.headers : {};
    }
    const authHeaders = this.getAuthHeaders(request);
    const requestHeaders = (0, _router.ensureRawRequest)(request).headers;
    const requestIdHeaders = (0, _http.isOpenSearchDashboardsRequest)(request) ? {
      'x-opaque-id': request.id
    } : {};
    return {
      ...requestHeaders,
      ...requestIdHeaders,
      ...authHeaders
    };
  }
}
exports.LegacyClusterClient = LegacyClusterClient;