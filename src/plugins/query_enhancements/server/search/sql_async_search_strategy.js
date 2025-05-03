"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sqlAsyncSearchStrategyProvider = void 0;
var _common = require("../../../data/common");
var _utils = require("../utils");
var _common2 = require("../../common");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const sqlAsyncSearchStrategyProvider = (config$, logger, client, usage) => {
  const sqlAsyncFacet = new _utils.Facet({
    client,
    logger,
    endpoint: 'observability.runDirectQuery'
  });
  const sqlAsyncJobsFacet = new _utils.Facet({
    client,
    logger,
    endpoint: 'observability.getJobStatus',
    useJobs: true
  });
  return {
    search: async (context, request, options) => {
      try {
        var _query$dataset;
        const query = request.body.query;
        const startTime = Date.now();
        request.body = {
          ...request.body,
          lang: _common2.SEARCH_STRATEGY.SQL
        };
        const rawResponse = await sqlAsyncFacet.describeQuery(context, request);
        if (!rawResponse.success) (0, _common2.handleFacetError)(rawResponse);
        const statusConfig = (0, _common2.buildQueryStatusConfig)(rawResponse);
        request.params = {
          queryId: statusConfig.queryId
        };
        const response = await (0, _common2.handleQueryStatus)({
          fetchStatus: async () => {
            var _status$data;
            const status = await sqlAsyncJobsFacet.describeQuery(context, request);
            logger.info(`sqlAsyncSearchStrategy: JOB: ${statusConfig.queryId} - STATUS: ${(_status$data = status.data) === null || _status$data === void 0 ? void 0 : _status$data.status}`);
            return status;
          },
          isServer: true
        });
        const dataFrame = (0, _common.createDataFrame)({
          name: (_query$dataset = query.dataset) === null || _query$dataset === void 0 ? void 0 : _query$dataset.id,
          schema: response.data.schema,
          meta: statusConfig,
          fields: (0, _common2.getFields)(response)
        });
        const elapsedMs = Date.now() - startTime;
        dataFrame.size = response.data.datarows.length;
        if (usage) usage.trackSuccess(elapsedMs);
        return {
          type: _common.DATA_FRAME_TYPES.POLLING,
          body: dataFrame,
          took: elapsedMs
        };
      } catch (e) {
        logger.error(`sqlAsyncSearchStrategy: ${e.message}`);
        if (usage) usage.trackError();
        throw e;
      }
    }
  };
};
exports.sqlAsyncSearchStrategyProvider = sqlAsyncSearchStrategyProvider;