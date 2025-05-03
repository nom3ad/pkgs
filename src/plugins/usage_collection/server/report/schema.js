"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reportSchema = void 0;
var _configSchema = require("@osd/config-schema");
var _analytics = require("@osd/analytics");
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

const reportSchema = exports.reportSchema = _configSchema.schema.object({
  reportVersion: _configSchema.schema.maybe(_configSchema.schema.literal(1)),
  userAgent: _configSchema.schema.maybe(_configSchema.schema.recordOf(_configSchema.schema.string(), _configSchema.schema.object({
    key: _configSchema.schema.string(),
    type: _configSchema.schema.string(),
    appName: _configSchema.schema.string(),
    userAgent: _configSchema.schema.string()
  }))),
  uiStatsMetrics: _configSchema.schema.maybe(_configSchema.schema.recordOf(_configSchema.schema.string(), _configSchema.schema.object({
    key: _configSchema.schema.string(),
    type: _configSchema.schema.oneOf([_configSchema.schema.literal(_analytics.METRIC_TYPE.CLICK), _configSchema.schema.literal(_analytics.METRIC_TYPE.LOADED), _configSchema.schema.literal(_analytics.METRIC_TYPE.COUNT)]),
    appName: _configSchema.schema.string(),
    eventName: _configSchema.schema.string(),
    stats: _configSchema.schema.object({
      min: _configSchema.schema.number(),
      sum: _configSchema.schema.number(),
      max: _configSchema.schema.number(),
      avg: _configSchema.schema.number()
    })
  }))),
  application_usage: _configSchema.schema.maybe(_configSchema.schema.recordOf(_configSchema.schema.string(), _configSchema.schema.object({
    minutesOnScreen: _configSchema.schema.number(),
    numberOfClicks: _configSchema.schema.number()
  })))
});