"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defineRoutes = defineRoutes;
var _configSchema = require("@osd/config-schema");
var _common = require("../../common");
var _query_assist = require("./query_assist");
var _data_source_connection = require("./data_source_connection");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Defines a route for a specific search strategy.
 *
 * @experimental This function is experimental and might change in future releases.
 *
 * @param logger - The logger instance.
 * @param router - The router instance.
 * @param searchStrategies - The available search strategies.
 * @param searchStrategyId - The ID of the search strategy to use.
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
function defineRoute(logger, router, searchStrategies, searchStrategyId) {
  const path = `${_common.API.SEARCH}/${searchStrategyId}`;
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
        df: _configSchema.schema.nullable(_configSchema.schema.object({}, {
          unknowns: 'allow'
        }))
      })
    }
  }, async (context, req, res) => {
    try {
      const queryRes = await searchStrategies[searchStrategyId].search(context, req, {});
      return res.ok({
        body: {
          ...queryRes
        }
      });
    } catch (err) {
      return res.custom({
        statusCode: err.name,
        body: err.message
      });
    }
  });
  router.get({
    path: `${path}/{queryId}`,
    validate: {
      params: _configSchema.schema.object({
        queryId: _configSchema.schema.string()
      })
    }
  }, async (context, req, res) => {
    try {
      const queryRes = await searchStrategies[searchStrategyId].search(context, req, {});
      const result = {
        body: {
          ...queryRes
        }
      };
      return res.ok(result);
    } catch (err) {
      logger.error(err);
      return res.custom({
        statusCode: 500,
        body: err
      });
    }
  });
  router.get({
    path: `${path}/{queryId}/{dataSourceId}`,
    validate: {
      params: _configSchema.schema.object({
        queryId: _configSchema.schema.string(),
        dataSourceId: _configSchema.schema.string()
      })
    }
  }, async (context, req, res) => {
    try {
      const queryRes = await searchStrategies[searchStrategyId].search(context, req, {});
      const result = {
        body: {
          ...queryRes
        }
      };
      return res.ok(result);
    } catch (err) {
      logger.error(err);
      return res.custom({
        statusCode: 500,
        body: err
      });
    }
  });
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
function defineRoutes(logger, router, searchStrategies) {
  defineRoute(logger, router, searchStrategies, _common.SEARCH_STRATEGY.PPL);
  defineRoute(logger, router, searchStrategies, _common.SEARCH_STRATEGY.SQL);
  defineRoute(logger, router, searchStrategies, _common.SEARCH_STRATEGY.SQL_ASYNC);
  (0, _data_source_connection.registerDataSourceConnectionsRoutes)(router);
  (0, _query_assist.registerQueryAssistRoutes)(router);
}