"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerTelemetryUserHasSeenNotice = registerTelemetryUserHasSeenNotice;
var _telemetry_repository = require("../telemetry_repository");
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

function registerTelemetryUserHasSeenNotice(router) {
  router.put({
    path: '/api/telemetry/v2/userHasSeenNotice',
    validate: false
  }, async (context, req, res) => {
    const internalRepository = context.core.savedObjects.client;
    const telemetrySavedObject = await (0, _telemetry_repository.getTelemetrySavedObject)(internalRepository);

    // update the object with a flag stating that the opt-in notice has been seen
    const updatedAttributes = {
      ...telemetrySavedObject,
      userHasSeenNotice: true
    };
    await (0, _telemetry_repository.updateTelemetrySavedObject)(internalRepository, updatedAttributes);
    return res.ok({
      body: updatedAttributes
    });
  });
}