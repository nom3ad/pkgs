"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sampleDataSchema = void 0;
var _joi = _interopRequireDefault(require("joi"));
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

const dataIndexSchema = _joi.default.object({
  id: _joi.default.string().regex(/^[a-zA-Z0-9-]+$/).required(),
  // path to newline delimented JSON file containing data relative to OPENSEARCH_DASHBOARDS_HOME
  dataPath: _joi.default.string().required(),
  // Object defining OpenSearch field mappings (contents of index.mappings.type.properties)
  fields: _joi.default.object().required(),
  // times fields that will be updated relative to now when data is installed
  timeFields: _joi.default.array().items(_joi.default.string()).required(),
  // Reference to now in your test data set.
  // When data is installed, timestamps are converted to the present time.
  // The distance between a timestamp and currentTimeMarker is preserved but the date and time will change.
  // For example:
  //   sample data set:    timestamp: 2018-01-01T00:00:00Z, currentTimeMarker: 2018-01-01T12:00:00Z
  //   installed data set: timestamp: 2018-04-18T20:33:14Z, currentTimeMarker: 2018-04-19T08:33:14Z
  currentTimeMarker: _joi.default.string().isoDate().required(),
  // Set to true to move timestamp to current week, preserving day of week and time of day
  // Relative distance from timestamp to currentTimeMarker will not remain the same
  preserveDayOfWeekTimeOfDay: _joi.default.boolean().default(false)
});
const appLinkSchema = _joi.default.object({
  path: _joi.default.string().required(),
  label: _joi.default.string().required(),
  icon: _joi.default.string().required()
});
const sampleDataSchema = exports.sampleDataSchema = {
  id: _joi.default.string().regex(/^[a-zA-Z0-9-]+$/).required(),
  name: _joi.default.string().required(),
  description: _joi.default.string().required(),
  previewImagePath: _joi.default.string().required(),
  darkPreviewImagePath: _joi.default.string(),
  hasNewThemeImages: _joi.default.boolean(),
  // saved object id of main dashboard for sample data set
  overviewDashboard: _joi.default.string().required(),
  getDataSourceIntegratedDashboard: _joi.default.func().required(),
  appLinks: _joi.default.array().items(appLinkSchema).default([]),
  // saved object id of default index-pattern for sample data set
  defaultIndex: _joi.default.string().required(),
  getDataSourceIntegratedDefaultIndex: _joi.default.func().required(),
  // OpenSearch Dashboards saved objects (index patter, visualizations, dashboard, ...)
  // Should provide a nice demo of OpenSearch Dashboards's functionality with the sample data set
  savedObjects: _joi.default.array().items(_joi.default.object()).required(),
  getDataSourceIntegratedSavedObjects: _joi.default.func().required(),
  dataIndices: _joi.default.array().items(dataIndexSchema).required(),
  status: _joi.default.string(),
  statusMsg: _joi.default.any()
};