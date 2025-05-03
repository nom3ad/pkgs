"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerDataConnectionsRoute = registerDataConnectionsRoute;
exports.registerNonMdsDataConnectionsRoute = registerNonMdsDataConnectionsRoute;
var _configSchema = require("@osd/config-schema");
var _shared = require("../../framework/utils/shared");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-console */

function registerNonMdsDataConnectionsRoute(router) {
  router.get({
    path: `${_shared.DATACONNECTIONS_BASE}/{name}`,
    validate: {
      params: _configSchema.schema.object({
        name: _configSchema.schema.string()
      })
    }
  }, async (context, request, response) => {
    try {
      const dataConnectionsresponse = await context.opensearch_data_source_management.dataSourceManagementClient.asScoped(request).callAsCurrentUser('ppl.getDataConnectionById', {
        dataconnection: request.params.name
      });
      return response.ok({
        body: dataConnectionsresponse
      });
    } catch (error) {
      console.error('Issue in fetching data connection:', error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.message
      });
    }
  });
  router.delete({
    path: `${_shared.DATACONNECTIONS_BASE}/{name}`,
    validate: {
      params: _configSchema.schema.object({
        name: _configSchema.schema.string()
      })
    }
  }, async (context, request, response) => {
    try {
      const dataConnectionsresponse = await context.opensearch_data_source_management.dataSourceManagementClient.asScoped(request).callAsCurrentUser('ppl.deleteDataConnection', {
        dataconnection: request.params.name
      });
      return response.ok({
        body: dataConnectionsresponse
      });
    } catch (error) {
      console.error('Issue in deleting data connection:', error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.message
      });
    }
  });
  router.post({
    path: `${_shared.DATACONNECTIONS_BASE}${_shared.EDIT}`,
    validate: {
      body: _configSchema.schema.object({
        name: _configSchema.schema.string(),
        allowedRoles: _configSchema.schema.arrayOf(_configSchema.schema.string())
      })
    }
  }, async (context, request, response) => {
    try {
      const dataConnectionsresponse = await context.opensearch_data_source_management.dataSourceManagementClient.asScoped(request).callAsCurrentUser('ppl.modifyDataConnection', {
        body: {
          name: request.body.name,
          allowedRoles: request.body.allowedRoles
        }
      });
      return response.ok({
        body: dataConnectionsresponse
      });
    } catch (error) {
      console.error('Issue in modifying data connection:', error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.message
      });
    }
  });
  router.post({
    path: `${_shared.DATACONNECTIONS_BASE}${_shared.EDIT}${_shared.DATACONNECTIONS_UPDATE_STATUS}`,
    validate: {
      body: _configSchema.schema.object({
        name: _configSchema.schema.string(),
        status: _configSchema.schema.string()
      })
    }
  }, async (context, request, response) => {
    try {
      const dataConnectionsresponse = await context.opensearch_data_source_management.dataSourceManagementClient.asScoped(request).callAsCurrentUser('ppl.modifyDataConnection', {
        body: {
          name: request.body.name,
          status: request.body.status
        }
      });
      return response.ok({
        body: dataConnectionsresponse
      });
    } catch (error) {
      console.error('Issue in modifying data connection:', error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.message
      });
    }
  });
  router.post({
    path: `${_shared.DATACONNECTIONS_BASE}`,
    validate: {
      body: _configSchema.schema.object({
        name: _configSchema.schema.string(),
        connector: _configSchema.schema.string(),
        allowedRoles: _configSchema.schema.arrayOf(_configSchema.schema.string()),
        properties: _configSchema.schema.any()
      })
    }
  }, async (context, request, response) => {
    try {
      const dataConnectionsresponse = await context.opensearch_data_source_management.dataSourceManagementClient.asScoped(request).callAsCurrentUser('ppl.createDataSource', {
        body: {
          name: request.body.name,
          connector: request.body.connector,
          allowedRoles: request.body.allowedRoles,
          properties: request.body.properties
        }
      });
      return response.ok({
        body: dataConnectionsresponse
      });
    } catch (error) {
      console.error('Issue in creating data source:', error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.response
      });
    }
  });
  router.get({
    path: `${_shared.DATACONNECTIONS_BASE}`,
    validate: false
  }, async (context, request, response) => {
    try {
      const dataConnectionsresponse = await context.opensearch_data_source_management.dataSourceManagementClient.asScoped(request).callAsCurrentUser('ppl.getDataConnections');
      return response.ok({
        body: dataConnectionsresponse
      });
    } catch (error) {
      console.error('Issue in fetching data sources:', error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.response
      });
    }
  });
}
function registerDataConnectionsRoute(router, dataSourceEnabled) {
  router.get({
    path: `${_shared.DATACONNECTIONS_BASE}/dataSourceMDSId={dataSourceMDSId?}`,
    validate: {
      params: _configSchema.schema.object({
        dataSourceMDSId: _configSchema.schema.maybe(_configSchema.schema.string({
          defaultValue: ''
        }))
      })
    }
  }, async (context, request, response) => {
    const dataSourceMDSId = request.params.dataSourceMDSId;
    try {
      let dataConnectionsresponse;
      if (dataSourceEnabled && dataSourceMDSId) {
        const client = await context.dataSource.opensearch.legacy.getClient(dataSourceMDSId);
        dataConnectionsresponse = await client.callAPI('ppl.getDataConnections');
      } else {
        dataConnectionsresponse = await context.opensearch_data_source_management.dataSourceManagementClient.asScoped(request).callAsCurrentUser('ppl.getDataConnections');
      }
      return response.ok({
        body: dataConnectionsresponse
      });
    } catch (error) {
      var _error$body;
      console.error('Issue in fetching data sources:', error);
      const statusCode = error.statusCode || ((_error$body = error.body) === null || _error$body === void 0 ? void 0 : _error$body.statusCode) || 500;
      const errorBody = error.body || error.response || {
        message: error.message || 'Unknown error occurred'
      };
      return response.custom({
        statusCode,
        body: {
          error: errorBody,
          message: errorBody.message || error.message
        }
      });
    }
  });
  router.get({
    path: `${_shared.DATACONNECTIONS_BASE}/{name}/dataSourceMDSId={dataSourceMDSId?}`,
    validate: {
      params: _configSchema.schema.object({
        name: _configSchema.schema.string(),
        dataSourceMDSId: _configSchema.schema.maybe(_configSchema.schema.string({
          defaultValue: ''
        }))
      })
    }
  }, async (context, request, response) => {
    const dataSourceMDSId = request.params.dataSourceMDSId;
    try {
      let dataConnectionsresponse;
      if (dataSourceEnabled && dataSourceMDSId) {
        const client = await context.dataSource.opensearch.legacy.getClient(dataSourceMDSId);
        dataConnectionsresponse = await client.callAPI('ppl.getDataConnectionById', {
          dataconnection: request.params.name
        });
      } else {
        dataConnectionsresponse = await context.opensearch_data_source_management.dataSourceManagementClient.asScoped(request).callAsCurrentUser('ppl.getDataConnectionById', {
          dataconnection: request.params.name
        });
      }
      return response.ok({
        body: dataConnectionsresponse
      });
    } catch (error) {
      var _error$body2;
      console.error('Issue in fetching data sources:', error);
      const statusCode = error.statusCode || ((_error$body2 = error.body) === null || _error$body2 === void 0 ? void 0 : _error$body2.statusCode) || 500;
      const errorBody = error.body || error.response || {
        message: error.message || 'Unknown error occurred'
      };
      return response.custom({
        statusCode,
        body: {
          error: errorBody,
          message: errorBody.message || error.message
        }
      });
    }
  });
  router.delete({
    path: `${_shared.DATACONNECTIONS_BASE}/{name}/dataSourceMDSId={dataSourceMDSId?}`,
    validate: {
      params: _configSchema.schema.object({
        name: _configSchema.schema.string(),
        dataSourceMDSId: _configSchema.schema.maybe(_configSchema.schema.string({
          defaultValue: ''
        }))
      })
    }
  }, async (context, request, response) => {
    const dataSourceMDSId = request.params.dataSourceMDSId;
    try {
      let dataConnectionsresponse;
      if (dataSourceEnabled && dataSourceMDSId) {
        const client = await context.dataSource.opensearch.legacy.getClient(dataSourceMDSId);
        dataConnectionsresponse = await client.callAPI('ppl.deleteDataConnection', {
          dataconnection: request.params.name
        });
      } else {
        dataConnectionsresponse = await context.opensearch_data_source_management.dataSourceManagementClient.asScoped(request).callAsCurrentUser('ppl.deleteDataConnection', {
          dataconnection: request.params.name
        });
      }
      return response.ok({
        body: dataConnectionsresponse
      });
    } catch (error) {
      var _error$body3;
      console.error('Issue in deleting data sources:', error);
      const statusCode = error.statusCode || ((_error$body3 = error.body) === null || _error$body3 === void 0 ? void 0 : _error$body3.statusCode) || 500;
      const errorBody = error.body || error.response || {
        message: error.message || 'Unknown error occurred'
      };
      return response.custom({
        statusCode,
        body: {
          error: errorBody,
          message: errorBody.message || error.message
        }
      });
    }
  });
}