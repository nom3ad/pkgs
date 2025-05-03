"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pplSearchStrategyProvider = void 0;
var _common = require("../../../data/common");
var _utils = require("../../common/utils");
var _utils2 = require("../utils");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const pplSearchStrategyProvider = (config$, logger, client, usage) => {
  const pplFacet = new _utils2.Facet({
    client,
    logger,
    endpoint: 'enhancements.pplQuery',
    useJobs: false,
    shimResponse: true
  });
  return {
    search: async (context, request, options) => {
      try {
        var _query$dataset;
        const query = request.body.query;
        const aggConfig = request.body.aggConfig;
        const rawResponse = await pplFacet.describeQuery(context, request);
        if (!rawResponse.success) (0, _utils.throwFacetError)(rawResponse);
        const dataFrame = (0, _common.createDataFrame)({
          name: (_query$dataset = query.dataset) === null || _query$dataset === void 0 ? void 0 : _query$dataset.id,
          schema: rawResponse.data.schema,
          meta: aggConfig,
          fields: (0, _utils.getFields)(rawResponse)
        });
        dataFrame.size = rawResponse.data.datarows.length;
        if (usage) usage.trackSuccess(rawResponse.took);
        if (aggConfig) {
          for (const [key, aggQueryString] of Object.entries(aggConfig.qs)) {
            var _rawAggs$data$datarow;
            request.body.query.query = aggQueryString;
            const rawAggs = await pplFacet.describeQuery(context, request);
            if (!rawAggs.success) continue;
            dataFrame.aggs = {};
            dataFrame.aggs[key] = (_rawAggs$data$datarow = rawAggs.data.datarows) === null || _rawAggs$data$datarow === void 0 ? void 0 : _rawAggs$data$datarow.map(hit => {
              return {
                key: hit[1],
                value: hit[0]
              };
            });
          }
        }
        return {
          type: _common.DATA_FRAME_TYPES.DEFAULT,
          body: dataFrame,
          took: rawResponse.took
        };
      } catch (e) {
        logger.error(`pplSearchStrategy: ${e.message}`);
        if (usage) usage.trackError();
        throw e;
      }
    }
  };
};
exports.pplSearchStrategyProvider = pplSearchStrategyProvider;