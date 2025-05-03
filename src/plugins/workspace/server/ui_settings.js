"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uiSettings = void 0;
var _configSchema = require("@osd/config-schema");
var _server = require("../../../core/server");
var _constants = require("../common/constants");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const uiSettings = exports.uiSettings = {
  [_constants.DEFAULT_WORKSPACE]: {
    name: 'Default workspace',
    scope: _server.UiSettingScope.USER,
    value: null,
    type: 'string',
    schema: _configSchema.schema.nullable(_configSchema.schema.string())
  }
};