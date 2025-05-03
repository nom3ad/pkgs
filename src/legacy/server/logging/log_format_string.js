"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _lodash = _interopRequireDefault(require("lodash"));
var _chalk = _interopRequireDefault(require("chalk"));
var _log_format = _interopRequireDefault(require("./log_format"));
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

const statuses = ['err', 'info', 'error', 'warning', 'fatal', 'status', 'debug'];
const typeColors = {
  log: 'white',
  req: 'green',
  res: 'green',
  ops: 'cyan',
  config: 'cyan',
  err: 'red',
  info: 'green',
  error: 'red',
  warning: 'red',
  fatal: 'magentaBright',
  status: 'yellowBright',
  debug: 'gray',
  server: 'gray',
  optmzr: 'white',
  manager: 'green',
  optimize: 'magentaBright',
  listening: 'magentaBright',
  scss: 'magentaBright'
};
const color = _lodash.default.memoize(function (name) {
  return _chalk.default[typeColors[name]] || _lodash.default.identity;
});
const type = _lodash.default.memoize(function (t) {
  return color(t)(_lodash.default.pad(t, 7).slice(0, 7));
});
const workerType = process.env.osdWorkerType ? `${type(process.env.osdWorkerType)} ` : '';
class OsdLoggerStringFormat extends _log_format.default {
  format(data) {
    const time = color('time')(this.extractAndFormatTimestamp(data, 'HH:mm:ss.SSS'));
    const msg = data.error ? color('error')(data.error.stack) : color('message')(data.message);
    const tags = (0, _lodash.default)(data.tags).sortBy(function (tag) {
      if (color(tag) === _lodash.default.identity) return `2${tag}`;
      if (_lodash.default.includes(statuses, tag)) return `0${tag}`;
      return `1${tag}`;
    }).reduce(function (s, t) {
      return s + `[${color(t)(t)}]`;
    }, '');
    return `${workerType}${type(data.type)} [${time}] ${tags} ${msg}`;
  }
}
exports.default = OsdLoggerStringFormat;
module.exports = exports.default;