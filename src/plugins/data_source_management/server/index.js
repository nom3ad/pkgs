"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "DataSourceManagementPluginSetup", {
  enumerable: true,
  get: function () {
    return _types.DataSourceManagementPluginSetup;
  }
});
Object.defineProperty(exports, "DataSourceManagementPluginStart", {
  enumerable: true,
  get: function () {
    return _types.DataSourceManagementPluginStart;
  }
});
exports.config = void 0;
exports.plugin = plugin;
var _config = require("../config");
var _plugin = require("./plugin");
var _types = require("./types");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.

function plugin(initializerContext) {
  return new _plugin.DataSourceManagementPlugin(initializerContext);
}
const config = exports.config = {
  schema: _config.configSchema
};