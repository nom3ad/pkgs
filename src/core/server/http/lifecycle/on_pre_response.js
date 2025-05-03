"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adoptToHapiOnPreResponseFormat = adoptToHapiOnPreResponseFormat;
var _boom = _interopRequireDefault(require("@hapi/boom"));
var _router = require("../router");
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
var ResultType = /*#__PURE__*/function (ResultType) {
  ResultType["render"] = "render";
  ResultType["next"] = "next";
  return ResultType;
}(ResultType || {});
/**
 * @internal
 */
/**
 * Additional data to extend a response when rendering a new body
 * @public
 */
/**
 * Additional data to extend a response.
 * @public
 */
/**
 * Response status code.
 * @public
 */
const preResponseResult = {
  render(responseRender) {
    return {
      type: ResultType.render,
      body: responseRender.body,
      headers: responseRender === null || responseRender === void 0 ? void 0 : responseRender.headers
    };
  },
  isRender(result) {
    return result && result.type === ResultType.render;
  },
  next(responseExtensions) {
    return {
      type: ResultType.next,
      headers: responseExtensions === null || responseExtensions === void 0 ? void 0 : responseExtensions.headers
    };
  },
  isNext(result) {
    return result && result.type === ResultType.next;
  }
};

/**
 * A tool set defining an outcome of OnPreResponse interceptor for incoming request.
 * @public
 */

const toolkit = {
  render: preResponseResult.render,
  next: preResponseResult.next
};

/**
 * See {@link OnPreRoutingToolkit}.
 * @public
 */

/**
 * @public
 * Adopt custom request interceptor to Hapi lifecycle system.
 * @param fn - an extension point allowing to perform custom logic for
 * incoming HTTP requests.
 */
function adoptToHapiOnPreResponseFormat(fn, log) {
  return async function interceptPreResponse(request, responseToolkit) {
    const response = request.response;
    try {
      if (response) {
        const statusCode = isBoom(response) ? response.output.statusCode : response.statusCode;
        const result = await fn(_router.OpenSearchDashboardsRequest.from(request), {
          statusCode
        }, toolkit);
        if (preResponseResult.isNext(result)) {
          if (result.headers) {
            if (isBoom(response)) {
              findHeadersIntersection(response.output.headers, result.headers, log);
              // hapi wraps all error response in Boom object internally
              response.output.headers = {
                ...response.output.headers,
                ...result.headers
              };
            } else {
              findHeadersIntersection(response.headers, result.headers, log);
              setHeaders(response, result.headers);
            }
          }
        } else if (preResponseResult.isRender(result)) {
          const overriddenResponse = responseToolkit.response(result.body).code(statusCode);
          const originalHeaders = isBoom(response) ? response.output.headers : response.headers;
          setHeaders(overriddenResponse, originalHeaders);
          if (result.headers) {
            setHeaders(overriddenResponse, result.headers);
          }
          return overriddenResponse;
        } else {
          throw new Error(`Unexpected result from OnPreResponse. Expected OnPreResponseResult, but given: ${result}.`);
        }
      }
    } catch (error) {
      log.error(error);
      const hapiResponseAdapter = new _router.HapiResponseAdapter(responseToolkit);
      return hapiResponseAdapter.toInternalError();
    }
    return responseToolkit.continue;
  };
}
function isBoom(response) {
  return response instanceof _boom.default.Boom;
}
function setHeaders(response, headers) {
  for (const [headerName, headerValue] of Object.entries(headers)) {
    response.header(headerName, headerValue); // hapi types don't specify string[] as valid value
  }
}

// NOTE: responseHeaders contains not a full list of response headers, but only explicitly set on a response object.
// any headers added by hapi internally, like `content-type`, `content-length`, etc. are not present here.
function findHeadersIntersection(responseHeaders, headers, log) {
  Object.keys(headers).forEach(headerName => {
    if (Reflect.has(responseHeaders, headerName)) {
      log.warn(`onPreResponseHandler rewrote a response header [${headerName}].`);
    }
  });
}