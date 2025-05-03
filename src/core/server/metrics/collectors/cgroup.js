"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OsCgroupMetricsCollector = void 0;
var _fs = _interopRequireDefault(require("fs"));
var _path = require("path");
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
class OsCgroupMetricsCollector {
  constructor(options) {
    this.options = options;
    /**  Used to prevent unnecessary file reads on systems not using cgroups. */
    _defineProperty(this, "noCgroupPresent", false);
    _defineProperty(this, "cpuPath", void 0);
    _defineProperty(this, "cpuAcctPath", void 0);
  }
  async collect() {
    try {
      if (this.noCgroupPresent) {
        return {};
      }
      await this.initializePaths();
      if (!this.cpuAcctPath || !this.cpuPath) {
        return {};
      }
      const [cpuAcctUsage, cpuFsPeriod, cpuFsQuota, cpuStat] = await Promise.all([readCPUAcctUsage(this.cpuAcctPath), readCPUFsPeriod(this.cpuPath), readCPUFsQuota(this.cpuPath), readCPUStat(this.cpuPath)]);
      return {
        cpuacct: {
          control_group: this.cpuAcctPath,
          usage_nanos: cpuAcctUsage
        },
        cpu: {
          control_group: this.cpuPath,
          cfs_period_micros: cpuFsPeriod,
          cfs_quota_micros: cpuFsQuota,
          stat: cpuStat
        }
      };
    } catch (err) {
      this.noCgroupPresent = true;
      if (err.code !== 'ENOENT') {
        this.options.logger.error(`cgroup metrics could not be read due to error: [${err.toString()}]`);
      }
      return {};
    }
  }
  reset() {}
  async initializePaths() {
    // Perform this setup lazily on the first collect call and then memoize the results.
    // Makes the assumption this data doesn't change while the process is running.
    if (this.cpuPath && this.cpuAcctPath) {
      return;
    }

    // Only read the file if both options are undefined.
    if (!this.options.cpuPath || !this.options.cpuAcctPath) {
      const cgroups = await readControlGroups();
      this.cpuPath = this.options.cpuPath || cgroups[GROUP_CPU];
      this.cpuAcctPath = this.options.cpuAcctPath || cgroups[GROUP_CPUACCT];
    } else {
      this.cpuPath = this.options.cpuPath;
      this.cpuAcctPath = this.options.cpuAcctPath;
    }

    // prevents undefined cgroup paths
    if (!this.cpuPath || !this.cpuAcctPath) {
      this.noCgroupPresent = true;
    }
  }
}
exports.OsCgroupMetricsCollector = OsCgroupMetricsCollector;
const CONTROL_GROUP_RE = new RegExp('\\d+:([^:]+):(/.*)');
const CONTROLLER_SEPARATOR_RE = ',';
const PROC_SELF_CGROUP_FILE = '/proc/self/cgroup';
const PROC_CGROUP_CPU_DIR = '/sys/fs/cgroup/cpu';
const PROC_CGROUP_CPUACCT_DIR = '/sys/fs/cgroup/cpuacct';
const GROUP_CPUACCT = 'cpuacct';
const CPUACCT_USAGE_FILE = 'cpuacct.usage';
const GROUP_CPU = 'cpu';
const CPU_FS_PERIOD_US_FILE = 'cpu.cfs_period_us';
const CPU_FS_QUOTA_US_FILE = 'cpu.cfs_quota_us';
const CPU_STATS_FILE = 'cpu.stat';
async function readControlGroups() {
  const data = await _fs.default.promises.readFile(PROC_SELF_CGROUP_FILE);
  return data.toString().split(/\n/).reduce((acc, line) => {
    const matches = line.match(CONTROL_GROUP_RE);
    if (matches !== null) {
      const controllers = matches[1].split(CONTROLLER_SEPARATOR_RE);
      controllers.forEach(controller => {
        acc[controller] = matches[2];
      });
    }
    return acc;
  }, {});
}
async function fileContentsToInteger(path) {
  const data = await _fs.default.promises.readFile(path);
  return parseInt(data.toString(), 10);
}
function readCPUAcctUsage(controlGroup) {
  return fileContentsToInteger((0, _path.join)(PROC_CGROUP_CPUACCT_DIR, controlGroup, CPUACCT_USAGE_FILE));
}
function readCPUFsPeriod(controlGroup) {
  return fileContentsToInteger((0, _path.join)(PROC_CGROUP_CPU_DIR, controlGroup, CPU_FS_PERIOD_US_FILE));
}
function readCPUFsQuota(controlGroup) {
  return fileContentsToInteger((0, _path.join)(PROC_CGROUP_CPU_DIR, controlGroup, CPU_FS_QUOTA_US_FILE));
}
async function readCPUStat(controlGroup) {
  const stat = {
    number_of_elapsed_periods: -1,
    number_of_times_throttled: -1,
    time_throttled_nanos: -1
  };
  try {
    const data = await _fs.default.promises.readFile((0, _path.join)(PROC_CGROUP_CPU_DIR, controlGroup, CPU_STATS_FILE));
    return data.toString().split(/\n/).reduce((acc, line) => {
      const fields = line.split(/\s+/);
      switch (fields[0]) {
        case 'nr_periods':
          acc.number_of_elapsed_periods = parseInt(fields[1], 10);
          break;
        case 'nr_throttled':
          acc.number_of_times_throttled = parseInt(fields[1], 10);
          break;
        case 'throttled_time':
          acc.time_throttled_nanos = parseInt(fields[1], 10);
          break;
      }
      return acc;
    }, stat);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return stat;
    }
    throw err;
  }
}