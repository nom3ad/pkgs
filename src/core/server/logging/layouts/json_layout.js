"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsonLayout = void 0;
var _momentTimezone = _interopRequireDefault(require("moment-timezone"));
var _lodash = require("lodash");
var _configSchema = require("@osd/config-schema");
var _std = require("@osd/std");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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
const {
  literal,
  object
} = _configSchema.schema;
const jsonLayoutSchema = object({
  kind: literal('json')
});

/** @internal */

/**
 * Layout that just converts `LogRecord` into JSON string.
 * @internal
 */
class JsonLayout {
  static errorToSerializableObject(error) {
    if (error === undefined) {
      return error;
    }
    return {
      message: (0, _std.cleanControlSequences)(error.message),
      type: error.name,
      stack_trace: error.stack && (0, _std.cleanControlSequences)(error.stack)
    };
  }
  format(record) {
    return JSON.stringify((0, _lodash.merge)({
      '@timestamp': (0, _momentTimezone.default)(record.timestamp).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
      message: (0, _std.cleanControlSequences)(record.message),
      error: JsonLayout.errorToSerializableObject(record.error),
      log: {
        level: record.level.id.toUpperCase(),
        logger: record.context
      },
      process: {
        pid: record.pid
      }
    }, record.meta));
  }
}
exports.JsonLayout = JsonLayout;
_defineProperty(JsonLayout, "configSchema", jsonLayoutSchema);