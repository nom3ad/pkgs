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

function registerDataSourceConnectionsRoutes(router) {
  router.get({
    path: _common.API.DATA_SOURCE.CONNECTIONS,
    validate: {
      params: _configSchema.schema.object({}, {
        unknowns: 'allow'
      })
    }
  }, async (context, request, response) => {
    const fields = ['id', 'title', 'auth.type'];
    const resp = await context.core.savedObjects.client.find({
      type: 'data-source',
      fields,
      perPage: 10000
    });
    return response.ok({
      body: {
        savedObjects: resp.saved_objects
      }
    });
  });
  router.get({
    path: `${_common.API.DATA_SOURCE.CONNECTIONS}/{dataSourceId}`,
    validate: {
      params: _configSchema.schema.object({
        dataSourceId: _configSchema.schema.string()
      })
    }
  }, async (context, request, response) => {
    const resp = await context.core.savedObjects.client.get('data-source', request.params.dataSourceId);
    return response.ok({
      body: resp
    });
  });
}