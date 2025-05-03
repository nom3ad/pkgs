"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fileAppenderSchema = void 0;
var _configSchema = require("@osd/config-schema");
var _os = _interopRequireDefault(require("os"));
var _path = _interopRequireDefault(require("path"));
var _conversions = require("../../../src/core/server/logging/layouts/conversions");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// eslint-disable-next-line @osd/eslint/no-restricted-paths

const patternSchema = _configSchema.schema.string({
  validate: string => {
    _conversions.DateConversion.validate(string);
  }
});
const patternLayout = _configSchema.schema.object({
  highlight: _configSchema.schema.maybe(_configSchema.schema.boolean()),
  kind: _configSchema.schema.literal('pattern'),
  pattern: _configSchema.schema.maybe(patternSchema)
});
const jsonLayout = _configSchema.schema.object({
  kind: _configSchema.schema.literal('json')
});
const fileAppenderSchema = exports.fileAppenderSchema = _configSchema.schema.object({
  kind: _configSchema.schema.literal('file'),
  layout: _configSchema.schema.oneOf([patternLayout, jsonLayout]),
  path: _configSchema.schema.string()
}, {
  defaultValue: {
    kind: 'file',
    layout: {
      kind: 'pattern',
      highlight: true
    },
    path: _path.default.join(_os.default.tmpdir(), 'opensearch-dashboards-data-source-audit.log')
  }
});