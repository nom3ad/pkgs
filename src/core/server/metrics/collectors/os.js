"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OsMetricsCollector = void 0;
var _os = _interopRequireDefault(require("os"));
var _getos = _interopRequireDefault(require("getos"));
var _util = require("util");
var _cgroup = require("./cgroup");
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
const getos = (0, _util.promisify)(_getos.default);
class OsMetricsCollector {
  constructor(options) {
    _defineProperty(this, "cgroupCollector", void 0);
    this.cgroupCollector = new _cgroup.OsCgroupMetricsCollector({
      ...options,
      logger: options.logger.get('cgroup')
    });
  }
  async collect() {
    const platform = _os.default.platform();
    const load = _os.default.loadavg();
    const metrics = {
      platform,
      platformRelease: `${platform}-${_os.default.release()}`,
      load: {
        '1m': load[0],
        '5m': load[1],
        '15m': load[2]
      },
      memory: {
        total_in_bytes: _os.default.totalmem(),
        free_in_bytes: _os.default.freemem(),
        used_in_bytes: _os.default.totalmem() - _os.default.freemem()
      },
      uptime_in_millis: _os.default.uptime() * 1000,
      ...(await this.getDistroStats(platform)),
      ...(await this.cgroupCollector.collect())
    };
    return metrics;
  }
  reset() {}
  async getDistroStats(platform) {
    if (platform === 'linux') {
      try {
        const distro = await getos();
        return {
          distro: distro.dist,
          distroRelease: `${distro.dist}-${distro.release}`
        };
      } catch (e) {
        // ignore errors
      }
    }
    return {};
  }
}
exports.OsMetricsCollector = OsMetricsCollector;