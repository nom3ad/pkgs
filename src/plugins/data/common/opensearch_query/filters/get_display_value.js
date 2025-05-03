"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDisplayValueFromFilter = getDisplayValueFromFilter;
var _i18n = require("@osd/i18n");
var _get_index_pattern_from_filter = require("./get_index_pattern_from_filter");
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

function getValueFormatter(indexPattern, key) {
  // checking getFormatterForField exists because there is at least once case where an index pattern
  // is an object rather than an IndexPattern class
  if (!indexPattern || !indexPattern.getFormatterForField || !key) return;
  const field = indexPattern.fields.find(f => f.name === key);
  if (!field) {
    throw new Error(_i18n.i18n.translate('data.filter.filterBar.fieldNotFound', {
      defaultMessage: 'Field {key} not found in index pattern {indexPattern}',
      values: {
        key,
        indexPattern: indexPattern.title
      }
    }));
  }
  return indexPattern.getFormatterForField(field);
}
function getDisplayValueFromFilter(filter, indexPatterns) {
  if (typeof filter.meta.value === 'function') {
    const indexPattern = (0, _get_index_pattern_from_filter.getIndexPatternFromFilter)(filter, indexPatterns);
    const valueFormatter = getValueFormatter(indexPattern, filter.meta.key);
    return filter.meta.value(valueFormatter);
  } else {
    return filter.meta.value || '';
  }
}