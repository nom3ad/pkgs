"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerGeospatialRoutes = registerGeospatialRoutes;
var _configSchema = require("@osd/config-schema");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

function registerGeospatialRoutes(router) {
  router.post({
    path: '/api/geospatial/_indices',
    validate: {
      body: _configSchema.schema.object({
        index: _configSchema.schema.string()
      }),
      query: _configSchema.schema.maybe(_configSchema.schema.object({}, {
        unknowns: 'allow'
      }))
    }
  }, async (context, req, res) => {
    try {
      let client;
      // @ts-ignore
      if (!req.query.dataSourceId) {
        client = context.core.opensearch.client.asCurrentUser;
      } else {
        // @ts-ignore
        client = await context.dataSource.opensearch.getClient(req.query.dataSourceId);
      }
      const response = await client.cat.indices({
        index: req.body.index,
        format: 'json'
      });
      const indexNames = response.body.map(index => index.index);
      return res.ok({
        body: {
          ok: true,
          resp: indexNames
        }
      });
    } catch (err) {
      // Opensearch throws an index_not_found_exception which we'll treat as a success
      if (err.statusCode === 404) {
        return res.ok({
          body: {
            ok: false,
            resp: []
          }
        });
      } else {
        return res.ok({
          body: {
            ok: false,
            resp: err.message
          }
        });
      }
    }
  });
  router.post({
    path: '/api/geospatial/_search',
    validate: {
      body: _configSchema.schema.object({
        index: _configSchema.schema.string(),
        size: _configSchema.schema.number()
      }),
      query: _configSchema.schema.maybe(_configSchema.schema.object({}, {
        unknowns: 'allow'
      }))
    }
  }, async (context, req, res) => {
    let client;
    // @ts-ignore
    if (!req.query.dataSourceId) {
      client = context.core.opensearch.client.asCurrentUser;
    } else {
      // @ts-ignore
      client = await context.dataSource.opensearch.getClient(req.query.dataSourceId);
    }
    try {
      const {
        index,
        size
      } = req.body;
      const params = {
        index,
        body: {},
        size
      };
      const results = await client.search(params);
      return res.ok({
        body: {
          ok: true,
          resp: results.body
        }
      });
    } catch (err) {
      return res.ok({
        body: {
          ok: false,
          resp: err.message
        }
      });
    }
  });
  router.post({
    path: '/api/geospatial/_mappings',
    validate: {
      body: _configSchema.schema.object({
        index: _configSchema.schema.string()
      }),
      query: _configSchema.schema.maybe(_configSchema.schema.object({}, {
        unknowns: 'allow'
      }))
    }
  }, async (context, req, res) => {
    let client;
    // @ts-ignore
    if (!req.query.dataSourceId) {
      client = context.core.opensearch.client.asCurrentUser;
    } else {
      // @ts-ignore
      client = await context.dataSource.opensearch.getClient(req.query.dataSourceId);
    }
    try {
      const {
        index
      } = req.body;
      const mappings = await client.indices.getMapping({
        index
      });
      return res.ok({
        body: {
          ok: true,
          resp: mappings.body
        }
      });
    } catch (err) {
      return res.ok({
        body: {
          ok: false,
          resp: err.message
        }
      });
    }
  });
}