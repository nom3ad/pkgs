"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerDslRoute = registerDslRoute;
var _configSchema = require("@osd/config-schema");
var _shared = require("../../framework/utils/shared");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-console*/

function registerDslRoute({
  router
}, dataSourceEnabled) {
  router.post({
    path: `${_shared.DSL_BASE}${_shared.DSL_SEARCH}`,
    validate: {
      body: _configSchema.schema.any()
    }
  }, async (context, request, response) => {
    const {
      index,
      size,
      ...rest
    } = request.body;
    const params = {
      index,
      size,
      body: rest
    };
    try {
      const resp = await context.core.opensearch.legacy.client.callAsCurrentUser('search', params);
      return response.ok({
        body: resp
      });
    } catch (error) {
      if (error.statusCode !== 404) console.error(error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.message
      });
    }
  });
  router.get({
    path: `${_shared.DSL_BASE}${_shared.DSL_CAT}`,
    validate: {
      query: _configSchema.schema.object({
        format: _configSchema.schema.string(),
        index: _configSchema.schema.maybe(_configSchema.schema.string())
      })
    }
  }, async (context, request, response) => {
    try {
      const resp = await context.core.opensearch.legacy.client.callAsCurrentUser('cat.indices', request.query);
      return response.ok({
        body: resp
      });
    } catch (error) {
      if (error.statusCode !== 404) console.error(error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.message
      });
    }
  });
  router.get({
    path: `${_shared.DSL_BASE}${_shared.DSL_MAPPING}`,
    validate: {
      query: _configSchema.schema.any()
    }
  }, async (context, request, response) => {
    try {
      const resp = await context.core.opensearch.legacy.client.callAsCurrentUser('indices.getMapping', {
        index: request.query.index
      });
      return response.ok({
        body: resp
      });
    } catch (error) {
      if (error.statusCode !== 404) console.error(error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.message
      });
    }
  });
  router.get({
    path: `${_shared.DSL_BASE}${_shared.DSL_SETTINGS}`,
    validate: {
      query: _configSchema.schema.any()
    }
  }, async (context, request, response) => {
    try {
      const resp = await context.core.opensearch.legacy.client.callAsCurrentUser('indices.getSettings', {
        index: request.query.index
      });
      return response.ok({
        body: resp
      });
    } catch (error) {
      if (error.statusCode !== 404) console.error(error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.message
      });
    }
  });

  // New routes for mds enabled
  router.get({
    path: `${_shared.DSL_BASE}${_shared.DSL_CAT}/dataSourceMDSId={dataSourceMDSId?}`,
    validate: {
      query: _configSchema.schema.object({
        format: _configSchema.schema.string(),
        index: _configSchema.schema.maybe(_configSchema.schema.string())
      }),
      params: _configSchema.schema.object({
        dataSourceMDSId: _configSchema.schema.maybe(_configSchema.schema.string({
          defaultValue: ''
        }))
      })
    }
  }, async (context, request, response) => {
    const dataSourceMDSId = request.params.dataSourceMDSId;
    try {
      let resp;
      if (dataSourceEnabled && dataSourceMDSId) {
        const client = await context.dataSource.opensearch.legacy.getClient(dataSourceMDSId);
        resp = await client.callAPI('cat.indices', request.query);
      } else {
        resp = await context.core.opensearch.legacy.client.callAsCurrentUser('cat.indices', request.query);
      }
      return response.ok({
        body: resp
      });
    } catch (error) {
      if (error.statusCode !== 404) console.error(error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.message
      });
    }
  });
  router.get({
    path: `${_shared.DSL_BASE}${_shared.DSL_MAPPING}/dataSourceMDSId={dataSourceMDSId?}`,
    validate: {
      query: _configSchema.schema.any(),
      params: _configSchema.schema.object({
        dataSourceMDSId: _configSchema.schema.maybe(_configSchema.schema.string({
          defaultValue: ''
        }))
      })
    }
  }, async (context, request, response) => {
    const dataSourceMDSId = request.params.dataSourceMDSId;
    try {
      let resp;
      if (dataSourceEnabled && dataSourceMDSId) {
        const client = await context.dataSource.opensearch.legacy.getClient(dataSourceMDSId);
        resp = await client.callAPI('indices.getMapping', {
          index: request.query.index
        });
      } else {
        resp = await context.core.opensearch.legacy.client.callAsCurrentUser('indices.getMapping', {
          index: request.query.index
        });
      }
      return response.ok({
        body: resp
      });
    } catch (error) {
      if (error.statusCode !== 404) console.error(error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.message
      });
    }
  });
  router.get({
    path: `${_shared.DSL_BASE}${_shared.DSL_SETTINGS}/dataSourceMDSId={dataSourceMDSId?}`,
    validate: {
      query: _configSchema.schema.any(),
      params: _configSchema.schema.object({
        dataSourceMDSId: _configSchema.schema.maybe(_configSchema.schema.string({
          defaultValue: ''
        }))
      })
    }
  }, async (context, request, response) => {
    const dataSourceMDSId = request.params.dataSourceMDSId;
    try {
      let resp;
      if (dataSourceEnabled && dataSourceMDSId) {
        const client = await context.dataSource.opensearch.legacy.getClient(dataSourceMDSId);
        resp = await client.callAPI('indices.getSettings', {
          index: request.query.index
        });
      } else {
        resp = await context.core.opensearch.legacy.client.callAsCurrentUser('indices.getSettings', {
          index: request.query.index
        });
      }
      return response.ok({
        body: resp
      });
    } catch (error) {
      if (error.statusCode !== 404) console.error(error);
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.message
      });
    }
  });
}