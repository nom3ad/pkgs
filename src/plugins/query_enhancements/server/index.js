"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Facet", {
  enumerable: true,
  get: function () {
    return _utils.Facet;
  }
});
Object.defineProperty(exports, "FacetProps", {
  enumerable: true,
  get: function () {
    return _utils.FacetProps;
  }
});
Object.defineProperty(exports, "OpenSearchObservabilityPlugin", {
  enumerable: true,
  get: function () {
    return _utils.OpenSearchObservabilityPlugin;
  }
});
Object.defineProperty(exports, "OpenSearchPPLPlugin", {
  enumerable: true,
  get: function () {
    return _utils.OpenSearchPPLPlugin;
  }
});
Object.defineProperty(exports, "QueryEnhancementsPluginSetup", {
  enumerable: true,
  get: function () {
    return _types.QueryEnhancementsPluginSetup;
  }
});
Object.defineProperty(exports, "QueryEnhancementsPluginStart", {
  enumerable: true,
  get: function () {
    return _types.QueryEnhancementsPluginStart;
  }
});
exports.config = void 0;
exports.plugin = plugin;
Object.defineProperty(exports, "shimSchemaRow", {
  enumerable: true,
  get: function () {
    return _utils.shimSchemaRow;
  }
});
Object.defineProperty(exports, "shimStats", {
  enumerable: true,
  get: function () {
    return _utils.shimStats;
  }
});
var _plugin = require("./plugin");
var _config = require("../common/config");
var _utils = require("./utils");
var _types = require("./types");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const config = exports.config = {
  exposeToBrowser: {
    queryAssist: true
  },
  schema: _config.configSchema
};
function plugin(initializerContext) {
  return new _plugin.QueryEnhancementsPlugin(initializerContext);
}