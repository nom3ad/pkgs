"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoreApp = void 0;
var _path = _interopRequireDefault(require("path"));
var _utils = require("../../../core/server/utils");
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
/** @internal */
class CoreApp {
  constructor(core) {
    _defineProperty(this, "logger", void 0);
    this.logger = core.logger.get('core-app');
  }
  setup(coreSetup) {
    this.logger.debug('Setting up core app.');
    this.registerDefaultRoutes(coreSetup);
    this.registerStaticDirs(coreSetup);
  }
  registerDefaultRoutes(coreSetup) {
    const httpSetup = coreSetup.http;
    const router = httpSetup.createRouter('/');
    router.get({
      path: '/',
      validate: false
    }, async (context, req, res) => {
      let defaultRoute = await context.core.uiSettings.client.get('defaultRoute');
      // TODO: [RENAMEME] Temporary code for backwards compatibility.
      // https://github.com/opensearch-project/OpenSearch-Dashboards/issues/334
      defaultRoute = defaultRoute.replace('kibana_overview', 'opensearch_dashboards_overview');
      const basePath = httpSetup.basePath.get(req);
      const url = `${basePath}${defaultRoute}`;
      return res.redirected({
        headers: {
          location: url
        }
      });
    });
    router.get({
      path: '/core',
      validate: false
    }, async (context, req, res) => res.ok({
      body: {
        version: '0.0.1'
      }
    }));
    const anonymousStatusPage = coreSetup.status.isStatusPageAnonymous();
    coreSetup.httpResources.createRegistrar(router).register({
      path: '/status',
      validate: false,
      options: {
        authRequired: !anonymousStatusPage
      }
    }, async (context, request, response) => {
      if (anonymousStatusPage) {
        return response.renderAnonymousCoreApp();
      } else {
        return response.renderCoreApp();
      }
    });
  }
  registerStaticDirs(coreSetup) {
    coreSetup.http.registerStaticDir('/ui/{path*}', _path.default.resolve(__dirname, './assets'));
    coreSetup.http.registerStaticDir('/ui/assets/{path*}', (0, _utils.fromRoot)('assets'));
    coreSetup.http.registerStaticDir('/node_modules/@osd/ui-framework/dist/{path*}', (0, _utils.fromRoot)('node_modules/@osd/ui-framework/dist'));
  }
}
exports.CoreApp = CoreApp;