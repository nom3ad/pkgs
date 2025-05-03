"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SQL_ENDPOINT = exports.SECURITY_ROLES = exports.SECURITY_PLUGIN_ACCOUNT_API = exports.SAVED_VISUALIZATION = exports.SAVED_QUERY = exports.SAVED_OBJECTS = exports.SAVED_OBJECT = exports.S3_DATA_SOURCE_TYPE = exports.PPL_SEARCH = exports.PPL_ENDPOINT = exports.PPL_BASE = exports.OPENSEARCH_PANELS_API = exports.OPENSEARCH_DATACONNECTIONS_API = exports.JOB_RESULT_ENDPOINT = exports.JOBS_ENDPOINT_BASE = exports.JOBS_BASE = exports.INTEGRATIONS_BASE = exports.EVENT_ANALYTICS = exports.EDIT = exports.DirectQueryLoadingStatus = exports.DSM_BASE = exports.DSL_SETTINGS = exports.DSL_SEARCH = exports.DSL_MAPPING = exports.DSL_ENDPOINT = exports.DSL_CAT = exports.DSL_BASE = exports.DIRECT_QUERY_BASE = exports.DIRECT_DUMMY_QUERY = exports.DATACONNECTIONS_UPDATE_STATUS = exports.DATACONNECTIONS_ENDPOINT = exports.DATACONNECTIONS_BASE = exports.CONSOLE_PROXY = exports.ASYNC_QUERY_SESSION_ID = exports.ASYNC_QUERY_DATASOURCE_CACHE = exports.ASYNC_QUERY_ACCELERATIONS_CACHE = void 0;
exports.addBackticksIfNeeded = addBackticksIfNeeded;
exports.combineSchemaAndDatarows = combineSchemaAndDatarows;
exports.formatError = void 0;
exports.get = get;
exports.queryWorkbenchPluginID = exports.queryWorkbenchPluginCheck = exports.observabilityTracesTitle = exports.observabilityTracesPluginOrder = exports.observabilityTracesID = exports.observabilityTitle = exports.observabilityPluginOrder = exports.observabilityPanelsTitle = exports.observabilityPanelsPluginOrder = exports.observabilityPanelsID = exports.observabilityNotebookTitle = exports.observabilityNotebookPluginOrder = exports.observabilityNotebookID = exports.observabilityMetricsTitle = exports.observabilityMetricsPluginOrder = exports.observabilityMetricsID = exports.observabilityLogsTitle = exports.observabilityLogsPluginOrder = exports.observabilityLogsID = exports.observabilityIntegrationsTitle = exports.observabilityIntegrationsPluginOrder = exports.observabilityIntegrationsID = exports.observabilityID = exports.observabilityDataConnectionsTitle = exports.observabilityDataConnectionsPluginOrder = exports.observabilityDataConnectionsID = exports.observabilityApplicationsTitle = exports.observabilityApplicationsPluginOrder = exports.observabilityApplicationsID = exports.isCatalogCacheFetching = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

function get(obj, path, defaultValue) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
}
function addBackticksIfNeeded(input) {
  if (input === undefined) {
    return '';
  }
  // Check if the string already has backticks
  if (input.startsWith('`') && input.endsWith('`')) {
    return input; // Return the string as it is
  }
  // Add backticks to the string
  return '`' + input + '`';
}
function combineSchemaAndDatarows(schema, datarows) {
  const combinedData = [];
  datarows.forEach(row => {
    const rowData = {};
    schema.forEach((field, index) => {
      rowData[field.name] = row[index];
    });
    combinedData.push(rowData);
  });
  return combinedData;
}
const formatError = (name, message, details) => {
  return {
    name,
    message,
    body: {
      attributes: {
        error: {
          caused_by: {
            type: '',
            reason: details
          }
        }
      }
    }
  };
};

