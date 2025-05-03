"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LegacyAppender = void 0;
var _configSchema = require("@osd/config-schema");
var _legacy_logging_server = require("../legacy_logging_server");
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
 * Simple appender that just forwards `LogRecord` to the legacy OsdServer log.
 * @internal
 */
class LegacyAppender {
  constructor(legacyLoggingConfig) {
    /**
     * Sets {@link Appender.receiveAllLevels} because legacy does its own filtering based on the legacy logging
     * configuration.
     */
    _defineProperty(this, "receiveAllLevels", true);
    _defineProperty(this, "loggingServer", void 0);
    this.loggingServer = new _legacy_logging_server.LegacyLoggingServer(legacyLoggingConfig);
  }

  /**
   * Forwards `LogRecord` to the legacy platform that will layout and
   * write record to the configured destination.
   * @param record `LogRecord` instance to forward to.
   */
  append(record) {
    this.loggingServer.log(record);
  }
  dispose() {
    this.loggingServer.stop();
  }
}
exports.LegacyAppender = LegacyAppender;
_defineProperty(LegacyAppender, "configSchema", _configSchema.schema.object({
  kind: _configSchema.schema.literal('legacy-appender'),
  legacyLoggingConfig: _configSchema.schema.any()
}));