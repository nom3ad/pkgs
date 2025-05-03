"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flightsSpecProvider = void 0;
var _path = _interopRequireDefault(require("path"));
var _i18n = require("@osd/i18n");
var _saved_objects = require("./saved_objects");
var _field_mappings = require("./field_mappings");
var _util = require("../util");
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

const flightsName = _i18n.i18n.translate('home.sampleData.flightsSpecTitle', {
  defaultMessage: 'Sample flight data'
});
const flightsDescription = _i18n.i18n.translate('home.sampleData.flightsSpecDescription', {
  defaultMessage: 'Sample data, visualizations, and dashboards for monitoring flight routes.'
});
const initialAppLinks = [];
const DEFAULT_INDEX = 'd3d7af60-4c81-11e8-b3d7-01146121b73d';
const DASHBOARD_ID = '7adfa750-4c81-11e8-b3d7-01146121b73d';
const flightsSpecProvider = function () {
  return {
    id: 'flights',
    name: flightsName,
    description: flightsDescription,
    previewImagePath: '/plugins/home/assets/sample_data_resources/flights/dashboard.png',
    darkPreviewImagePath: '/plugins/home/assets/sample_data_resources/flights/dashboard_dark.png',
    hasNewThemeImages: true,
    overviewDashboard: DASHBOARD_ID,
    getDataSourceIntegratedDashboard: (0, _util.appendDataSourceId)(DASHBOARD_ID),
    appLinks: initialAppLinks,
    defaultIndex: DEFAULT_INDEX,
    getDataSourceIntegratedDefaultIndex: (0, _util.appendDataSourceId)(DEFAULT_INDEX),
    savedObjects: (0, _saved_objects.getSavedObjects)(),
    getDataSourceIntegratedSavedObjects: (dataSourceId, dataSourceTitle) => (0, _util.getSavedObjectsWithDataSource)((0, _saved_objects.getSavedObjects)(), dataSourceId, dataSourceTitle),
    getWorkspaceIntegratedSavedObjects: workspaceId => (0, _util.overwriteSavedObjectsWithWorkspaceId)((0, _saved_objects.getSavedObjects)(), workspaceId),
    dataIndices: [{
      id: 'flights',
      dataPath: _path.default.join(__dirname, './flights.json.gz'),
      fields: _field_mappings.fieldMappings,
      timeFields: ['timestamp'],
      currentTimeMarker: '2018-01-09T00:00:00',
      preserveDayOfWeekTimeOfDay: true
    }],
    status: 'not_installed'
  };
};
exports.flightsSpecProvider = flightsSpecProvider;