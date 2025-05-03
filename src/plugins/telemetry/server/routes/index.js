"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerRoutes = registerRoutes;
var _telemetry_opt_in = require("./telemetry_opt_in");
var _telemetry_usage_stats = require("./telemetry_usage_stats");
var _telemetry_opt_in_stats = require("./telemetry_opt_in_stats");
var _telemetry_user_has_seen_notice = require("./telemetry_user_has_seen_notice");
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

function registerRoutes(options) {
  const {
    isDev,
    telemetryCollectionManager,
    router
  } = options;
  (0, _telemetry_opt_in.registerTelemetryOptInRoutes)(options);
  (0, _telemetry_usage_stats.registerTelemetryUsageStatsRoutes)(router, telemetryCollectionManager, isDev);
  (0, _telemetry_opt_in_stats.registerTelemetryOptInStatsRoutes)(router, telemetryCollectionManager);
  (0, _telemetry_user_has_seen_notice.registerTelemetryUserHasSeenNotice)(router);
}