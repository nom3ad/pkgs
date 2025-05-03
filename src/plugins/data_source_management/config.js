"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configSchema = void 0;
var _configSchema = require("@osd/config-schema");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const configSchema = exports.configSchema = _configSchema.schema.object({
  manageableBy: _configSchema.schema.oneOf([_configSchema.schema.literal('all'), _configSchema.schema.literal('dashboard_admin'), _configSchema.schema.literal('none')], {
    defaultValue: 'all'
  }),
  dataSourceAdmin: _configSchema.schema.object({
    groups: _configSchema.schema.arrayOf(_configSchema.schema.string(), {
      defaultValue: []
    })
  })
});