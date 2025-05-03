"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MetricsService = void 0;
var _rxjs = require("rxjs");
var _operators = require("rxjs/operators");
var _ops_metrics_collector = require("./ops_metrics_collector");
var _ops_config = require("./ops_config");
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
/** @internal */
class MetricsService {
  constructor(coreContext) {
    this.coreContext = coreContext;
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "metricsCollector", void 0);
    _defineProperty(this, "collectInterval", void 0);
    _defineProperty(this, "metrics$", new _rxjs.ReplaySubject(1));
    _defineProperty(this, "service", void 0);
    this.logger = coreContext.logger.get('metrics');
  }
  async setup({
    http
  }) {
    const config = await this.coreContext.configService.atPath(_ops_config.opsConfig.path).pipe((0, _operators.first)()).toPromise();
    this.metricsCollector = new _ops_metrics_collector.OpsMetricsCollector(http.server, {
      logger: this.logger,
      ...config.cGroupOverrides
    });
    await this.refreshMetrics();
    this.collectInterval = setInterval(() => {
      this.refreshMetrics();
    }, config.interval.asMilliseconds());
    const metricsObservable = this.metrics$.asObservable();
    this.service = {
      collectionInterval: config.interval.asMilliseconds(),
      getOpsMetrics$: () => metricsObservable
    };
    return this.service;
  }
  async start() {
    if (!this.service) {
      throw new Error('#setup() needs to be run first');
    }
    return this.service;
  }
  async refreshMetrics() {
    this.logger.debug('Refreshing metrics');
    const metrics = await this.metricsCollector.collect();
    this.metricsCollector.reset();
    this.metrics$.next(metrics);
  }
  async stop() {
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
    }
    this.metrics$.complete();
  }
}
exports.MetricsService = MetricsService;