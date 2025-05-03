"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "DataExplorerPluginSetup", {
  enumerable: true,
  get: function () {
    return _types.DataExplorerPluginSetup;
  }
});
Object.defineProperty(exports, "DataExplorerPluginStart", {
  enumerable: true,
  get: function () {
    return _types.DataExplorerPluginStart;
  }
});
exports.plugin = plugin;
var _plugin = require("./plugin");
var _types = require("./types");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.

function plugin(initializerContext) {
  return new _plugin.DataExplorerPlugin(initializerContext);
}