"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFields = getFields;
var _lodash = require("lodash");
var _operators = require("rxjs/operators");
var _server = require("../../../data/server");
var _util = require("../../../data_source/common/util/");
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

async function getFields(requestContext, request, framework, indexPattern) {
  // NOTE / TODO: This facade has been put in place to make migrating to the New Platform easier. It
  // removes the need to refactor many layers of dependencies on "req", and instead just augments the top
  // level object passed from here. The layers should be refactored fully at some point, but for now
  // this works and we are still using the New Platform services for these vis data portions.
  const client = await (0, _util.decideLegacyClient)(requestContext, request);
  const reqFacade = {
    requestContext,
    ...request,
    framework,
    payload: {},
    pre: {
      indexPatternsService: new _server.IndexPatternsFetcher(client)
    },
    getUiSettingsService: () => requestContext.core.uiSettings.client,
    getSavedObjectsClient: () => requestContext.core.savedObjects.client,
    getOpenSearchShardTimeout: async () => {
      return await framework.globalConfig$.pipe((0, _operators.first)(), (0, _operators.map)(config => config.opensearch.shardTimeout.asMilliseconds())).toPromise();
    }
  };
  let indexPatternString = indexPattern;
  if (!indexPatternString) {
    const [, {
      data
    }] = await framework.core.getStartServices();
    const indexPatternsService = await data.indexPatterns.indexPatternsServiceFactory(request);
    const defaultIndexPattern = await indexPatternsService.getDefault();
    indexPatternString = (0, _lodash.get)(defaultIndexPattern, 'title', '');
  }
  const {
    searchStrategy,
    capabilities
  } = await framework.searchStrategyRegistry.getViableStrategy(reqFacade, indexPatternString);
  const fields = (await searchStrategy.getFieldsForWildcard(reqFacade, indexPatternString, capabilities)).filter(field => field.aggregatable && !_server.indexPatterns.isNestedField(field));
  return (0, _lodash.uniqBy)(fields, field => field.name);
}