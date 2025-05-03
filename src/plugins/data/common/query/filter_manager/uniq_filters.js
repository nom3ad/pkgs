"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uniqFilters = void 0;
var _lodash = require("lodash");
var _dedup_filters = require("./dedup_filters");
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
 * Remove duplicate filters from an array of filters
 *
 * @param {array} filters The filters to remove duplicates from
 * @param {object} comparatorOptions - Parameters to use for comparison

 * @returns {object} The original filters array with duplicates removed
 */
const uniqFilters = (filters, comparatorOptions = {}) => {
  let results = [];
  (0, _lodash.each)(filters, filter => {
    results = (0, _lodash.union)(results, (0, _dedup_filters.dedupFilters)(results, [filter]), comparatorOptions);
  });
  return results;
};
exports.uniqFilters = uniqFilters;