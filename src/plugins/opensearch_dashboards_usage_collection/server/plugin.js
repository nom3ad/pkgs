"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenSearchDashboardsUsageCollectionPlugin = void 0;
var _rxjs = require("rxjs");
var _server = require("../../../core/server");
var _collectors = require("./collectors");
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
 */
class OpenSearchDashboardsUsageCollectionPlugin {
  constructor(initializerContext) {
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "legacyConfig$", void 0);
    _defineProperty(this, "savedObjectsClient", void 0);
    _defineProperty(this, "uiSettingsClient", void 0);
    _defineProperty(this, "metric$", void 0);
    _defineProperty(this, "coreUsageData", void 0);
    this.logger = initializerContext.logger.get();
    this.legacyConfig$ = initializerContext.config.legacy.globalConfig$;
    this.metric$ = new _rxjs.Subject();
  }
  setup(coreSetup, {
    usageCollection
  }) {
    this.registerUsageCollectors(usageCollection, coreSetup, this.metric$, opts => coreSetup.savedObjects.registerType(opts));
  }
  start(core) {
    const {
      savedObjects,
      uiSettings
    } = core;
    this.savedObjectsClient = savedObjects.createInternalRepository();
    const savedObjectsClient = new _server.SavedObjectsClient(this.savedObjectsClient);
    this.uiSettingsClient = uiSettings.asScopedToClient(savedObjectsClient);
    core.metrics.getOpsMetrics$().subscribe(this.metric$);
    this.coreUsageData = core.coreUsageData;
  }
  stop() {
    this.metric$.complete();
  }
  registerUsageCollectors(usageCollection, coreSetup, metric$, registerType) {
    const getSavedObjectsClient = () => this.savedObjectsClient;
    const getUiSettingsClient = () => this.uiSettingsClient;
    const getCoreUsageDataService = () => this.coreUsageData;
    (0, _collectors.registerOpsStatsCollector)(usageCollection, metric$);
    (0, _collectors.registerOpenSearchDashboardsUsageCollector)(usageCollection, this.legacyConfig$);
    (0, _collectors.registerManagementUsageCollector)(usageCollection, getUiSettingsClient);
    (0, _collectors.registerUiMetricUsageCollector)(usageCollection, registerType, getSavedObjectsClient);
    (0, _collectors.registerApplicationUsageCollector)(this.logger.get('application-usage'), usageCollection, registerType, getSavedObjectsClient);
    (0, _collectors.registerCspCollector)(usageCollection, coreSetup.http);
    (0, _collectors.registerCoreUsageCollector)(usageCollection, getCoreUsageDataService);
  }
}
exports.OpenSearchDashboardsUsageCollectionPlugin = OpenSearchDashboardsUsageCollectionPlugin;