// Client route
exports.formatError = formatError;
const DIRECT_QUERY_BASE = exports.DIRECT_QUERY_BASE = '/api/directquery';
const PPL_BASE = exports.PPL_BASE = `${DIRECT_QUERY_BASE}/ppl`;
const PPL_SEARCH = exports.PPL_SEARCH = '/search';
const DSL_BASE = exports.DSL_BASE = `${DIRECT_QUERY_BASE}/dsl`;
const DSL_SEARCH = exports.DSL_SEARCH = '/search';
const DSL_CAT = exports.DSL_CAT = '/cat.indices';
const DSL_MAPPING = exports.DSL_MAPPING = '/indices.getFieldMapping';
const DSL_SETTINGS = exports.DSL_SETTINGS = '/indices.getFieldSettings';
const DSM_BASE = exports.DSM_BASE = '/api/datasourcemanagement';
const INTEGRATIONS_BASE = exports.INTEGRATIONS_BASE = '/api/integrations';
const JOBS_BASE = exports.JOBS_BASE = '/query/jobs';
const DATACONNECTIONS_BASE = exports.DATACONNECTIONS_BASE = `${DIRECT_QUERY_BASE}/dataconnections`;
const EDIT = exports.EDIT = '/edit';
const DATACONNECTIONS_UPDATE_STATUS = exports.DATACONNECTIONS_UPDATE_STATUS = '/status';
const SECURITY_ROLES = exports.SECURITY_ROLES = '/api/v1/configuration/roles';
const EVENT_ANALYTICS = exports.EVENT_ANALYTICS = '/event_analytics';
const SAVED_OBJECTS = exports.SAVED_OBJECTS = '/saved_objects';
const SAVED_QUERY = exports.SAVED_QUERY = '/query';
const SAVED_VISUALIZATION = exports.SAVED_VISUALIZATION = '/vis';
const CONSOLE_PROXY = exports.CONSOLE_PROXY = '/api/console/proxy';
const SECURITY_PLUGIN_ACCOUNT_API = exports.SECURITY_PLUGIN_ACCOUNT_API = '/api/v1/configuration/account';

// Server route
const PPL_ENDPOINT = exports.PPL_ENDPOINT = '/_plugins/_ppl';
const SQL_ENDPOINT = exports.SQL_ENDPOINT = '/_plugins/_sql';
const DSL_ENDPOINT = exports.DSL_ENDPOINT = '/_plugins/_dsl';
const DATACONNECTIONS_ENDPOINT = exports.DATACONNECTIONS_ENDPOINT = '/_plugins/_query/_datasources';
const JOBS_ENDPOINT_BASE = exports.JOBS_ENDPOINT_BASE = '/_plugins/_async_query';
const JOB_RESULT_ENDPOINT = exports.JOB_RESULT_ENDPOINT = '/result';
const observabilityID = exports.observabilityID = 'observability-logs';
const observabilityTitle = exports.observabilityTitle = 'Observability';
const observabilityPluginOrder = exports.observabilityPluginOrder = 1500;
const observabilityApplicationsID = exports.observabilityApplicationsID = 'observability-applications';
const observabilityApplicationsTitle = exports.observabilityApplicationsTitle = 'Applications';
const observabilityApplicationsPluginOrder = exports.observabilityApplicationsPluginOrder = 5090;
const observabilityLogsID = exports.observabilityLogsID = 'observability-logs';
const observabilityLogsTitle = exports.observabilityLogsTitle = 'Logs';
const observabilityLogsPluginOrder = exports.observabilityLogsPluginOrder = 5091;
const observabilityMetricsID = exports.observabilityMetricsID = 'observability-metrics';
const observabilityMetricsTitle = exports.observabilityMetricsTitle = 'Metrics';
const observabilityMetricsPluginOrder = exports.observabilityMetricsPluginOrder = 5092;
const observabilityTracesID = exports.observabilityTracesID = 'observability-traces';
const observabilityTracesTitle = exports.observabilityTracesTitle = 'Traces';
const observabilityTracesPluginOrder = exports.observabilityTracesPluginOrder = 5093;
const observabilityNotebookID = exports.observabilityNotebookID = 'observability-notebooks';
const observabilityNotebookTitle = exports.observabilityNotebookTitle = 'Notebooks';
const observabilityNotebookPluginOrder = exports.observabilityNotebookPluginOrder = 5094;
const observabilityPanelsID = exports.observabilityPanelsID = 'observability-dashboards';
const observabilityPanelsTitle = exports.observabilityPanelsTitle = 'Dashboards';
const observabilityPanelsPluginOrder = exports.observabilityPanelsPluginOrder = 5095;
const observabilityIntegrationsID = exports.observabilityIntegrationsID = 'integrations';
const observabilityIntegrationsTitle = exports.observabilityIntegrationsTitle = 'Integrations';
const observabilityIntegrationsPluginOrder = exports.observabilityIntegrationsPluginOrder = 9020;
const observabilityDataConnectionsID = exports.observabilityDataConnectionsID = 'datasources';
const observabilityDataConnectionsTitle = exports.observabilityDataConnectionsTitle = 'Data sources';
const observabilityDataConnectionsPluginOrder = exports.observabilityDataConnectionsPluginOrder = 9030;
const queryWorkbenchPluginID = exports.queryWorkbenchPluginID = 'opensearch-query-workbench';
const queryWorkbenchPluginCheck = exports.queryWorkbenchPluginCheck = 'plugin:queryWorkbenchDashboards';

