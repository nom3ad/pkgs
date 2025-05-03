"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "VisAugmenterPluginSetup", {
  enumerable: true,
  get: function () {
    return _plugin.VisAugmenterPluginSetup;
  }
});
Object.defineProperty(exports, "VisAugmenterPluginStart", {
  enumerable: true,
  get: function () {
    return _plugin.VisAugmenterPluginStart;
  }
});
exports.config = void 0;
exports.plugin = plugin;
var _plugin = require("./plugin");
var _config = require("../config");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const config = exports.config = {
  exposeToBrowser: {
    pluginAugmentationEnabled: true
  },
  schema: _config.configSchema
};
function plugin(initializerContext) {
  return new _plugin.VisAugmenterPlugin(initializerContext);
}