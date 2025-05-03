"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VisTypeTimeseriesPlugin = void 0;
var _get_vis_data = require("./lib/get_vis_data");
var _validation_telemetry = require("./validation_telemetry");
var _vis = require("./routes/vis");
var _fields = require("./routes/fields");
var _search_strategies = require("./lib/search_strategies");
var _ui_settings = require("./ui_settings");
var _services = require("./lib/services");
var _timeseries_visualization_client_wrapper = require("./lib/timeseries_visualization_client_wrapper");
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
class VisTypeTimeseriesPlugin {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;
    _defineProperty(this, "validationTelementryService", void 0);
    this.initializerContext = initializerContext;
    this.validationTelementryService = new _validation_telemetry.ValidationTelemetryService();
  }
  setup(core, plugins) {
    const logger = this.initializerContext.logger.get('visTypeTimeseries');
    core.uiSettings.register(_ui_settings.uiSettings);
    const config$ = this.initializerContext.config.create();
    // Global config contains things like the OpenSearch shard timeout
    const globalConfig$ = this.initializerContext.config.legacy.globalConfig$;
    const router = core.http.createRouter();
    const searchStrategyRegistry = new _search_strategies.SearchStrategyRegistry();
    const framework = {
      core,
      plugins,
      config$,
      globalConfig$,
      logger,
      router,
      searchStrategyRegistry
    };
    (0, _services.setDataSourceEnabled)({
      enabled: !!plugins.dataSource
    });
    core.savedObjects.addClientWrapper(_timeseries_visualization_client_wrapper.TIMESERIES_VISUALIZATION_CLIENT_WRAPPER_PRIORITY, _timeseries_visualization_client_wrapper.TIMESERIES_VISUALIZATION_CLIENT_WRAPPER_ID, _timeseries_visualization_client_wrapper.timeSeriesVisualizationClientWrapper);
    (async () => {
      const validationTelemetry = await this.validationTelementryService.setup(core, {
        ...plugins,
        globalConfig$
      });
      (0, _vis.visDataRoutes)(router, framework, validationTelemetry);
      (0, _fields.fieldsRoutes)(framework);
    })();
    return {
      getVisData: async (requestContext, fakeRequest, options) => {
        return await (0, _get_vis_data.getVisData)(requestContext, {
          ...fakeRequest,
          body: options
        }, framework);
      },
      addSearchStrategy: searchStrategyRegistry.addStrategy.bind(searchStrategyRegistry)
    };
  }
  start(core) {}
}
exports.VisTypeTimeseriesPlugin = VisTypeTimeseriesPlugin;