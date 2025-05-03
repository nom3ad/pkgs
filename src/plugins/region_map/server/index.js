"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "RegionMapPluginSetup", {
  enumerable: true,
  get: function () {
    return _types.RegionMapPluginSetup;
  }
});
Object.defineProperty(exports, "RegionMapPluginStart", {
  enumerable: true,
  get: function () {
    return _types.RegionMapPluginStart;
  }
});
exports.config = void 0;
exports.plugin = plugin;
var _config = require("../config");
var _plugin = require("./plugin");
var _types = require("./types");
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

const config = exports.config = {
  exposeToBrowser: {
    includeOpenSearchMapsService: true,
    layers: true
  },
  schema: _config.configSchema,
  deprecations: ({
    renameFromRoot
  }) => [renameFromRoot('map.regionmap.includeElasticMapsService', 'map.regionmap.includeOpenSearchMapsService')]
};
function plugin(initializerContext) {
  return new _plugin.RegionMapPlugin(initializerContext);
}