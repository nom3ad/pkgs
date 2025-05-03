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
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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