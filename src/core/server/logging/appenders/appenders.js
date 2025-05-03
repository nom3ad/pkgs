"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appendersSchema = exports.Appenders = void 0;
var _configSchema = require("@osd/config-schema");
var _std = require("@osd/std");
var _legacy_appender = require("../../legacy/logging/appenders/legacy_appender");
var _layouts = require("../layouts/layouts");
var _console_appender = require("./console/console_appender");
var _file_appender = require("./file/file_appender");
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
 * Config schema for validting the shape of the `appenders` key in in {@link LoggerContextConfigType} or
 * {@link LoggingConfigType}.
 *
 * @public
 */
const appendersSchema = exports.appendersSchema = _configSchema.schema.oneOf([_console_appender.ConsoleAppender.configSchema, _file_appender.FileAppender.configSchema, _legacy_appender.LegacyAppender.configSchema]);

/** @public */

/** @internal */
class Appenders {
  /**
   * Factory method that creates specific `Appender` instances based on the passed `config` parameter.
   * @param config Configuration specific to a particular `Appender` implementation.
   * @returns Fully constructed `Appender` instance.
   */
  static create(config) {
    switch (config.kind) {
      case 'console':
        return new _console_appender.ConsoleAppender(_layouts.Layouts.create(config.layout));
      case 'file':
        return new _file_appender.FileAppender(_layouts.Layouts.create(config.layout), config.path);
      case 'legacy-appender':
        return new _legacy_appender.LegacyAppender(config.legacyLoggingConfig);
      default:
        return (0, _std.assertNever)(config);
    }
  }
}
exports.Appenders = Appenders;
_defineProperty(Appenders, "configSchema", appendersSchema);