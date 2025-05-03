"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildQueryFromFilters = void 0;
var _lodash = require("lodash");
var _migrate_filter = require("./migrate_filter");
var _filter_matches_index = require("./filter_matches_index");
var _filters = require("../filters");
var _handle_nested_filter = require("./handle_nested_filter");
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
 * Create a filter that can be reversed for filters with negate set
 * @param {boolean} reverse This will reverse the filter. If true then
 *                          anything where negate is set will come
 *                          through otherwise it will filter out
 * @returns {function}
 */
const filterNegate = reverse => filter => {
  if ((0, _lodash.isUndefined)(filter.meta) || (0, _lodash.isUndefined)(filter.meta.negate)) {
    return !reverse;
  }
  return filter.meta && filter.meta.negate === reverse;
};

/**
 * Translate a filter into a query to support opensearch 5+
 * @param  {Object} filter - The filter to translate
 * @return {Object} the query version of that filter
 */
const translateToQuery = filter => {
  if (!filter) return;
  if (filter.query) {
    return filter.query;
  }
  return filter;
};
const buildQueryFromFilters = (filters = [], indexPattern, ignoreFilterIfFieldNotInIndex = false) => {
  filters = filters.filter(filter => filter && !(0, _filters.isFilterDisabled)(filter));
  const filtersToOpenSearchQueries = negate => {
    return filters.filter(filterNegate(negate)).filter(filter => !ignoreFilterIfFieldNotInIndex || (0, _filter_matches_index.filterMatchesIndex)(filter, indexPattern)).map(filter => {
      return (0, _migrate_filter.migrateFilter)(filter, indexPattern);
    }).map(filter => (0, _handle_nested_filter.handleNestedFilter)(filter, indexPattern)).map(translateToQuery).map(_filters.cleanFilter);
  };
  return {
    must: [],
    filter: filtersToOpenSearchQueries(false),
    should: [],
    must_not: filtersToOpenSearchQueries(true)
  };
};
exports.buildQueryFromFilters = buildQueryFromFilters;