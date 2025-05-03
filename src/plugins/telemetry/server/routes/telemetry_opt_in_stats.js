"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerTelemetryOptInStatsRoutes = registerTelemetryOptInStatsRoutes;
exports.sendTelemetryOptInStatus = sendTelemetryOptInStatus;
var _nodeFetch = _interopRequireDefault(require("node-fetch"));
var _moment = _interopRequireDefault(require("moment"));
var _configSchema = require("@osd/config-schema");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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

// @ts-ignore

async function sendTelemetryOptInStatus(telemetryCollectionManager, config, statsGetterConfig) {
  const {
    optInStatusUrl,
    newOptInStatus
  } = config;
  const optInStatus = await telemetryCollectionManager.getOptInStats(newOptInStatus, statsGetterConfig);
  await (0, _nodeFetch.default)(optInStatusUrl, {
    method: 'post',
    body: optInStatus
  });
}
function registerTelemetryOptInStatsRoutes(router, telemetryCollectionManager) {
  router.post({
    path: '/api/telemetry/v2/clusters/_opt_in_stats',
    validate: {
      body: _configSchema.schema.object({
        enabled: _configSchema.schema.boolean(),
        unencrypted: _configSchema.schema.boolean({
          defaultValue: true
        })
      })
    }
  }, async (context, req, res) => {
    try {
      const newOptInStatus = req.body.enabled;
      const unencrypted = req.body.unencrypted;
      const statsGetterConfig = {
        start: (0, _moment.default)().subtract(20, 'minutes').toISOString(),
        end: (0, _moment.default)().toISOString(),
        unencrypted,
        request: req
      };
      const optInStatus = await telemetryCollectionManager.getOptInStats(newOptInStatus, statsGetterConfig);
      return res.ok({
        body: optInStatus
      });
    } catch (err) {
      return res.ok({
        body: []
      });
    }
  });
}