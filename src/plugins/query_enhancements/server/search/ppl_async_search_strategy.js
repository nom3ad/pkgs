"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pplAsyncSearchStrategyProvider = void 0;
var _common = require("../../../data/common");
var _common2 = require("../../common");
var _utils = require("../utils");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const pplAsyncSearchStrategyProvider = (config$, logger, client, usage) => {
  const pplAsyncFacet = new _utils.Facet({
    client,
    logger,
    endpoint: 'enhancements.runDirectQuery'
  });
  const pplAsyncJobsFacet = new _utils.Facet({
    client,
    logger,
    endpoint: 'enhancements.getJobStatus',
    useJobs: true
  });
  return {
    search: async (context, request, options) => {
      try {
        const query = request.body.query;
        const pollQueryResultsParams = request.body.pollQueryResultsParams;
        const inProgressQueryId = pollQueryResultsParams === null || pollQueryResultsParams === void 0 ? void 0 : pollQueryResultsParams.queryId;
        if (!inProgressQueryId) {
          request.body = {
            ...request.body,
            lang: _common2.SEARCH_STRATEGY.PPL
          };
          const rawResponse = await pplAsyncFacet.describeQuery(context, request);
          if (!rawResponse.success) (0, _common2.throwFacetError)(rawResponse);
          const statusConfig = (0, _common2.buildQueryStatusConfig)(rawResponse);
          return {
            type: _common.DATA_FRAME_TYPES.POLLING,
            status: 'started',
            body: {
              queryStatusConfig: statusConfig
            }
          };
        } else {
          var _queryStatusResponse$;
          request.params = {
            queryId: inProgressQueryId
          };
          const queryStatusResponse = await pplAsyncJobsFacet.describeQuery(context, request);
          if (!queryStatusResponse.success) (0, _common2.throwFacetError)(queryStatusResponse);
          const queryStatus = (_queryStatusResponse$ = queryStatusResponse.data) === null || _queryStatusResponse$ === void 0 ? void 0 : _queryStatusResponse$.status;
          logger.info(`pplAsyncSearchStrategy: JOB: ${inProgressQueryId} - STATUS: ${queryStatus}`);
          if ((queryStatus === null || queryStatus === void 0 ? void 0 : queryStatus.toUpperCase()) === 'SUCCESS') {
            var _query$dataset, _queryStatusResponse$2, _queryStatusResponse$3;
            const dataFrame = (0, _common.createDataFrame)({
              name: (_query$dataset = query.dataset) === null || _query$dataset === void 0 ? void 0 : _query$dataset.id,
              schema: (_queryStatusResponse$2 = queryStatusResponse.data) === null || _queryStatusResponse$2 === void 0 ? void 0 : _queryStatusResponse$2.schema,
              meta: {
                ...pollQueryResultsParams
              },
              fields: (0, _common2.getFields)(queryStatusResponse)
            });
            dataFrame.size = (_queryStatusResponse$3 = queryStatusResponse.data) === null || _queryStatusResponse$3 === void 0 ? void 0 : _queryStatusResponse$3.datarows.length;
            return {
              type: _common.DATA_FRAME_TYPES.POLLING,
              status: 'success',
              body: dataFrame
            };
          } else if ((queryStatus === null || queryStatus === void 0 ? void 0 : queryStatus.toUpperCase()) === 'FAILED') {
            var _queryStatusResponse$4;
            return {
              type: _common.DATA_FRAME_TYPES.POLLING,
              status: 'failed',
              body: {
                error: `JOB: ${inProgressQueryId} failed: ${(_queryStatusResponse$4 = queryStatusResponse.data) === null || _queryStatusResponse$4 === void 0 ? void 0 : _queryStatusResponse$4.error}`
              }
            };
          }
          return {
            type: _common.DATA_FRAME_TYPES.POLLING,
            status: queryStatus
          };
        }
      } catch (e) {
        logger.error(`pplAsyncSearchStrategy: ${e.message}`);
        if (usage) usage.trackError();
        throw e;
      }
    }
  };
};
exports.pplAsyncSearchStrategyProvider = pplAsyncSearchStrategyProvider;