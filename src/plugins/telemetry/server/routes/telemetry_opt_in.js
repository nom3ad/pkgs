"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerTelemetryOptInRoutes = registerTelemetryOptInRoutes;
var _moment = _interopRequireDefault(require("moment"));
var _operators = require("rxjs/operators");
var _configSchema = require("@osd/config-schema");
var _server = require("../../../../core/server");
var _telemetry_config = require("../../common/telemetry_config");
var _telemetry_opt_in_stats = require("./telemetry_opt_in_stats");
var _telemetry_repository = require("../telemetry_repository");
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

function registerTelemetryOptInRoutes({
  config$,
  logger,
  router,
  currentOpenSearchDashboardsVersion,
  telemetryCollectionManager
}) {
  router.post({
    path: '/api/telemetry/v2/optIn',
    validate: {
      body: _configSchema.schema.object({
        enabled: _configSchema.schema.boolean()
      })
    }
  }, async (context, req, res) => {
    const newOptInStatus = req.body.enabled;
    const attributes = {
      enabled: newOptInStatus,
      lastVersionChecked: currentOpenSearchDashboardsVersion
    };
    const config = await config$.pipe((0, _operators.take)(1)).toPromise();
    const telemetrySavedObject = await (0, _telemetry_repository.getTelemetrySavedObject)(context.core.savedObjects.client);
    if (telemetrySavedObject === false) {
      // If we get false, we couldn't get the saved object due to lack of permissions
      // so we can assume the user won't be able to update it either
      return res.forbidden();
    }
    const configTelemetryAllowChangingOptInStatus = config.allowChangingOptInStatus;
    const allowChangingOptInStatus = (0, _telemetry_config.getTelemetryAllowChangingOptInStatus)({
      telemetrySavedObject,
      configTelemetryAllowChangingOptInStatus
    });
    if (!allowChangingOptInStatus) {
      return res.badRequest({
        body: JSON.stringify({
          error: 'Not allowed to change Opt-in Status.'
        })
      });
    }
    const statsGetterConfig = {
      start: (0, _moment.default)().subtract(20, 'minutes').toISOString(),
      end: (0, _moment.default)().toISOString(),
      unencrypted: false
    };
    const optInStatus = await telemetryCollectionManager.getOptInStats(newOptInStatus, statsGetterConfig);
    if (config.sendUsageFrom === 'server') {
      const optInStatusUrl = config.optInStatusUrl;
      (0, _telemetry_opt_in_stats.sendTelemetryOptInStatus)(telemetryCollectionManager, {
        optInStatusUrl,
        newOptInStatus
      }, statsGetterConfig).catch(err => {
        // The server is likely behind a firewall and can't reach the remote service
        logger.warn(`Failed to notify "${optInStatusUrl}" from the server about the opt-in selection. Possibly blocked by a firewall? - Error: ${err.message}`);
      });
    }
    try {
      await (0, _telemetry_repository.updateTelemetrySavedObject)(context.core.savedObjects.client, attributes);
    } catch (e) {
      if (_server.SavedObjectsErrorHelpers.isForbiddenError(e)) {
        return res.forbidden();
      }
    }
    return res.ok({
      body: optInStatus
    });
  });
}