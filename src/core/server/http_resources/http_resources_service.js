"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HttpResourcesService = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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

class HttpResourcesService {
  constructor(core) {
    _defineProperty(this, "logger", void 0);
    this.logger = core.logger.get('http-resources');
  }
  setup(deps) {
    this.logger.debug('setting up HttpResourcesService');
    return {
      createRegistrar: this.createRegistrar.bind(this, deps)
    };
  }
  start() {}
  stop() {}
  createRegistrar(deps, router) {
    return {
      register: (route, handler) => {
        return router.get(route, (context, request, response) => {
          return handler(context, request, {
            ...response,
            ...this.createResponseToolkit(deps, context, request, response)
          });
        });
      }
    };
  }
  createResponseToolkit(deps, context, request, response) {
    const cspHeader = deps.http.csp.header;
    return {
      async renderCoreApp(options = {}) {
        const body = await deps.rendering.render(request, context.core.uiSettings.client, {
          includeUserSettings: true
        });
        return response.ok({
          body,
          headers: {
            ...options.headers,
            'content-security-policy': cspHeader
          }
        });
      },
      async renderAnonymousCoreApp(options = {}) {
        const body = await deps.rendering.render(request, context.core.uiSettings.client, {
          includeUserSettings: false
        });
        return response.ok({
          body,
          headers: {
            ...options.headers,
            'content-security-policy': cspHeader
          }
        });
      },
      renderHtml(options) {
        return response.ok({
          body: options.body,
          headers: {
            ...options.headers,
            'content-type': 'text/html',
            'content-security-policy': cspHeader
          }
        });
      },
      renderJs(options) {
        return response.ok({
          body: options.body,
          headers: {
            ...options.headers,
            'content-type': 'text/javascript',
            'content-security-policy': cspHeader
          }
        });
      }
    };
  }
}
exports.HttpResourcesService = HttpResourcesService;