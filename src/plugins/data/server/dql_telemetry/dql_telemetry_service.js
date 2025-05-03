"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DqlTelemetryService = void 0;
var _operators = require("rxjs/operators");
var _route = require("./route");
var _usage_collector = require("./usage_collector");
var _saved_objects = require("../saved_objects");
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

class DqlTelemetryService {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;
  }
  setup({
    http,
    getStartServices,
    savedObjects
  }, {
    usageCollection
  }) {
    savedObjects.registerType(_saved_objects.dqlTelemetry);
    (0, _route.registerDqlTelemetryRoute)(http.createRouter(), getStartServices, this.initializerContext.logger.get('data', 'dql-telemetry'));
    if (usageCollection) {
      this.initializerContext.config.legacy.globalConfig$.pipe((0, _operators.first)()).toPromise().then(config => (0, _usage_collector.makeDQLUsageCollector)(usageCollection, config.opensearchDashboards.index)).catch(e => {
        this.initializerContext.logger.get('dql-telemetry').warn(`Registering DQL telemetry collector failed: ${e}`);
      });
    }
  }
  start() {}
}
exports.DqlTelemetryService = DqlTelemetryService;