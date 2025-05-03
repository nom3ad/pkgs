"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configSchema = void 0;
var _configSchema = require("@osd/config-schema");
var _audit_config = require("./audit_config");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const KEY_NAME_MIN_LENGTH = 1;
const KEY_NAME_MAX_LENGTH = 100;
// Wrapping key size should be 32 bytes, as used in envelope encryption algorithms.
const WRAPPING_KEY_SIZE = 32;
const configSchema = exports.configSchema = _configSchema.schema.object({
  enabled: _configSchema.schema.boolean({
    defaultValue: false
  }),
  hideLocalCluster: _configSchema.schema.boolean({
    defaultValue: false
  }),
  encryption: _configSchema.schema.object({
    wrappingKeyName: _configSchema.schema.string({
      minLength: KEY_NAME_MIN_LENGTH,
      maxLength: KEY_NAME_MAX_LENGTH,
      defaultValue: 'changeme'
    }),
    wrappingKeyNamespace: _configSchema.schema.string({
      minLength: KEY_NAME_MIN_LENGTH,
      maxLength: KEY_NAME_MAX_LENGTH,
      defaultValue: 'changeme'
    }),
    wrappingKey: _configSchema.schema.arrayOf(_configSchema.schema.number(), {
      minSize: WRAPPING_KEY_SIZE,
      maxSize: WRAPPING_KEY_SIZE,
      defaultValue: new Array(32).fill(0)
    })
  }),
  ssl: _configSchema.schema.object({
    verificationMode: _configSchema.schema.oneOf([_configSchema.schema.literal('none'), _configSchema.schema.literal('certificate'), _configSchema.schema.literal('full')], {
      defaultValue: 'full'
    }),
    certificateAuthorities: _configSchema.schema.maybe(_configSchema.schema.oneOf([_configSchema.schema.string(), _configSchema.schema.arrayOf(_configSchema.schema.string(), {
      minSize: 1
    })]))
  }),
  clientPool: _configSchema.schema.object({
    size: _configSchema.schema.number({
      defaultValue: 5
    })
  }),
  audit: _configSchema.schema.object({
    enabled: _configSchema.schema.boolean({
      defaultValue: false
    }),
    appender: _audit_config.fileAppenderSchema
  }),
  endpointDeniedIPs: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.string())),
  authTypes: _configSchema.schema.object({
    NoAuthentication: _configSchema.schema.object({
      enabled: _configSchema.schema.boolean({
        defaultValue: true
      })
    }),
    UsernamePassword: _configSchema.schema.object({
      enabled: _configSchema.schema.boolean({
        defaultValue: true
      })
    }),
    AWSSigV4: _configSchema.schema.object({
      enabled: _configSchema.schema.boolean({
        defaultValue: true
      })
    })
  })
});