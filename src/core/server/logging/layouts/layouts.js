"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Layouts = void 0;
var _configSchema = require("@osd/config-schema");
var _std = require("@osd/std");
var _json_layout = require("./json_layout");
var _pattern_layout = require("./pattern_layout");
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
  oneOf
} = _configSchema.schema;
/** @internal */
class Layouts {
  /**
   * Factory method that creates specific `Layout` instances based on the passed `config` parameter.
   * @param config Configuration specific to a particular `Layout` implementation.
   * @returns Fully constructed `Layout` instance.
   */
  static create(config) {
    switch (config.kind) {
      case 'json':
        return new _json_layout.JsonLayout();
      case 'pattern':
        return new _pattern_layout.PatternLayout(config.pattern, config.highlight);
      default:
        return (0, _std.assertNever)(config);
    }
  }
}
exports.Layouts = Layouts;
_defineProperty(Layouts, "configSchema", oneOf([_json_layout.JsonLayout.configSchema, _pattern_layout.PatternLayout.configSchema]));