// Observability plugin URI
const BASE_OBSERVABILITY_URI = '/_plugins/_observability';
const BASE_DATACONNECTIONS_URI = '/_plugins/_query/_datasources';
const OPENSEARCH_PANELS_API = exports.OPENSEARCH_PANELS_API = {
  OBJECT: `${BASE_OBSERVABILITY_URI}/object`
};
const OPENSEARCH_DATACONNECTIONS_API = exports.OPENSEARCH_DATACONNECTIONS_API = {
  DATACONNECTION: `${BASE_DATACONNECTIONS_URI}`
};

// Saved Objects
const SAVED_OBJECT = exports.SAVED_OBJECT = '/object';
const S3_DATA_SOURCE_TYPE = exports.S3_DATA_SOURCE_TYPE = 's3glue';
const ASYNC_QUERY_SESSION_ID = exports.ASYNC_QUERY_SESSION_ID = 'async-query-session-id';
const ASYNC_QUERY_DATASOURCE_CACHE = exports.ASYNC_QUERY_DATASOURCE_CACHE = 'async-query-catalog-cache';
const ASYNC_QUERY_ACCELERATIONS_CACHE = exports.ASYNC_QUERY_ACCELERATIONS_CACHE = 'async-query-acclerations-cache';
const DIRECT_DUMMY_QUERY = exports.DIRECT_DUMMY_QUERY = 'select 1';
let DirectQueryLoadingStatus = exports.DirectQueryLoadingStatus = /*#__PURE__*/function (DirectQueryLoadingStatus) {
  DirectQueryLoadingStatus["SUCCESS"] = "success";
  DirectQueryLoadingStatus["FAILED"] = "failed";
  DirectQueryLoadingStatus["RUNNING"] = "running";
  DirectQueryLoadingStatus["SCHEDULED"] = "scheduled";
  DirectQueryLoadingStatus["CANCELED"] = "canceled";
  DirectQueryLoadingStatus["WAITING"] = "waiting";
  DirectQueryLoadingStatus["INITIAL"] = "initial";
  return DirectQueryLoadingStatus;
}({});
const catalogCacheFetchingStatus = [DirectQueryLoadingStatus.RUNNING, DirectQueryLoadingStatus.WAITING, DirectQueryLoadingStatus.SCHEDULED];
const isCatalogCacheFetching = (...statuses) => {
  return statuses.some(status => catalogCacheFetchingStatus.includes(status));
};
exports.isCatalogCacheFetching = isCatalogCacheFetching;