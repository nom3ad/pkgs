"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ensureRawRequest = exports.OpenSearchDashboardsRequest = void 0;
exports.isOpenSearchDashboardsRequest = isOpenSearchDashboardsRequest;
exports.isRealRequest = isRealRequest;
var _uuid = _interopRequireDefault(require("uuid"));
var _rxjs = require("rxjs");
var _operators = require("rxjs/operators");
var _std = require("@osd/std");
var _route = require("./route");
var _socket = require("./socket");
var _validator = require("./validator");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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
const requestSymbol = Symbol('request');

/**
 * @internal
 */

/**
 * @internal
 */

/**
 * Route options: If 'GET' or 'OPTIONS' method, body options won't be returned.
 * @public
 */

/**
 * Request specific route information exposed to a handler.
 * @public
 * */

/**
 * Request events.
 * @public
 * */

/**
 * @deprecated
 * `hapi` request object, supported during migration process only for backward compatibility.
 * @public
 */

// eslint-disable-line @typescript-eslint/no-empty-interface

/**
 * OpenSearch Dashboards specific abstraction for an incoming request.
 * @public
 */
class OpenSearchDashboardsRequest {
  /**
   * Factory for creating requests. Validates the request before creating an
   * instance of a OpenSearchDashboardsRequest.
   * @internal
   */
  static from(req, routeSchemas = {}, withoutSecretHeaders = true) {
    const routeValidator = _validator.RouteValidator.from(routeSchemas);
    const requestParts = OpenSearchDashboardsRequest.validate(req, routeValidator);
    return new OpenSearchDashboardsRequest(req, requestParts.params, requestParts.query, requestParts.body, withoutSecretHeaders);
  }

  /**
   * Validates the different parts of a request based on the schemas defined for
   * the route. Builds up the actual params, query and body object that will be
   * received in the route handler.
   * @internal
   */
  static validate(req, routeValidator) {
    const params = routeValidator.getParams(req.params, 'request params');
    const query = routeValidator.getQuery(req.query, 'request query');
    const body = routeValidator.getBody(req.payload, 'request body');
    return {
      query,
      params,
      body
    };
  }
  /**
   * A identifier to identify this request.
   *
   * @remarks
   * Depending on the user's configuration, this value may be sourced from the
   * incoming request's `X-Opaque-Id` header which is not guaranteed to be unique
   * per request.
   */

