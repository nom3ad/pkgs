"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerPplRoute = registerPplRoute;
var _configSchema = require("@osd/config-schema");
var _shared = require("../../framework/utils/shared");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

function registerPplRoute({
  router,
  facet
}) {
  router.post({
    path: `${_shared.PPL_BASE}${_shared.PPL_SEARCH}`,
    validate: {
      body: _configSchema.schema.object({
        query: _configSchema.schema.string(),
        format: _configSchema.schema.string()
      })
    }
  }, async (context, req, res) => {
    const queryRes = await facet.describeQuery(req);
    if (queryRes.success) {
      const result = {
        body: {
          ...queryRes.data
        }
      };
      return res.ok(result);
    }
    return res.custom({
      statusCode: queryRes.data.statusCode || queryRes.data.status || 500,
      body: queryRes.data.body || queryRes.data.message || ''
    });
  });
}