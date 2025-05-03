"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerDataSourceConnectionsRoutes = registerDataSourceConnectionsRoutes;
var _configSchema = require("@osd/config-schema");
var _common = require("../../../common");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

function registerDataSourceConnectionsRoutes(router, defaultClient) {
  router.get({
    path: `${_common.API.DATA_SOURCE.CONNECTIONS}/{id?}`,
    validate: {
      params: _configSchema.schema.object({
        id: _configSchema.schema.maybe(_configSchema.schema.string())
      })
    }
  }, async (context, request, response) => {
    const client = request.params.id ? context.dataSource.opensearch.legacy.getClient(request.params.id).callAPI : defaultClient.asScoped(request).callAsCurrentUser;
    try {
      const resp = await client('enhancements.getDataConnections');
      return response.ok({
        body: resp
      });
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 400) {
        return response.ok({
          body: []
        });
      }
      // Transform 500 errors to 503 to indicate service availability issues
      const statusCode = error.statusCode === 500 ? 503 : error.statusCode || 503;
      return response.custom({
        statusCode,
        body: error.message
      });
    }
  });
  router.get({
    path: `${_common.API.DATA_SOURCE.ASYNC_JOBS}`,
    validate: {
      query: _configSchema.schema.object({
        id: _configSchema.schema.string(),
        queryId: _configSchema.schema.nullable(_configSchema.schema.string())
      })
    }
  }, async (context, request, response) => {
    try {
      const client = request.query.id ? context.dataSource.opensearch.legacy.getClient(request.query.id).callAPI : defaultClient.asScoped(request).callAsCurrentUser;
      const resp = await client('enhancements.getJobStatus', {
        queryId: request.query.queryId
      });
      return response.ok({
        body: resp
      });
    } catch (error) {
      // Transform 500 errors to 503 to indicate service availability issues
      const statusCode = error.statusCode === 500 ? 503 : error.statusCode || 503;
      return response.custom({
        statusCode,
        body: error.message
      });
    }
  });
  router.post({
    path: `${_common.API.DATA_SOURCE.ASYNC_JOBS}`,
    validate: {
      query: _configSchema.schema.object({
        id: _configSchema.schema.string()
      }),
      body: _configSchema.schema.object({
        query: _configSchema.schema.string(),
        datasource: _configSchema.schema.string(),
        lang: _configSchema.schema.string(),
        sessionId: _configSchema.schema.nullable(_configSchema.schema.string())
      })
    }
  }, async (context, request, response) => {
    try {
      const client = request.query.id ? context.dataSource.opensearch.legacy.getClient(request.query.id).callAPI : defaultClient.asScoped(request).callAsCurrentUser;
      const resp = await client('enhancements.runDirectQuery', {
        body: request.body
      });
      return response.ok({
        body: resp
      });
    } catch (error) {
      // Transform 500 errors to 503 to indicate service availability issues
      const statusCode = error.statusCode === 500 ? 503 : error.statusCode || 503;
      return response.custom({
        statusCode,
        body: error.message
      });
    }
  });
}