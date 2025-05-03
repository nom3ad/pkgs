"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFiltersBucketAgg = void 0;
var _i18n = require("@osd/i18n");
var _lodash = require("lodash");
var _filters = require("./create_filter/filters");
var _utils = require("../utils");
var _bucket_agg_type = require("./bucket_agg_type");
var _bucket_agg_types = require("./bucket_agg_types");
var _common = require("../../../../common");
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

const filtersTitle = _i18n.i18n.translate('data.search.aggs.buckets.filtersTitle', {
  defaultMessage: 'Filters',
  description: 'The name of an aggregation, that allows to specify multiple individual filters to group data by.'
});
const getFiltersBucketAgg = ({
  getConfig
}) => new _bucket_agg_type.BucketAggType({
  name: _bucket_agg_types.BUCKET_TYPES.FILTERS,
  title: filtersTitle,
  createFilter: _filters.createFilterFilters,
  customLabels: false,
  params: [{
    name: 'filters',
    default: () => [{
      input: {
        query: '',
        language: getConfig(_common.UI_SETTINGS.SEARCH_QUERY_LANGUAGE)
      },
      label: ''
    }],
    write(aggConfig, output) {
      const inFilters = aggConfig.params.filters;
      if (!(0, _lodash.size)(inFilters)) return;
      const outFilters = (0, _lodash.transform)(inFilters, function (filters, filter) {
        const input = (0, _lodash.cloneDeep)(filter.input);
        if (!input) {
          console.log('malformed filter agg params, missing "input" query'); // eslint-disable-line no-console
          return;
        }
        const opensearchQueryConfigs = (0, _common.getOpenSearchQueryConfig)({
          get: getConfig
        });
        const query = (0, _common.buildOpenSearchQuery)(aggConfig.getIndexPattern(), [input], [], opensearchQueryConfigs);
        if (!query) {
          console.log('malformed filter agg params, missing "query" on input'); // eslint-disable-line no-console
          return;
        }
        const matchAllLabel = filter.input.query === '' ? '*' : '';
        const label = filter.label || matchAllLabel || (typeof filter.input.query === 'string' ? filter.input.query : (0, _utils.toAngularJSON)(filter.input.query));
        filters[label] = query;
      }, {});
      if (!(0, _lodash.size)(outFilters)) return;
      const params = output.params || (output.params = {});
      params.filters = outFilters;
    }
  }]
});
exports.getFiltersBucketAgg = getFiltersBucketAgg;