"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  PLUGIN_ID: true,
  PLUGIN_NAME: true,
  DEFAULT_DATA_SOURCE_UI_SETTINGS_ID: true,
  DATA_SOURCE_PERMISSION_CLIENT_WRAPPER_ID: true,
  ORDER_FOR_DATA_SOURCE_PERMISSION_WRAPPER: true,
  DEFAULT_INDEX_PATTERN_UI_SETTINGS_ID: true
};
exports.PLUGIN_NAME = exports.PLUGIN_ID = exports.ORDER_FOR_DATA_SOURCE_PERMISSION_WRAPPER = exports.DEFAULT_INDEX_PATTERN_UI_SETTINGS_ID = exports.DEFAULT_DATA_SOURCE_UI_SETTINGS_ID = exports.DATA_SOURCE_PERMISSION_CLIENT_WRAPPER_ID = void 0;
var _types = require("./types");
Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const PLUGIN_ID = exports.PLUGIN_ID = 'dataSourceManagement';
const PLUGIN_NAME = exports.PLUGIN_NAME = 'Data sources';
const DEFAULT_DATA_SOURCE_UI_SETTINGS_ID = exports.DEFAULT_DATA_SOURCE_UI_SETTINGS_ID = 'defaultDataSource';
const DATA_SOURCE_PERMISSION_CLIENT_WRAPPER_ID = exports.DATA_SOURCE_PERMISSION_CLIENT_WRAPPER_ID = 'data-source-permission';
// Run data source permission wrapper behind all other wrapper.
const ORDER_FOR_DATA_SOURCE_PERMISSION_WRAPPER = exports.ORDER_FOR_DATA_SOURCE_PERMISSION_WRAPPER = 50;
const DEFAULT_INDEX_PATTERN_UI_SETTINGS_ID = exports.DEFAULT_INDEX_PATTERN_UI_SETTINGS_ID = 'defaultIndex';