"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveTimePattern = resolveTimePattern;
var _lodash = require("lodash");
var _moment = _interopRequireDefault(require("moment"));
var _time_pattern_to_wildcard = require("./time_pattern_to_wildcard");
var _opensearch_api = require("./opensearch_api");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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

/**
 *  Convert a time pattern into a list of indexes it could
 *  have matched and ones it did match.
 *
 *  @param  {Function} callCluster bound function for accessing an opensearch client
 *  @param  {String} timePattern
 *  @return {Promise<Object>} object that lists the indices that match based
 *                            on a wildcard version of the time pattern (all)
 *                            and the indices that actually match the time
 *                            pattern (matches);
 */
async function resolveTimePattern(callCluster, timePattern) {
  const aliases = await (0, _opensearch_api.callIndexAliasApi)(callCluster, (0, _time_pattern_to_wildcard.timePatternToWildcard)(timePattern));
  const allIndexDetails = (0, _lodash.chain)(aliases).reduce((acc, index, indexName) => acc.concat(indexName, Object.keys(index.aliases || {})), []).sortBy(indexName => indexName).sortedUniq().map(indexName => {
    const parsed = (0, _moment.default)(indexName, timePattern, true);
    if (!parsed.isValid()) {
      return {
        valid: false,
        indexName,
        order: indexName,
        isMatch: false
      };
    }
    return {
      valid: true,
      indexName,
      order: parsed,
      isMatch: indexName === parsed.format(timePattern)
    };
  }).orderBy(['valid', 'order'], ['desc', 'desc']).value();
  return {
    all: allIndexDetails.map(details => details.indexName),
    matches: allIndexDetails.filter(details => details.isMatch).map(details => details.indexName)
  };
}