"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sqlSearchStrategyProvider = void 0;
var _common = require("../../../data/common");
var _utils = require("../../common/utils");
var _utils2 = require("../utils");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const sqlSearchStrategyProvider = (config$, logger, client, usage) => {
  const sqlFacet = new _utils2.Facet({
    client,
    logger,
    endpoint: 'enhancements.sqlQuery',
    useJobs: false,
    shimResponse: true
  });
  return {
    search: async (context, request, options) => {
      try {
        var _query$dataset;
        const query = request.body.query;
        const rawResponse = await sqlFacet.describeQuery(context, request);
        if (!rawResponse.success) {
          const error = new Error(rawResponse.data.body);
          error.name = rawResponse.data.status;
          throw error;
        }
        const dataFrame = (0, _common.createDataFrame)({
          name: (_query$dataset = query.dataset) === null || _query$dataset === void 0 ? void 0 : _query$dataset.id,
          schema: rawResponse.data.schema,
          fields: (0, _utils.getFields)(rawResponse)
        });
        dataFrame.size = rawResponse.data.datarows.length;
        if (usage) usage.trackSuccess(rawResponse.took);
        return {
          type: _common.DATA_FRAME_TYPES.DEFAULT,
          body: dataFrame,
          took: rawResponse.took
        };
      } catch (e) {
        logger.error(`sqlSearchStrategy: ${e.message}`);
        if (usage) usage.trackError();
        throw e;
      }
    }
  };
};
exports.sqlSearchStrategyProvider = sqlSearchStrategyProvider;