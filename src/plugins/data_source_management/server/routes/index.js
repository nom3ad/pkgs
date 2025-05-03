"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defineRoutes = defineRoutes;
exports.setupRoutes = setupRoutes;
var _dsl = require("./dsl");
var _data_connections_router = require("./data_connections_router");
var _datasources_router = require("./datasources_router");
var _ppl = require("./ppl");
var _dsl_facet = require("../services/facets/dsl_facet");
var _ppl_facet = require("../services/facets/ppl_facet");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

function defineRoutes(router) {
  router.get({
    path: '/api/data_source_management/example',
    validate: false
  }, async (context, request, response) => {
    return response.ok({
      body: {
        time: new Date().toISOString()
      }
    });
  });
}
function setupRoutes({
  router,
  client,
  dataSourceEnabled
}) {
  (0, _ppl.registerPplRoute)({
    router,
    facet: new _ppl_facet.PPLFacet(client)
  });
  (0, _dsl.registerDslRoute)({
    router,
    facet: new _dsl_facet.DSLFacet(client)
  }, dataSourceEnabled);

  // notebooks routes
  // const queryService = new QueryService(client);
  // registerSqlRoute(router, queryService);

  (0, _data_connections_router.registerDataConnectionsRoute)(router, dataSourceEnabled);
  (0, _datasources_router.registerDatasourcesRoute)(router, dataSourceEnabled);
}