"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ApplicationConfigPluginSetup", {
  enumerable: true,
  get: function () {
    return _types.ApplicationConfigPluginSetup;
  }
});
Object.defineProperty(exports, "ApplicationConfigPluginStart", {
  enumerable: true,
  get: function () {
    return _types.ApplicationConfigPluginStart;
  }
});
Object.defineProperty(exports, "ConfigurationClient", {
  enumerable: true,
  get: function () {
    return _types.ConfigurationClient;
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

/*
This exports static code and TypeScript types,
as well as, OpenSearch Dashboards Platform `plugin()` initializer.
*/

const config = exports.config = {
  schema: _config.configSchema
};
function plugin(initializerContext) {
  return new _plugin.ApplicationConfigPlugin(initializerContext);
}