"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildOpenSearchQuery = buildOpenSearchQuery;
var _lodash = require("lodash");
var _from_kuery = require("./from_kuery");
var _from_filters = require("./from_filters");
var _from_lucene = require("./from_lucene");
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
 * @param indexPattern
 * @param queries - a query object or array of query objects. Each query has a language property and a query property.
 * @param filters - a filter object or array of filter objects
 * @param config - an objects with query:allowLeadingWildcards and query:queryString:options UI
 * settings in form of { allowLeadingWildcards, queryStringOptions }
 * config contains dateformat:tz
 */
function buildOpenSearchQuery(indexPattern, queries, filters, config = {
  allowLeadingWildcards: false,
  queryStringOptions: {},
  ignoreFilterIfFieldNotInIndex: false
}) {
  queries = Array.isArray(queries) ? queries : [queries];
  filters = Array.isArray(filters) ? filters : [filters];
  const validQueries = queries.filter(query => (0, _lodash.has)(query, 'query'));
  const queriesByLanguage = (0, _lodash.groupBy)(validQueries, 'language');
  const unsupportedQueries = Object.keys(queriesByLanguage).filter(language => language !== 'kuery' && language.toLowerCase() !== 'lucene');
  if (unsupportedQueries.length > 0) {
    return {
      type: 'unsupported',
      queries,
      filters
    };
  }
  const kueryQuery = (0, _from_kuery.buildQueryFromKuery)(indexPattern, queriesByLanguage.kuery, config.allowLeadingWildcards, config.dateFormatTZ);
  const luceneQuery = (0, _from_lucene.buildQueryFromLucene)(queriesByLanguage.lucene, config.queryStringOptions, config.dateFormatTZ);
  const filterQuery = (0, _from_filters.buildQueryFromFilters)(filters, indexPattern, config.ignoreFilterIfFieldNotInIndex);
  return {
    bool: {
      must: [...kueryQuery.must, ...luceneQuery.must, ...filterQuery.must],
      filter: [...kueryQuery.filter, ...luceneQuery.filter, ...filterQuery.filter],
      should: [...kueryQuery.should, ...luceneQuery.should, ...filterQuery.should],
      must_not: [...kueryQuery.must_not, ...luceneQuery.must_not, ...filterQuery.must_not]
    }
  };
}