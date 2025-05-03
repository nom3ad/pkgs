"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "DATA_CONNECTION_SAVED_OBJECT_TYPE", {
  enumerable: true,
  get: function () {
    return _data_connections.DATA_CONNECTION_SAVED_OBJECT_TYPE;
  }
});
exports.DATA_SOURCE_SAVED_OBJECT_TYPE = void 0;
Object.defineProperty(exports, "DataConnectionType", {
  enumerable: true,
  get: function () {
    return _data_connections.DataConnectionType;
  }
});
exports.PLUGIN_NAME = exports.PLUGIN_ID = void 0;
var _data_connections = require("./data_connections");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const PLUGIN_ID = exports.PLUGIN_ID = 'dataSource';
const PLUGIN_NAME = exports.PLUGIN_NAME = 'data_source';
const DATA_SOURCE_SAVED_OBJECT_TYPE = exports.DATA_SOURCE_SAVED_OBJECT_TYPE = 'data-source';