"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerDqlTelemetryRoute = registerDqlTelemetryRoute;
var _configSchema = require("@osd/config-schema");
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

function registerDqlTelemetryRoute(router, getStartServices, logger) {
  router.post({
    path: '/api/opensearch-dashboards/dql_opt_in_stats',
    validate: {
      body: _configSchema.schema.object({
        opt_in: _configSchema.schema.boolean()
      })
    }
  }, async (context, request, response) => {
    const [{
      savedObjects
    }] = await getStartServices();
    const {
      body: {
        opt_in: optIn
      }
    } = request;
    const counterName = optIn ? 'optInCount' : 'optOutCount';
    try {
      const internalRepository = savedObjects.createScopedRepository(request);
      await internalRepository.incrementCounter('dql-telemetry', 'dql-telemetry', counterName);
    } catch (error) {
      logger.warn(`Unable to increment counter: ${error}`);
      return response.customError({
        statusCode: error.status || 403,
        body: {
          message: 'Something went wrong',
          attributes: {
            success: false
          }
        }
      });
    }
    return response.ok({
      body: {
        success: true
      }
    });
  });
}