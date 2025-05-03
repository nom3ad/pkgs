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
  enabled: _configSchema.schema.boolean({
    defaultValue: true
  }),
  queryAssist: _configSchema.schema.object({
    supportedLanguages: _configSchema.schema.arrayOf(_configSchema.schema.object({
      language: _configSchema.schema.string(),
      agentConfig: _configSchema.schema.string()
    }), {
      defaultValue: [{
        language: 'PPL',
        agentConfig: 'os_query_assist_ppl'
      }]
    }),
    summary: _configSchema.schema.object({
      enabled: _configSchema.schema.boolean({
        defaultValue: false
      })
    })
  })
});