"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LegacyOpenSearchErrorHelpers = void 0;
var _boom = _interopRequireDefault(require("@hapi/boom"));
var _lodash = require("lodash");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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

const code = Symbol('OpenSearchError');
var ErrorCode = /*#__PURE__*/function (ErrorCode) {
  ErrorCode["NOT_AUTHORIZED"] = "OpenSearch/notAuthorized";
  return ErrorCode;
}(ErrorCode || {});
/**
 * @deprecated. The new opensearch client doesn't wrap errors anymore.
 * @public
 * */
function isOpenSearchError(error) {
  return Boolean(error && error[code]);
}
function decorate(error, errorCode, statusCode, message) {
  if (isOpenSearchError(error)) {
    return error;
  }
  const boom = _boom.default.boomify(error, {
    statusCode,
    message,
    // keep status and messages if Boom error object already has them
    override: false
  });
  boom[code] = errorCode;
  return boom;
}

/**
 * Helpers for working with errors returned from the OpenSearch service.Since the internal data of
 * errors are subject to change, consumers of the OpenSearch service should always use these helpers
 * to classify errors instead of checking error internals such as `body.error.header[WWW-Authenticate]`
 * @public
 *
 * @example
 * Handle errors
 * ```js
 * try {
 *   await client.asScoped(request).callAsCurrentUser(...);
 * } catch (err) {
 *   if (OpenSearchErrorHelpers.isNotAuthorizedError(err)) {
 *     const authHeader = err.output.headers['WWW-Authenticate'];
 *   }
 * ```
 */
class LegacyOpenSearchErrorHelpers {
  static isNotAuthorizedError(error) {
    return isOpenSearchError(error) && error[code] === ErrorCode.NOT_AUTHORIZED;
  }
  static decorateNotAuthorizedError(error, reason) {
    const decoratedError = decorate(error, ErrorCode.NOT_AUTHORIZED, 401, reason);
    const wwwAuthHeader = (0, _lodash.get)(error, 'body.error.header[WWW-Authenticate]');
    decoratedError.output.headers['WWW-Authenticate'] = wwwAuthHeader || 'Basic realm="Authorization Required"';
    return decoratedError;
  }
}
exports.LegacyOpenSearchErrorHelpers = LegacyOpenSearchErrorHelpers;