  constructor(request, params, query, body,
  // @ts-expect-error we will use this flag as soon as http request proxy is supported in the core
  // until that time we have to expose all the headers
  withoutSecretHeaders) {
    var _requestId, _request$app, _requestUuid, _request$app2, _request$auth;
    this.params = params;
    this.query = query;
    this.body = body;
    this.withoutSecretHeaders = withoutSecretHeaders;
    _defineProperty(this, "id", void 0);
    /**
     * A UUID to identify this request.
     *
     * @remarks
     * This value is NOT sourced from the incoming request's `X-Opaque-Id` header. it
     * is always a UUID uniquely identifying the request.
     */
    _defineProperty(this, "uuid", void 0);
    /** a WHATWG URL standard object. */
    _defineProperty(this, "url", void 0);
    /** matched route details */
    _defineProperty(this, "route", void 0);
    /**
     * Readonly copy of incoming request headers.
     * @remarks
     * This property will contain a `filtered` copy of request headers.
     */
    _defineProperty(this, "headers", void 0);
    /**
     * Whether or not the request is a "system request" rather than an application-level request.
     * Can be set on the client using the `HttpFetchOptions#asSystemRequest` option.
     */
    _defineProperty(this, "isSystemRequest", void 0);
    /** {@link IOpenSearchDashboardsSocket} */
    _defineProperty(this, "socket", void 0);
    /** Request events {@link OpenSearchDashboardsRequestEvents} */
    _defineProperty(this, "events", void 0);
    _defineProperty(this, "auth", void 0);
    /** @internal */
    _defineProperty(this, requestSymbol, void 0);
    // The `requestId` and `requestUuid` properties will not be populated for requests that are 'faked' by internal systems that leverage
    // OpenSearchDashboardsRequest in conjunction with scoped Elaticcsearch and SavedObjectsClient in order to pass credentials.
    // In these cases, the ids default to a newly generated UUID.
    this.id = (_requestId = (_request$app = request.app) === null || _request$app === void 0 ? void 0 : _request$app.requestId) !== null && _requestId !== void 0 ? _requestId : _uuid.default.v4();
    this.uuid = (_requestUuid = (_request$app2 = request.app) === null || _request$app2 === void 0 ? void 0 : _request$app2.requestUuid) !== null && _requestUuid !== void 0 ? _requestUuid : _uuid.default.v4();
    this.url = request.url;
    this.headers = (0, _std.deepFreeze)({
      ...request.headers
    });
    this.isSystemRequest = request.headers['osd-system-request'] === 'true' ||
    // Remove support for `osd-system-api` in 8.x. Used only by legacy platform.
    request.headers['osd-system-api'] === 'true';

    // prevent Symbol exposure via Object.getOwnPropertySymbols()
    Object.defineProperty(this, requestSymbol, {
      value: request,
      enumerable: false
    });
    this.route = (0, _std.deepFreeze)(this.getRouteInfo(request));
    this.socket = new _socket.OpenSearchDashboardsSocket(request.raw.req.socket);
    this.events = this.getEvents(request);
    this.auth = {
      // missing in fakeRequests, so we cast to false
      isAuthenticated: Boolean((_request$auth = request.auth) === null || _request$auth === void 0 ? void 0 : _request$auth.isAuthenticated)
    };
  }
  getEvents(request) {
    const finish$ = (0, _rxjs.fromEvent)(request.raw.res, 'finish').pipe((0, _operators.shareReplay)(1), (0, _operators.first)());
    const aborted$ = (0, _rxjs.fromEvent)(request.raw.req, 'aborted').pipe((0, _operators.first)(), (0, _operators.takeUntil)(finish$));
    const completed$ = (0, _rxjs.merge)(finish$, aborted$).pipe((0, _operators.shareReplay)(1), (0, _operators.first)());
    return {
      aborted$,
      completed$
    };
  }
  getRouteInfo(request) {
    var _request$raw$req$sock, _xsrfRequired, _request$route$settin;
    const method = request.method;
    const {
      parse,
      maxBytes,
      allow,
      output,
      timeout: payloadTimeout
    } = request.route.settings.payload || {};

    // net.Socket#timeout isn't documented, yet, and isn't part of the types... https://github.com/nodejs/node/pull/34543
    // the socket is also undefined when using @hapi/shot, or when a "fake request" is used
    const socketTimeout = (_request$raw$req$sock = request.raw.req.socket) === null || _request$raw$req$sock === void 0 ? void 0 : _request$raw$req$sock.timeout;
    const options = {
      authRequired: this.getAuthRequired(request),
      // some places in LP call OpenSearchDashboardsRequest.from(request) manually. remove fallback to true before v8
      xsrfRequired: (_xsrfRequired = (_request$route$settin = request.route.settings.app) === null || _request$route$settin === void 0 ? void 0 : _request$route$settin.xsrfRequired) !== null && _xsrfRequired !== void 0 ? _xsrfRequired : true,
      tags: request.route.settings.tags || [],
      timeout: {
        payload: payloadTimeout,
        idleSocket: socketTimeout === 0 ? undefined : socketTimeout
      },
      body: (0, _route.isSafeMethod)(method) ? undefined : {
        parse,
        maxBytes,
        accepts: allow,
        output: output // We do not support all the HAPI-supported outputs and TS complains
      }
    }; // TS does not understand this is OK so I'm enforced to do this enforced casting

    return {
      path: request.path,
      method,
      options
    };
  }
  getAuthRequired(request) {
    const authOptions = request.route.settings.auth;
    if (typeof authOptions === 'object') {
      // 'try' is used in the legacy platform
      if (authOptions.mode === 'optional' || authOptions.mode === 'try') {
        return 'optional';
      }
      if (authOptions.mode === 'required') {
        return true;
      }
    }

    // legacy platform routes
    if (authOptions === undefined) {
      return true;
    }

    // @ts-expect-error According to @types/hapi__hapi, `route.settings` should be of type `RouteSettings`, but it's actually `RouteOptions` (https://github.com/hapijs/hapi/blob/v20.2.1/lib/route.js#L134)
    if (authOptions === false) return false;
    throw new Error(`unexpected authentication options: ${JSON.stringify(authOptions)} for route: ${this.url.pathname}${this.url.search}`);
  }
}

/**
 * Returns underlying Hapi Request
 * @internal
 */
exports.OpenSearchDashboardsRequest = OpenSearchDashboardsRequest;
const ensureRawRequest = request => isOpenSearchDashboardsRequest(request) ? request[requestSymbol] : request;

/**
 * Checks if an incoming request is a {@link OpenSearchDashboardsRequest}
 * @internal
 */
exports.ensureRawRequest = ensureRawRequest;
function isOpenSearchDashboardsRequest(request) {
  return request instanceof OpenSearchDashboardsRequest;
}
function isRequest(request) {
  try {
    return request.raw.req && typeof request.raw.req === 'object';
  } catch {
    return false;
  }
}

/**
 * Checks if an incoming request either OpenSearchDashboardsRequest or Legacy.Request
 * @internal
 */
function isRealRequest(request) {
  return isOpenSearchDashboardsRequest(request) || isRequest(request);
}