"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FetcherTask = void 0;
var _moment = _interopRequireDefault(require("moment"));
var _rxjs = require("rxjs");
var _operators = require("rxjs/operators");
var _nodeFetch = _interopRequireDefault(require("node-fetch"));
var _server = require("../../../core/server");
var _telemetry_config = require("../common/telemetry_config");
var _telemetry_repository = require("./telemetry_repository");
var _constants = require("../common/constants");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
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
 */ // @ts-ignore
class FetcherTask {
  constructor(initializerContext) {
    _defineProperty(this, "initialCheckDelayMs", 60 * 1000 * 5);
    _defineProperty(this, "checkIntervalMs", 60 * 1000 * 60 * 12);
    _defineProperty(this, "config$", void 0);
    _defineProperty(this, "currentOpenSearchDashboardsVersion", void 0);
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "intervalId", void 0);
    _defineProperty(this, "lastReported", void 0);
    _defineProperty(this, "isSending", false);
    _defineProperty(this, "internalRepository", void 0);
    _defineProperty(this, "telemetryCollectionManager", void 0);
    _defineProperty(this, "opensearchClient", void 0);
    this.config$ = initializerContext.config.create();
    this.currentOpenSearchDashboardsVersion = initializerContext.env.packageInfo.version;
    this.logger = initializerContext.logger.get('fetcher');
  }
  start({
    savedObjects,
    opensearch
  }, {
    telemetryCollectionManager
  }) {
    this.internalRepository = new _server.SavedObjectsClient(savedObjects.createInternalRepository());
    this.telemetryCollectionManager = telemetryCollectionManager;
    this.opensearchClient = opensearch.legacy.createClient('telemetry-fetcher');
    this.intervalId = (0, _rxjs.timer)(this.initialCheckDelayMs, this.checkIntervalMs).subscribe(() => this.sendIfDue());
  }
  stop() {
    if (this.intervalId) {
      this.intervalId.unsubscribe();
    }
    if (this.opensearchClient) {
      this.opensearchClient.close();
    }
  }
  async areAllCollectorsReady() {
    var _await$this$telemetry, _this$telemetryCollec;
    return (_await$this$telemetry = await ((_this$telemetryCollec = this.telemetryCollectionManager) === null || _this$telemetryCollec === void 0 ? void 0 : _this$telemetryCollec.areAllCollectorsReady())) !== null && _await$this$telemetry !== void 0 ? _await$this$telemetry : false;
  }
  async sendIfDue() {
    if (this.isSending) {
      return;
    }
    let telemetryConfig;
    try {
      telemetryConfig = await this.getCurrentConfigs();
    } catch (err) {
      this.logger.warn(`Error getting telemetry configs. (${err})`);
      return;
    }
    if (!telemetryConfig || !this.shouldSendReport(telemetryConfig)) {
      return;
    }
    let clusters = [];
    this.isSending = true;
    try {
      const allCollectorsReady = await this.areAllCollectorsReady();
      if (!allCollectorsReady) {
        throw new Error('Not all collectors are ready.');
      }
      clusters = await this.fetchTelemetry();
    } catch (err) {
      this.logger.warn(`Error fetching usage. (${err})`);
      this.isSending = false;
      return;
    }
    try {
      const {
        telemetryUrl
      } = telemetryConfig;
      for (const cluster of clusters) {
        await this.sendTelemetry(telemetryUrl, cluster);
      }
      await this.updateLastReported();
    } catch (err) {
      await this.updateReportFailure(telemetryConfig);
      this.logger.warn(`Error sending telemetry usage data. (${err})`);
    }
    this.isSending = false;
  }
  async getCurrentConfigs() {
    const telemetrySavedObject = await (0, _telemetry_repository.getTelemetrySavedObject)(this.internalRepository);
    const config = await this.config$.pipe((0, _operators.take)(1)).toPromise();
    const currentOpenSearchDashboardsVersion = this.currentOpenSearchDashboardsVersion;
    const configTelemetrySendUsageFrom = config.sendUsageFrom;
    const allowChangingOptInStatus = config.allowChangingOptInStatus;
    const configTelemetryOptIn = typeof config.optIn === 'undefined' ? null : config.optIn;
    const telemetryUrl = config.url;
    const {
      failureCount,
      failureVersion
    } = (0, _telemetry_config.getTelemetryFailureDetails)({
      telemetrySavedObject
    });
    return {
      telemetryOptIn: (0, _telemetry_config.getTelemetryOptIn)({
        currentOpenSearchDashboardsVersion,
        telemetrySavedObject,
        allowChangingOptInStatus,
        configTelemetryOptIn
      }),
      telemetrySendUsageFrom: (0, _telemetry_config.getTelemetrySendUsageFrom)({
        telemetrySavedObject,
        configTelemetrySendUsageFrom
      }),
      telemetryUrl,
      failureCount,
      failureVersion
    };
  }
  async updateLastReported() {
    this.lastReported = Date.now();
    (0, _telemetry_repository.updateTelemetrySavedObject)(this.internalRepository, {
      reportFailureCount: 0,
      lastReported: this.lastReported
    });
  }
  async updateReportFailure({
    failureCount
  }) {
    (0, _telemetry_repository.updateTelemetrySavedObject)(this.internalRepository, {
      reportFailureCount: failureCount + 1,
      reportFailureVersion: this.currentOpenSearchDashboardsVersion
    });
  }
  shouldSendReport({
    telemetryOptIn,
    telemetrySendUsageFrom,
    reportFailureCount,
    currentVersion,
    reportFailureVersion
  }) {
    if (reportFailureCount > 2 && reportFailureVersion === currentVersion) {
      return false;
    }
    if (telemetryOptIn && telemetrySendUsageFrom === 'server') {
      if (!this.lastReported || Date.now() - this.lastReported > _constants.REPORT_INTERVAL_MS) {
        return true;
      }
    }
    return false;
  }
  async fetchTelemetry() {
    return await this.telemetryCollectionManager.getStats({
      unencrypted: false,
      start: (0, _moment.default)().subtract(20, 'minutes').toISOString(),
      end: (0, _moment.default)().toISOString()
    });
  }
  async sendTelemetry(url, cluster) {
    this.logger.debug(`Sending usage stats.`);
    /**
     * send OPTIONS before sending usage data.
     * OPTIONS is less intrusive as it does not contain any payload and is used here to check if the endpoint is reachable.
     */
    await (0, _nodeFetch.default)(url, {
      method: 'options'
    });
    await (0, _nodeFetch.default)(url, {
      method: 'post',
      body: cluster
    });
  }
}
exports.FetcherTask = FetcherTask;