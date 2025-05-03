"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TelemetryPlugin = void 0;
var _url = require("url");
var _rxjs = require("rxjs");
var _operators = require("rxjs/operators");
var _server = require("../../../core/server");
var _routes = require("./routes");
var _telemetry_collection = require("./telemetry_collection");
var _collectors = require("./collectors");
var _fetcher = require("./fetcher");
var _handle_old_settings = require("./handle_old_settings");
var _telemetry_repository = require("./telemetry_repository");
var _telemetry_config = require("../common/telemetry_config");
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
class TelemetryPlugin {
  constructor(initializerContext) {
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "currentOpenSearchDashboardsVersion", void 0);
    _defineProperty(this, "config$", void 0);
    _defineProperty(this, "isDev", void 0);
    _defineProperty(this, "fetcherTask", void 0);
    /**
     * @private Used to mark the completion of the old UI Settings migration
     */
    _defineProperty(this, "oldUiSettingsHandled$", new _rxjs.AsyncSubject());
    _defineProperty(this, "savedObjectsClient", void 0);
    _defineProperty(this, "opensearchClient", void 0);
    this.logger = initializerContext.logger.get();
    this.isDev = initializerContext.env.mode.dev;
    this.currentOpenSearchDashboardsVersion = initializerContext.env.packageInfo.version;
    this.config$ = initializerContext.config.create();
    this.fetcherTask = new _fetcher.FetcherTask({
      ...initializerContext,
      logger: this.logger
    });
  }
  setup({
    opensearch,
    http,
    savedObjects
  }, {
    usageCollection,
    telemetryCollectionManager
  }) {
    const currentOpenSearchDashboardsVersion = this.currentOpenSearchDashboardsVersion;
    const config$ = this.config$;
    const isDev = this.isDev;
    (0, _telemetry_collection.registerCollection)(telemetryCollectionManager, opensearch.legacy.client, () => this.opensearchClient);
    const router = http.createRouter();
    (0, _routes.registerRoutes)({
      config$,
      currentOpenSearchDashboardsVersion,
      isDev,
      logger: this.logger,
      router,
      telemetryCollectionManager
    });
    this.registerMappings(opts => savedObjects.registerType(opts));
    this.registerUsageCollectors(usageCollection);
    return {
      getTelemetryUrl: async () => {
        const config = await config$.pipe((0, _operators.take)(1)).toPromise();
        return new _url.URL(config.url);
      }
    };
  }
  start(core, {
    telemetryCollectionManager
  }) {
    const {
      savedObjects,
      uiSettings,
      opensearch
    } = core;
    const savedObjectsInternalRepository = savedObjects.createInternalRepository();
    this.savedObjectsClient = savedObjectsInternalRepository;
    this.opensearchClient = opensearch.client;

    // Not catching nor awaiting these promises because they should never reject
    this.handleOldUiSettings(uiSettings);
    this.startFetcherWhenOldSettingsAreHandled(core, telemetryCollectionManager);
    return {
      getIsOptedIn: async () => {
        await this.oldUiSettingsHandled$.pipe((0, _operators.take)(1)).toPromise(); // Wait for the old settings to be handled
        const internalRepository = new _server.SavedObjectsClient(savedObjectsInternalRepository);
        const telemetrySavedObject = await (0, _telemetry_repository.getTelemetrySavedObject)(internalRepository);
        const config = await this.config$.pipe((0, _operators.take)(1)).toPromise();
        const allowChangingOptInStatus = config.allowChangingOptInStatus;
        const configTelemetryOptIn = typeof config.optIn === 'undefined' ? null : config.optIn;
        const currentOpenSearchDashboardsVersion = this.currentOpenSearchDashboardsVersion;
        const isOptedIn = (0, _telemetry_config.getTelemetryOptIn)({
          currentOpenSearchDashboardsVersion,
          telemetrySavedObject,
          allowChangingOptInStatus,
          configTelemetryOptIn
        });
        return isOptedIn === true;
      }
    };
  }
  async handleOldUiSettings(uiSettings) {
    const savedObjectsClient = new _server.SavedObjectsClient(this.savedObjectsClient);
    const uiSettingsClient = uiSettings.asScopedToClient(savedObjectsClient);
    try {
      await (0, _handle_old_settings.handleOldSettings)(savedObjectsClient, uiSettingsClient);
    } catch (error) {
      this.logger.warn('Unable to update legacy telemetry configs.');
    }
    // Set the mark in the AsyncSubject as complete so all the methods that require this method to be completed before working, can move on
    this.oldUiSettingsHandled$.complete();
  }
  async startFetcherWhenOldSettingsAreHandled(core, telemetryCollectionManager) {
    await this.oldUiSettingsHandled$.pipe((0, _operators.take)(1)).toPromise(); // Wait for the old settings to be handled
    this.fetcherTask.start(core, {
      telemetryCollectionManager
    });
  }
  registerMappings(registerType) {
    registerType({
      name: 'telemetry',
      hidden: false,
      namespaceType: 'agnostic',
      mappings: {
        properties: {
          enabled: {
            type: 'boolean'
          },
          sendUsageFrom: {
            type: 'keyword'
          },
          lastReported: {
            type: 'date'
          },
          lastVersionChecked: {
            type: 'keyword'
          },
          userHasSeenNotice: {
            type: 'boolean'
          },
          reportFailureCount: {
            type: 'integer'
          },
          reportFailureVersion: {
            type: 'keyword'
          },
          allowChangingOptInStatus: {
            type: 'boolean'
          }
        }
      }
    });
  }
  registerUsageCollectors(usageCollection) {
    const getSavedObjectsClient = () => this.savedObjectsClient;
    (0, _collectors.registerTelemetryPluginUsageCollector)(usageCollection, {
      currentOpenSearchDashboardsVersion: this.currentOpenSearchDashboardsVersion,
      config$: this.config$,
      getSavedObjectsClient
    });
    (0, _collectors.registerTelemetryUsageCollector)(usageCollection, this.config$);
  }
}
exports.TelemetryPlugin = TelemetryPlugin;