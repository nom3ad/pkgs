"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pplRawSearchStrategyProvider = void 0;
var _utils = require("../utils");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const pplRawSearchStrategyProvider = (config$, logger, client, usage) => {
  return {
    search: async (context, request, options) => {
      const runSearch = request.dataSourceId ? context.dataSource.opensearch.legacy.getClient(request.dataSourceId).callAPI : client.asScoped(request.rawRequest).callAsCurrentUser;
      try {
        const rawResponse = await runSearch('enhancements.pplQuery', {
          body: request.params.body
        });
        const data = (0, _utils.shimSchemaRow)(rawResponse);
        rawResponse.jsonData = data.jsonData;
        return {
          rawResponse
        };
      } catch (e) {
        logger.error(`pplRawSearchStrategy: ${e.message}`);
        if (usage) usage.trackError();
        throw e;
      }
    }
  };
};
exports.pplRawSearchStrategyProvider = pplRawSearchStrategyProvider;