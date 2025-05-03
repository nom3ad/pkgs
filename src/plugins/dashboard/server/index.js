"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "DashboardPluginSetup", {
  enumerable: true,
  get: function () {
    return _types.DashboardPluginSetup;
  }
});
Object.defineProperty(exports, "DashboardPluginStart", {
  enumerable: true,
  get: function () {
    return _types.DashboardPluginStart;
  }
});
exports.config = void 0;
exports.plugin = plugin;
var _plugin = require("./plugin");
var _config = require("../config");
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
    allowByValueEmbeddables: true
  },
  schema: _config.configSchema
};

//  This exports static code and TypeScript types,
//  as well as, OpenSearch Dashboards Platform `plugin()` initializer.

function plugin(initializerContext) {
  return new _plugin.DashboardPlugin(initializerContext);
}