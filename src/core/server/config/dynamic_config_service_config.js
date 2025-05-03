"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configSchema = exports.config = void 0;
var _configSchema = require("@osd/config-schema");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const configSchema = exports.configSchema = _configSchema.schema.object({
  skipMigrations: _configSchema.schema.boolean({
    defaultValue: false
  }),
  // If not enabled, the core service will exist but the client returned will just return static configs
  enabled: _configSchema.schema.boolean({
    defaultValue: false
  })
});
const config = exports.config = {
  path: 'dynamic_config_service',
  schema: configSchema
};