"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.patternSchema = exports.PatternLayout = void 0;
var _configSchema = require("@osd/config-schema");
var _conversions = require("./conversions");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */ /*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/**
 * Default pattern used by PatternLayout if it's not overridden in the configuration.
 */
const DEFAULT_PATTERN = `[%date][%level][%logger]%meta %message`;
const patternSchema = exports.patternSchema = _configSchema.schema.string({
  validate: string => {
    _conversions.DateConversion.validate(string);
  }
});
const patternLayoutSchema = _configSchema.schema.object({
  highlight: _configSchema.schema.maybe(_configSchema.schema.boolean()),
  kind: _configSchema.schema.literal('pattern'),
  pattern: _configSchema.schema.maybe(patternSchema)
});
const conversions = [_conversions.LoggerConversion, _conversions.MessageConversion, _conversions.LevelConversion, _conversions.MetaConversion, _conversions.PidConversion, _conversions.DateConversion];

/** @internal */

/**
 * Layout that formats `LogRecord` using the `pattern` string with optional
 * color highlighting (eg. to make log messages easier to read in the terminal).
 * @internal
 */
class PatternLayout {
  constructor(pattern = DEFAULT_PATTERN, highlight = false) {
    this.pattern = pattern;
    this.highlight = highlight;
  }

  /**
   * Formats `LogRecord` into a string based on the specified `pattern` and `highlighting` options.
   * @param record Instance of `LogRecord` to format into string.
   */
  format(record) {
    let recordString = this.pattern;
    for (const conversion of conversions) {
      recordString = recordString.replace(conversion.pattern, conversion.convert.bind(null, record, this.highlight));
    }
    return recordString;
  }
}
exports.PatternLayout = PatternLayout;
_defineProperty(PatternLayout, "configSchema", patternLayoutSchema);