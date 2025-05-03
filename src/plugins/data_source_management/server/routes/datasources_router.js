"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerDatasourcesRoute = registerDatasourcesRoute;
var _configSchema = require("@osd/config-schema");
var _shared = require("../../framework/utils/shared");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-console*/

function registerDatasourcesRoute(router, dataSourceEnabled) {
  router.post({
    path: `${_shared.DSM_BASE}${_shared.JOBS_BASE}`,
    validate: {
      body: _configSchema.schema.object({
        query: _configSchema.schema.string(),
        lang: _configSchema.schema.string(),
        datasource: _configSchema.schema.string(),
        sessionId: _configSchema.schema.maybe(_configSchema.schema.string())
      })
    }
  }, async (context, request, response) => {
    const dataSourceMDSId = request.url.searchParams.get('dataSourceMDSId');
    const params = {
      body: {
        ...request.body
      }
    };
    try {
      let res;
      if (dataSourceEnabled && dataSourceMDSId) {
        const client = await context.dataSource.opensearch.legacy.getClient(dataSourceMDSId);
        res = await client.callAPI('datasourcemanagement.runDirectQuery', params);
      } else {
        res = await context.opensearch_data_source_management.dataSourceManagementClient.asScoped(request).callAsCurrentUser('datasourcemanagement.runDirectQuery', params);
      }
      return response.ok({
        body: res
      });
    } catch (error) {
      console.error('Error in running direct query:', error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.body
      });
    }
  });
  router.get({
    path: `${_shared.DSM_BASE}${_shared.JOBS_BASE}/{queryId}/{dataSourceMDSId?}`,
    validate: {
      params: _configSchema.schema.object({
        queryId: _configSchema.schema.string(),
        dataSourceMDSId: _configSchema.schema.maybe(_configSchema.schema.string({
          defaultValue: ''
        }))
      })
    }
  }, async (context, request, response) => {
    try {
      let res;
      if (dataSourceEnabled && request.params.dataSourceMDSId) {
        const client = await context.dataSource.opensearch.legacy.getClient(request.params.dataSourceMDSId);
        res = await client.callAPI('datasourcemanagement.getJobStatus', {
          queryId: request.params.queryId
        });
      } else {
        res = await context.opensearch_data_source_management.dataSourceManagementClient.asScoped(request).callAsCurrentUser('datasourcemanagement.getJobStatus', {
          queryId: request.params.queryId
        });
      }
      return response.ok({
        body: res
      });
    } catch (error) {
      console.error('Error in fetching job status:', error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.message
      });
    }
  });
  router.delete({
    path: `${_shared.DSM_BASE}${_shared.JOBS_BASE}/{queryId}`,
    validate: {
      params: _configSchema.schema.object({
        queryId: _configSchema.schema.string()
      })
    }
  }, async (context, request, response) => {
    try {
      const res = await context.opensearch_data_source_management.dataSourceManagementClient.asScoped(request).callAsCurrentUser('datasourcemanagement.deleteJob', {
        queryId: request.params.queryId
      });
      return response.ok({
        body: res
      });
    } catch (error) {
      console.error('Error in deleting job:', error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.message
      });
    }
  });
}