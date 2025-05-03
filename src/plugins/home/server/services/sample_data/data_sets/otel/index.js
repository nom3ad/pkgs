"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.otelSpecProvider = void 0;
var _i18n = require("@osd/i18n");
var _path = _interopRequireDefault(require("path"));
var _util = require("../util");
var _logs_field_mappings = require("./logs_field_mappings");
var _metrics_field_mappings = require("./metrics_field_mappings");
var _services_field_mappings = require("./services_field_mappings");
var _traces_field_mappings = require("./traces_field_mappings");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const otelDataName = _i18n.i18n.translate('home.sampleData.otelSpecTitle', {
  defaultMessage: 'Sample Observability Logs, Traces, and Metrics'
});
const otelDataDescription = _i18n.i18n.translate('home.sampleData.otelSpecDescription', {
  defaultMessage: 'Correlated observability signals for an e-commerce application in OpenTelemetry standard (Compatible with 2.13+ OpenSearch domains)'
});
const initialAppLinks = [{
  path: 'observability-traces#/traces',
  icon: 'apmTrace',
  label: 'View traces',
  newPath: 'observability-traces-nav#/traces',
  appendDatasourceToPath: true
}, {
  path: 'observability-traces#/services',
  icon: 'graphApp',
  label: 'View services',
  newPath: 'observability-services-nav#/services',
  appendDatasourceToPath: true
}];
const otelSpecProvider = function () {
  return {
    id: 'otel',
    name: otelDataName,
    description: otelDataDescription,
    previewImagePath: '/plugins/home/assets/sample_data_resources/otel/otel_traces.png',
    darkPreviewImagePath: '/plugins/home/assets/sample_data_resources/otel/otel_traces_dark.png',
    hasNewThemeImages: true,
    overviewDashboard: '',
    getDataSourceIntegratedDashboard: (0, _util.appendDataSourceId)(''),
    appLinks: initialAppLinks,
    defaultIndex: '',
    getDataSourceIntegratedDefaultIndex: (0, _util.appendDataSourceId)(''),
    savedObjects: [],
    getDataSourceIntegratedSavedObjects: (dataSourceId, dataSourceTitle) => (0, _util.getSavedObjectsWithDataSource)([], dataSourceId, dataSourceTitle),
    getWorkspaceIntegratedSavedObjects: workspaceId => (0, _util.overwriteSavedObjectsWithWorkspaceId)([], workspaceId),
    dataIndices: [{
      id: 'otel-v1-apm-span-sample',
      dataPath: _path.default.join(__dirname, './sample_traces.json.gz'),
      fields: _traces_field_mappings.tracesFieldMappings,
      timeFields: ['startTime', 'endTime', 'traceGroupFields.endTime'],
      // TODO: add support for 'events.time'
      currentTimeMarker: '2024-10-16T19:00:01',
      preserveDayOfWeekTimeOfDay: false,
      indexName: 'otel-v1-apm-span-sample'
    }, {
      id: 'otel-v1-apm-service-map-sample',
      dataPath: _path.default.join(__dirname, './sample_service_map.json.gz'),
      fields: _services_field_mappings.servicesFieldMappings,
      timeFields: [],
      currentTimeMarker: '2024-10-16T19:00:01',
      preserveDayOfWeekTimeOfDay: false,
      indexName: 'otel-v1-apm-service-map-sample'
    }, {
      id: 'ss4o_metrics-otel-sample',
      dataPath: _path.default.join(__dirname, './sample_metrics.json.gz'),
      fields: _metrics_field_mappings.metricsFieldMappings,
      timeFields: ['@timestamp', 'exemplar.time', 'startTime', 'time', 'observedTimestamp'],
      currentTimeMarker: '2024-10-16T19:00:01',
      preserveDayOfWeekTimeOfDay: false,
      indexName: 'ss4o_metrics-otel-sample'
    }, {
      id: 'ss4o_logs-otel-sample',
      dataPath: _path.default.join(__dirname, './sample_logs.json.gz'),
      fields: _logs_field_mappings.logsFieldMappings,
      timeFields: ['time', 'observedTime'],
      currentTimeMarker: '2024-10-16T19:00:01',
      preserveDayOfWeekTimeOfDay: false,
      indexName: 'ss4o_logs-otel-sample'
    }],
    status: 'not_installed'
  };
};
exports.otelSpecProvider = otelSpecProvider;