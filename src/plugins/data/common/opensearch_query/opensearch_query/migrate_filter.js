"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.migrateFilter = migrateFilter;
var _lodash = require("lodash");
var _filters = require("../filters");
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

function isDeprecatedMatchPhraseFilter(filter) {
  const fieldName = filter.query && filter.query.match && Object.keys(filter.query.match)[0];
  return Boolean(fieldName && (0, _lodash.get)(filter, ['query', 'match', fieldName, 'type']) === 'phrase');
}
function migrateFilter(filter, indexPattern) {
  if (isDeprecatedMatchPhraseFilter(filter)) {
    const fieldName = Object.keys(filter.query.match)[0];
    const params = (0, _lodash.get)(filter, ['query', 'match', fieldName]);
    let query = params.query;
    if (indexPattern) {
      const field = indexPattern.fields.find(f => f.name === fieldName);
      if (field) {
        query = (0, _filters.getConvertedValueForField)(field, params.query);
      }
    }
    return {
      ...filter,
      query: {
        match_phrase: {
          [fieldName]: (0, _lodash.omit)({
            ...params,
            query
          }, 'type')
        }
      }
    };
  }
  return filter;
}