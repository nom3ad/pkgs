"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "WorkspaceFindOptions", {
  enumerable: true,
  get: function () {
    return _types.WorkspaceFindOptions;
  }
});
Object.defineProperty(exports, "WorkspacePluginSetup", {
  enumerable: true,
  get: function () {
    return _types.WorkspacePluginSetup;
  }
});
Object.defineProperty(exports, "WorkspacePluginStart", {
  enumerable: true,
  get: function () {
    return _types.WorkspacePluginStart;
  }
});
exports.config = void 0;
exports.plugin = plugin;
var _plugin = require("./plugin");
var _config = require("../config");
var _types = require("./types");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.

function plugin(initializerContext) {
  return new _plugin.WorkspacePlugin(initializerContext);
}
const config = exports.config = {
  schema: _config.configSchema
};