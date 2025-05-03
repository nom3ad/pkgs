"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatusService = void 0;
var _rxjs = require("rxjs");
var _operators = require("rxjs/operators");
var _util = require("util");
var _routes = require("./routes");
var _status_config = require("./status_config");
var _get_summary_status = require("./get_summary_status");
var _plugins_status = require("./plugins_status");
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
class StatusService {
  constructor(coreContext) {
    this.coreContext = coreContext;
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "config$", void 0);
    _defineProperty(this, "pluginsStatus", void 0);
    _defineProperty(this, "overallSubscription", void 0);
    this.logger = coreContext.logger.get('status');
    this.config$ = coreContext.configService.atPath(_status_config.config.path);
  }
  async setup({
    opensearch,
    pluginDependencies,
    http,
    metrics,
    savedObjects,
    environment
  }) {
    const statusConfig = await this.config$.pipe((0, _operators.take)(1)).toPromise();
    const core$ = this.setupCoreStatus({
      opensearch,
      savedObjects
    });
    this.pluginsStatus = new _plugins_status.PluginsStatusService({
      core$,
      pluginDependencies
    });
    const overall$ = (0, _rxjs.combineLatest)([core$, this.pluginsStatus.getAll$()]).pipe(
    // Prevent many emissions at once from dependency status resolution from making this too noisy
    (0, _operators.debounceTime)(500), (0, _operators.map)(([coreStatus, pluginsStatus]) => {
      const summary = (0, _get_summary_status.getSummaryStatus)([...Object.entries(coreStatus), ...Object.entries(pluginsStatus)]);
      this.logger.debug(`Recalculated overall status`, {
        status: summary
      });
      return summary;
    }), (0, _operators.distinctUntilChanged)(_util.isDeepStrictEqual), (0, _operators.shareReplay)(1));

    // Create an unused subscription to ensure all underlying lazy observables are started.
    this.overallSubscription = overall$.subscribe();
    const router = http.createRouter('');
    (0, _routes.registerStatusRoute)({
      router,
      config: {
        allowAnonymous: statusConfig.allowAnonymous,
        packageInfo: this.coreContext.env.packageInfo,
        serverName: http.getServerInfo().name,
        uuid: environment.instanceUuid
      },
      metrics,
      status: {
        overall$,
        plugins$: this.pluginsStatus.getAll$(),
        core$
      }
    });
    return {
      core$,
      overall$,
      plugins: {
        set: this.pluginsStatus.set.bind(this.pluginsStatus),
        getDependenciesStatus$: this.pluginsStatus.getDependenciesStatus$.bind(this.pluginsStatus),
        getDerivedStatus$: this.pluginsStatus.getDerivedStatus$.bind(this.pluginsStatus)
      },
      isStatusPageAnonymous: () => statusConfig.allowAnonymous
    };
  }
  start() {}
  stop() {
    if (this.overallSubscription) {
      this.overallSubscription.unsubscribe();
      this.overallSubscription = undefined;
    }
  }
  setupCoreStatus({
    opensearch,
    savedObjects
  }) {
    return (0, _rxjs.combineLatest)([opensearch.status$, savedObjects.status$]).pipe((0, _operators.map)(([opensearchStatus, savedObjectsStatus]) => ({
      opensearch: opensearchStatus,
      savedObjects: savedObjectsStatus
    })), (0, _operators.distinctUntilChanged)(_util.isDeepStrictEqual), (0, _operators.shareReplay)(1));
  }
}
exports.StatusService = StatusService;