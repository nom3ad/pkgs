"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileAppender = void 0;
var _configSchema = require("@osd/config-schema");
var _fs = require("fs");
var _layouts = require("../../layouts/layouts");
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
 * Appender that formats all the `LogRecord` instances it receives and writes them to the specified file.
 * @internal
 */
class FileAppender {
  /**
   * Creates FileAppender instance with specified layout and file path.
   * @param layout Instance of `Layout` sub-class responsible for `LogRecord` formatting.
   * @param path Path to the file where log records should be stored.
   */
  constructor(layout, path) {
    this.layout = layout;
    this.path = path;
    /**
     * Writable file stream to write formatted `LogRecord` to.
     */
    _defineProperty(this, "outputStream", void 0);
  }

  /**
   * Formats specified `record` and writes them to the specified file.
   * @param record `LogRecord` instance to be logged.
   */
  append(record) {
    if (this.outputStream === undefined) {
      this.outputStream = (0, _fs.createWriteStream)(this.path, {
        encoding: 'utf8',
        flags: 'a'
      });
    }
    this.outputStream.write(`${this.layout.format(record)}\n`);
  }

  /**
   * Disposes `FileAppender`. Waits for the underlying file stream to be completely flushed and closed.
   */
  async dispose() {
    await new Promise(resolve => {
      if (this.outputStream === undefined) {
        return resolve();
      }
      this.outputStream.end(() => {
        this.outputStream = undefined;
        resolve();
      });
    });
  }
}
exports.FileAppender = FileAppender;
_defineProperty(FileAppender, "configSchema", _configSchema.schema.object({
  kind: _configSchema.schema.literal('file'),
  layout: _layouts.Layouts.configSchema,
  path: _configSchema.schema.string()
}));