"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerStatsRoute = void 0;
var _common = require("../../common");
var _common2 = require("../../../saved_objects/common");
var _stats_helpers = require("./stats_helpers");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const registerStatsRoute = (router, logger) => {
  router.get({
    path: `${_common.APP_API}${_common.APP_PATH.STATS}`,
    validate: {}
  }, async (context, request, response) => {
    try {
      const savedObjectsClient = context.core.savedObjects.client;
      const augmentVisSavedObjects = await (0, _stats_helpers.getAugmentVisSavedObjects)(savedObjectsClient, _common2.PER_PAGE_VALUE);
      const stats = (0, _stats_helpers.getStats)(augmentVisSavedObjects);
      return response.ok({
        body: stats
      });
    } catch (error) {
      var _error$body;
      logger.error(error);
      return response.customError({
        statusCode: error.statusCode || 500,
        body: {
          message: error.message,
          attributes: {
            error: ((_error$body = error.body) === null || _error$body === void 0 ? void 0 : _error$body.error) || error.message
          }
        }
      });
    }
  });
};
exports.registerStatsRoute = registerStatsRoute;