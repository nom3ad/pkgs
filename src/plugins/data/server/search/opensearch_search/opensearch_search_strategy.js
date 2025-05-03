"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.opensearchSearchStrategyProvider = void 0;
var _operators = require("rxjs/operators");
var _to_snake_case = require("./to_snake_case");
var _ = require("..");
var _util = require("../../../../data_source/common/util/");
/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const opensearchSearchStrategyProvider = (config$, logger, usage, dataSource, openSearchServiceSetup, withLongNumeralsSupport) => {
  return {
    search: async (context, request, options) => {
      const config = await config$.pipe((0, _operators.first)()).toPromise();
      const uiSettingsClient = await context.core.uiSettings.client;

      // Only default index pattern type is supported here.
      // See data_enhanced for other type support.
      if (!!request.indexType) {
        throw new Error(`Unsupported index pattern type ${request.indexType}`);
      }

      // ignoreThrottled & dataFrameHydrationStrategy is not supported by default
      const {
        ignoreThrottled,
        dataFrameHydrationStrategy,
        ...defaultParams
      } = await (0, _.getDefaultSearchParams)(uiSettingsClient);
      const params = (0, _to_snake_case.toSnakeCase)({
        ...defaultParams,
        ...(0, _.getShardTimeout)(config),
        ...request.params
      });
      try {
        var _openSearchServiceSet;
        const isOpenSearchHostsEmpty = (openSearchServiceSetup === null || openSearchServiceSetup === void 0 || (_openSearchServiceSet = openSearchServiceSetup.legacy) === null || _openSearchServiceSet === void 0 || (_openSearchServiceSet = _openSearchServiceSet.client) === null || _openSearchServiceSet === void 0 || (_openSearchServiceSet = _openSearchServiceSet.config) === null || _openSearchServiceSet === void 0 || (_openSearchServiceSet = _openSearchServiceSet.hosts) === null || _openSearchServiceSet === void 0 ? void 0 : _openSearchServiceSet.length) === 0;
        if (dataSource !== null && dataSource !== void 0 && dataSource.dataSourceEnabled() && isOpenSearchHostsEmpty && !request.dataSourceId) {
          throw new Error(`Data source id is required when no openseach hosts config provided`);
        }
        const client = await (0, _util.decideClient)(context, request, withLongNumeralsSupport);
        const promise = (0, _.shimAbortSignal)(client.search(params), options === null || options === void 0 ? void 0 : options.abortSignal);
        const {
          body: rawResponse
        } = await promise;
        if (usage) usage.trackSuccess(rawResponse.took);

        // The above query will either complete or timeout and throw an error.
        // There is no progress indication on this api.
        return {
          isPartial: false,
          isRunning: false,
          rawResponse,
          ...(0, _.getTotalLoaded)(rawResponse._shards),
          withLongNumeralsSupport
        };
      } catch (e) {
        if (usage) usage.trackError();
        if (dataSource !== null && dataSource !== void 0 && dataSource.dataSourceEnabled()) {
          throw dataSource.createDataSourceError(e);
        }
        throw e;
      }
    }
  };
};
exports.opensearchSearchStrategyProvider = opensearchSearchStrategyProvider;