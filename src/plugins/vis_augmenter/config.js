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
  pluginAugmentationEnabled: _configSchema.schema.boolean({
    defaultValue: true
  })
});