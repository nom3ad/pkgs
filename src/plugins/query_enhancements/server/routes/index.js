"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.coerceStatusCode = void 0;
exports.defineRoutes = defineRoutes;
exports.defineSearchStrategyRouteProvider = defineSearchStrategyRouteProvider;
var _configSchema = require("@osd/config-schema");
var _common = require("../../common");
var _query_assist = require("./query_assist");
var _data_source_connection = require("./data_source_connection");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Coerce status code to 503 for 500 errors from dependency services. Only use
 * this function to handle errors throw by other services, and not from OSD.
 */
const coerceStatusCode = statusCode => {
  if (statusCode === 500) return 503;
  return statusCode || 503;
};

/**
 * @experimental
 *
 * This method creates a function that will setup the routes for a search strategy by encapsulating the
 * logger and router instances.
 *
 * @param logger - The logger instance.
 * @param router - The router instance.
 */
exports.coerceStatusCode = coerceStatusCode;
function defineSearchStrategyRouteProvider(logger, router) {
  /**
   * @param id - The ID of the search strategy to use.
   * @param searchStrategy
   *
   * @example
   * API Request Body:
   * ```json
   * {
   *   "query": {
   *     "query": "SELECT * FROM my_index",
   *     "language": "sql",
   *     "dataset": {
   *       "id": "my_dataset_id",
   *       "title": "My Dataset"
   *     },
   *     "format": "json"
   *   },
   *   @experimental
   *   "aggConfig": {
   *     // Optional aggregation configuration
   *   },
   *   @deprecated
   *   "df": {
   *     // Optional data frame configuration
   *   }
   * }
   * ```
   */
  return function (id, searchStrategy) {
    const path = `${_common.API.SEARCH}/${id}`;
    router.post({
      path,
      validate: {
        body: _configSchema.schema.object({
          query: _configSchema.schema.object({
            query: _configSchema.schema.string(),
            language: _configSchema.schema.string(),
            dataset: _configSchema.schema.nullable(_configSchema.schema.object({}, {
              unknowns: 'allow'
            })),
            format: _configSchema.schema.string()
          }),
          aggConfig: _configSchema.schema.nullable(_configSchema.schema.object({}, {
            unknowns: 'allow'
          })),
          pollQueryResultsParams: _configSchema.schema.maybe(_configSchema.schema.object({
            queryId: _configSchema.schema.maybe(_configSchema.schema.string()),
            sessionId: _configSchema.schema.maybe(_configSchema.schema.string())
          })),
          timeRange: _configSchema.schema.maybe(_configSchema.schema.object({}, {
            unknowns: 'allow'
          }))
        })
      }
    }, async (context, req, res) => {
      try {
        const queryRes = await searchStrategy.search(context, req, {});
        return res.ok({
          body: {
            ...queryRes
          }
        });
      } catch (err) {
        let error;
        try {
          error = JSON.parse(err.message);
        } catch (e) {
          error = err;
        }
        return res.custom({
          statusCode: coerceStatusCode(error.status || err.status),
          body: err.message
        });
      }
    });
  };
}

/**
 * Defines routes for various search strategies and registers additional routes.
 *
 * @experimental This function is experimental and might change in future releases.
 *
 * @param logger - The logger instance.
 * @param router - The router instance.
 * @param client - The client instance.
 * @param searchStrategies - The available search strategies.
 */
function defineRoutes(logger, router, client, searchStrategies) {
  const defineRoute = defineSearchStrategyRouteProvider(logger, router);
  Object.entries(searchStrategies).forEach(([id, strategy]) => {
    defineRoute(id, strategy);
  });
  (0, _data_source_connection.registerDataSourceConnectionsRoutes)(router, client);
  (0, _query_assist.registerQueryAssistRoutes)(router);
}