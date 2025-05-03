"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerTelemetryUsageStatsRoutes = registerTelemetryUsageStatsRoutes;
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

const validate = value => {
  if (!(0, _moment.default)(value).isValid()) {
    return `${value} is not a valid date`;
  }
};
const dateSchema = _configSchema.schema.oneOf([_configSchema.schema.string({
  validate
}), _configSchema.schema.number({
  validate
})]);
function registerTelemetryUsageStatsRoutes(router, telemetryCollectionManager, isDev) {
  router.post({
    path: '/api/telemetry/v2/clusters/_stats',
    validate: {
      body: _configSchema.schema.object({
        unencrypted: _configSchema.schema.boolean({
          defaultValue: false
        }),
        timeRange: _configSchema.schema.object({
          min: dateSchema,
          max: dateSchema
        })
      })
    }
  }, async (context, req, res) => {
    const start = (0, _moment.default)(req.body.timeRange.min).toISOString();
    const end = (0, _moment.default)(req.body.timeRange.max).toISOString();
    const unencrypted = req.body.unencrypted;
    try {
      const statsConfig = {
        unencrypted,
        start,
        end,
        request: req
      };
      const stats = await telemetryCollectionManager.getStats(statsConfig);
      return res.ok({
        body: stats
      });
    } catch (err) {
      if (isDev) {
        // don't ignore errors when running in dev mode
        throw err;
      }
      if (unencrypted && err.status === 403) {
        return res.forbidden();
      }
      // ignore errors and return empty set
      return res.ok({
        body: []
      });
    }
  });
}