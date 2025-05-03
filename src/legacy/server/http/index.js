"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _url = require("url");
var _boom = _interopRequireDefault(require("@hapi/boom"));
var _register_hapi_plugins = require("./register_hapi_plugins");
var _setup_base_path_provider = require("./setup_base_path_provider");
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

async function _default(osdServer, server) {
  server = osdServer.server;
  (0, _setup_base_path_provider.setupBasePathProvider)(osdServer);
  await (0, _register_hapi_plugins.registerHapiPlugins)(server);
  server.route({
    method: 'GET',
    path: '/{p*}',
    handler: function (req, h) {
      const path = req.path;
      if (path === '/' || path.charAt(path.length - 1) !== '/') {
        throw _boom.default.notFound();
      }
      const pathPrefix = req.getBasePath() ? `${req.getBasePath()}/` : '';
      return h.redirect((0, _url.format)({
        search: req.url.search,
        pathname: pathPrefix + path.slice(0, -1)
      })).permanent(true);
    }
  });
}
module.exports = exports.default;