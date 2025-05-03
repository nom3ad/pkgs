"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HapiResponseAdapter = void 0;
var _typeDetect = _interopRequireDefault(require("type-detect"));
var _boom = _interopRequireDefault(require("@hapi/boom"));
var stream = _interopRequireWildcard(require("stream"));
var _std = require("@osd/std");
var _response = require("./response");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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

function setHeaders(response, headers = {}) {
  Object.entries(headers).forEach(([header, value]) => {
    if (value !== undefined) {
      // Hapi typings for header accept only strings, although string[] is a valid value
      response.header(header, value);
    }
  });
  return response;
}
const statusHelpers = {
  isSuccess: code => code >= 100 && code < 300,
  isRedirect: code => code >= 300 && code < 400,
  isError: code => code >= 400 && code < 600
};
class HapiResponseAdapter {
  constructor(responseToolkit) {
    this.responseToolkit = responseToolkit;
  }
  toBadRequest(message) {
    const error = _boom.default.badRequest();
    error.output.payload.message = message;
    return error;
  }
  toInternalError() {
    const error = new _boom.default.Boom('', {
      statusCode: 500
    });
    error.output.payload.message = 'An internal server error occurred.';
    return error;
  }
  handle(opensearchDashboardsResponse) {
    if (!(opensearchDashboardsResponse instanceof _response.OpenSearchDashboardsResponse)) {
      throw new Error(`Unexpected result from Route Handler. Expected OpenSearchDashboardsResponse, but given: ${(0, _typeDetect.default)(opensearchDashboardsResponse)}.`);
    }
    return this.toHapiResponse(opensearchDashboardsResponse);
  }
  toHapiResponse(opensearchDashboardsResponse) {
    if (statusHelpers.isError(opensearchDashboardsResponse.status)) {
      return this.toError(opensearchDashboardsResponse);
    }
    if (statusHelpers.isSuccess(opensearchDashboardsResponse.status)) {
      return this.toSuccess(opensearchDashboardsResponse);
    }
    if (statusHelpers.isRedirect(opensearchDashboardsResponse.status)) {
      return this.toRedirect(opensearchDashboardsResponse);
    }
    throw new Error(`Unexpected Http status code. Expected from 100 to 599, but given: ${opensearchDashboardsResponse.status}.`);
  }
  toSuccess(opensearchDashboardsResponse) {
    const response = this.responseToolkit.response(opensearchDashboardsResponse.options.withLongNumeralsSupport ? (0, _std.stringify)(opensearchDashboardsResponse.payload) : opensearchDashboardsResponse.payload).code(opensearchDashboardsResponse.status);
    setHeaders(response, opensearchDashboardsResponse.options.headers);
    if (opensearchDashboardsResponse.options.withLongNumeralsSupport) {
      setHeaders(response, {
        'content-type': 'application/json'
      });
    }
    return response;
  }
  toRedirect(opensearchDashboardsResponse) {
    const {
      headers
    } = opensearchDashboardsResponse.options;
    if (!headers || typeof headers.location !== 'string') {
      throw new Error("expected 'location' header to be set");
    }
    const response = this.responseToolkit.response(opensearchDashboardsResponse.payload).redirect(headers.location).code(opensearchDashboardsResponse.status).takeover();
    setHeaders(response, opensearchDashboardsResponse.options.headers);
    return response;
  }
  toError(opensearchDashboardsResponse) {
    const {
      payload
    } = opensearchDashboardsResponse;

    // Special case for when we are proxying requests and want to enable streaming back error responses opaquely.
    if (Buffer.isBuffer(payload) || payload instanceof stream.Readable) {
      const response = this.responseToolkit.response(opensearchDashboardsResponse.payload).code(opensearchDashboardsResponse.status);
      setHeaders(response, opensearchDashboardsResponse.options.headers);
      return response;
    }

    // we use for BWC with Boom payload for error responses - {error: string, message: string, statusCode: string}
    const error = new _boom.default.Boom('', {
      statusCode: opensearchDashboardsResponse.status
    });
    error.output.payload.message = getErrorMessage(payload);
    const attributes = getErrorAttributes(payload);
    if (attributes) {
      error.output.payload.attributes = attributes;
    }
    const headers = opensearchDashboardsResponse.options.headers;
    if (headers) {
      error.output.headers = headers;
    }
    return error;
  }
}
exports.HapiResponseAdapter = HapiResponseAdapter;
function getErrorMessage(payload) {
  if (!payload) {
    throw new Error('expected error message to be provided');
  }
  if (typeof payload === 'string') return payload;
  return getErrorMessage(payload.message);
}
function getErrorAttributes(payload) {
  return typeof payload === 'object' && 'attributes' in payload ? payload.attributes : undefined;
}