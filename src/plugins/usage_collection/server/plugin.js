"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UsageCollectionPlugin = void 0;
var _operators = require("rxjs/operators");
var _collector = require("./collector");
var _routes = require("./routes");
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
class UsageCollectionPlugin {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "savedObjects", void 0);
    this.logger = this.initializerContext.logger.get();
  }
  async setup(core) {
    const config = await this.initializerContext.config.create().pipe((0, _operators.first)()).toPromise();
    const collectorSet = new _collector.CollectorSet({
      logger: this.logger.get('collector-set'),
      maximumWaitTimeForAllCollectorsInS: config.maximumWaitTimeForAllCollectorsInS
    });
    const globalConfig = await this.initializerContext.config.legacy.globalConfig$.pipe((0, _operators.first)()).toPromise();
    const router = core.http.createRouter();
    (0, _routes.setupRoutes)({
      router,
      getSavedObjects: () => this.savedObjects,
      collectorSet,
      config: {
        allowAnonymous: core.status.isStatusPageAnonymous(),
        opensearchDashboardsIndex: globalConfig.opensearchDashboards.index,
        opensearchDashboardsVersion: this.initializerContext.env.packageInfo.version,
        server: core.http.getServerInfo(),
        uuid: this.initializerContext.env.instanceUuid,
        batchingInterval: config.uiMetric.batchingIntervalInS
      },
      metrics: core.metrics,
      overallStatus$: core.status.overall$
    });
    return collectorSet;
  }
  start({
    savedObjects
  }) {
    this.logger.debug('Starting plugin');
    this.savedObjects = savedObjects.createInternalRepository();
  }
  stop() {
    this.logger.debug('Stopping plugin');
  }
}
exports.UsageCollectionPlugin = UsageCollectionPlugin;