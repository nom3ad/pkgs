"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LevelConversion = void 0;
var _chalk = _interopRequireDefault(require("chalk"));
var _logging = require("@osd/logging");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
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

const LEVEL_COLORS = new Map([[_logging.LogLevel.Fatal, _chalk.default.red], [_logging.LogLevel.Error, _chalk.default.red], [_logging.LogLevel.Warn, _chalk.default.yellow], [_logging.LogLevel.Debug, _chalk.default.green], [_logging.LogLevel.Trace, _chalk.default.blue]]);
const LevelConversion = exports.LevelConversion = {
  pattern: /%level/g,
  convert(record, highlight) {
    let message = record.level.id.toUpperCase().padEnd(5);
    if (highlight && LEVEL_COLORS.has(record.level)) {
      const color = LEVEL_COLORS.get(record.level);
      message = color(message);
    }
    return message;
  }
};