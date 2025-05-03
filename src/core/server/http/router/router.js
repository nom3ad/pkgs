"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Router = void 0;
var _configSchema = require("@osd/config-schema");
var _errors = require("../../opensearch/legacy/errors");
var _errors2 = require("../../opensearch/client/errors");
var _request = require("./request");
var _response = require("./response");
var _route = require("./route");
var _response_adapter = require("./response_adapter");
var _error_wrapper = require("./error_wrapper");
var _validator = require("./validator");
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
 * Route handler common definition
 *
 * @public
 */

/**
 * Registers route handlers for specified resource path and method.
 * See {@link RouteConfig} and {@link RequestHandler} for more information about arguments to route registrations.
 *
 * @public
 */

function getRouteFullPath(routerPath, routePath) {
  // If router's path ends with slash and route's path starts with slash,
  // we should omit one of them to have a valid concatenated path.
  const routePathStartIndex = routerPath.endsWith('/') && routePath.startsWith('/') ? 1 : 0;
  return `${routerPath}${routePath.slice(routePathStartIndex)}`;
}

/**
 * Create the validation schemas for a route
 *
 * @returns Route schemas if `validate` is specified on the route, otherwise
 * undefined.
 */
function routeSchemasFromRouteConfig(route, routeMethod) {
  // The type doesn't allow `validate` to be undefined, but it can still
  // happen when it's used from JavaScript.
  if (route.validate === undefined) {
    throw new Error(`The [${routeMethod}] at [${route.path}] does not have a 'validate' specified. Use 'false' as the value if you want to bypass validation.`);
  }
  if (route.validate !== false) {
    Object.entries(route.validate).forEach(([key, schema]) => {
      if (!((0, _configSchema.isConfigSchema)(schema) || typeof schema === 'function')) {
        throw new Error(`Expected a valid validation logic declared with '@osd/config-schema' package or a RouteValidationFunction at key: [${key}].`);
      }
    });
  }
  if (route.validate) {
    return _validator.RouteValidator.from(route.validate);
  }
}

/**
 * Create a valid options object with "sensible" defaults + adding some validation to the options fields
 *
 * @param method HTTP verb for these options
 * @param routeConfig The route config definition
 */
function validOptions(method, routeConfig) {
  const shouldNotHavePayload = ['head', 'get'].includes(method);
  const {
    options = {},
    validate
  } = routeConfig;
  const shouldValidateBody = validate && !!validate.body || !!options.body;
  const {
    output
  } = options.body || {};
  if (typeof output === 'string' && !_route.validBodyOutput.includes(output)) {
    throw new Error(`[options.body.output: '${output}'] in route ${method.toUpperCase()} ${routeConfig.path} is not valid. Only '${_route.validBodyOutput.join("' or '")}' are valid.`);
  }
  const body = shouldNotHavePayload ? undefined : {
    // If it's not a GET (requires payload) but no body validation is required (or no body options are specified),
    // We assume the route does not care about the body => use the memory-cheapest approach (stream and no parsing)
    output: !shouldValidateBody ? 'stream' : undefined,
    parse: !shouldValidateBody ? false : undefined,
    // User's settings should overwrite any of the "desired" values
    ...options.body
  };
  return {
    ...options,
    body
  };
}

/**
 * @internal
 */
class Router {
  constructor(routerPath, log, enhanceWithContext) {
    this.routerPath = routerPath;
    this.log = log;
    this.enhanceWithContext = enhanceWithContext;
    _defineProperty(this, "routes", []);
    _defineProperty(this, "get", void 0);
    _defineProperty(this, "post", void 0);
    _defineProperty(this, "delete", void 0);
    _defineProperty(this, "put", void 0);
    _defineProperty(this, "patch", void 0);
    _defineProperty(this, "handleLegacyErrors", _error_wrapper.wrapErrors);
    const buildMethod = method => (route, handler) => {
      const routeSchemas = routeSchemasFromRouteConfig(route, method);
      this.routes.push({
        handler: async (req, responseToolkit) => await this.handle({
          routeSchemas,
          request: req,
          responseToolkit,
          handler: this.enhanceWithContext(handler)
        }),
        method,
        path: getRouteFullPath(this.routerPath, route.path),
        options: validOptions(method, route)
      });
    };
    this.get = buildMethod('get');
    this.post = buildMethod('post');
    this.delete = buildMethod('delete');
    this.put = buildMethod('put');
    this.patch = buildMethod('patch');
  }
  getRoutes() {
    return [...this.routes];
  }
  async handle({
    routeSchemas,
    request,
    responseToolkit,
    handler
  }) {
    let opensearchDashboardsRequest;
    const hapiResponseAdapter = new _response_adapter.HapiResponseAdapter(responseToolkit);
    try {
      opensearchDashboardsRequest = _request.OpenSearchDashboardsRequest.from(request, routeSchemas);
    } catch (e) {
      return hapiResponseAdapter.toBadRequest(e.message);
    }
    try {
      const opensearchDashboardsResponse = await handler(opensearchDashboardsRequest, _response.opensearchDashboardsResponseFactory);
      return hapiResponseAdapter.handle(opensearchDashboardsResponse);
    } catch (e) {
      this.log.error(e);
      // forward 401 errors from OpenSearch client
      if ((0, _errors2.isUnauthorizedError)(e)) {
        return hapiResponseAdapter.handle(_response.opensearchDashboardsResponseFactory.unauthorized(convertOpenSearchUnauthorized(e)));
      }
      // forward 401 (boom) errors from legacy OpenSearch client
      if (_errors.LegacyOpenSearchErrorHelpers.isNotAuthorizedError(e)) {
        return e;
      }
      return hapiResponseAdapter.toInternalError();
    }
  }
}
exports.Router = Router;
const convertOpenSearchUnauthorized = e => {
  const getAuthenticateHeaderValue = () => {
    const header = Object.entries(e.headers).find(([key]) => key.toLowerCase() === 'www-authenticate');
    return header ? header[1] : 'Basic realm="Authorization Required"';
  };
  return {
    body: e.message,
    headers: {
      'www-authenticate': getAuthenticateHeaderValue()
    }
  };
};

/**
 * A function executed when route path matched requested resource path.
 * Request handler is expected to return a result of one of {@link OpenSearchDashboardsResponseFactory} functions.
 * @param context {@link RequestHandlerContext} - the core context exposed for this request.
 * @param request {@link OpenSearchDashboardsRequest} - object containing information about requested resource,
 * such as path, method, headers, parameters, query, body, etc.
 * @param response {@link OpenSearchDashboardsResponseFactory} - a set of helper functions used to respond to a request.
 *
 * @example
 * ```ts
 * const router = httpSetup.createRouter();
 * // creates a route handler for GET request on 'my-app/path/{id}' path
 * router.get(
 *   {
 *     path: 'path/{id}',
 *     // defines a validation schema for a named segment of the route path
 *     validate: {
 *       params: schema.object({
 *         id: schema.string(),
 *       }),
 *     },
 *   },
 *   // function to execute to create a responses
 *   async (context, request, response) => {
 *     const data = await context.findObject(request.params.id);
 *     // creates a command to respond with 'not found' error
 *     if (!data) return response.notFound();
 *     // creates a command to send found data to the client
 *     return response.ok(data);
 *   }
 * );
 * ```
 * @public
 */

/**
 * Type-safe wrapper for {@link RequestHandler} function.
 * @example
 * ```typescript
 * export const wrapper: RequestHandlerWrapper = handler => {
 *   return async (context, request, response) => {
 *     // do some logic
 *     ...
 *   };
 * }
 * ```
 * @public
 */