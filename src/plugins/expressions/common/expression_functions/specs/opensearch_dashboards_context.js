"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.opensearchDashboardsContextFunction = void 0;
var _lodash = require("lodash");
var _i18n = require("@osd/i18n");
var _common = require("../../../../data/common");
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

const getParsedValue = (data, defaultValue) => typeof data === 'string' && data.length ? JSON.parse(data) || defaultValue : defaultValue;
const mergeQueries = (first = [], second) => (0, _lodash.uniqBy)([...(Array.isArray(first) ? first : [first]), ...(Array.isArray(second) ? second : [second])], n => JSON.stringify(n.query));
const opensearchDashboardsContextFunction = exports.opensearchDashboardsContextFunction = {
  name: 'opensearch_dashboards_context',
  type: 'opensearch_dashboards_context',
  inputTypes: ['opensearch_dashboards_context', 'null'],
  help: _i18n.i18n.translate('expressions.functions.opensearch_dashboards_context.help', {
    defaultMessage: 'Updates opensearch dashboards global context'
  }),
  args: {
    q: {
      types: ['string', 'null'],
      aliases: ['query', '_'],
      default: null,
      help: _i18n.i18n.translate('expressions.functions.opensearch_dashboards_context.q.help', {
        defaultMessage: 'Specify OpenSearch Dashboards free form text query'
      })
    },
    filters: {
      types: ['string', 'null'],
      default: '"[]"',
      help: _i18n.i18n.translate('expressions.functions.opensearch_dashboards_context.filters.help', {
        defaultMessage: 'Specify OpenSearch Dashboards generic filters'
      })
    },
    timeRange: {
      types: ['string', 'null'],
      default: null,
      help: _i18n.i18n.translate('expressions.functions.opensearch_dashboards_context.timeRange.help', {
        defaultMessage: 'Specify OpenSearch Dashboards time range filter'
      })
    },
    savedSearchId: {
      types: ['string', 'null'],
      default: null,
      help: _i18n.i18n.translate('expressions.functions.opensearch_dashboards_context.savedSearchId.help', {
        defaultMessage: 'Specify saved search ID to be used for queries and filters'
      })
    }
  },
  async fn(input, args, {
    getSavedObject
  }) {
    const timeRange = getParsedValue(args.timeRange, input === null || input === void 0 ? void 0 : input.timeRange);
    let queries = mergeQueries(input === null || input === void 0 ? void 0 : input.query, getParsedValue(args === null || args === void 0 ? void 0 : args.q, []));
    let filters = [...((input === null || input === void 0 ? void 0 : input.filters) || []), ...getParsedValue(args === null || args === void 0 ? void 0 : args.filters, [])];
    if (args.savedSearchId) {
      if (typeof getSavedObject !== 'function') {
        throw new Error('"getSavedObject" function not available in execution context. ' + 'When you execute expression you need to add extra execution context ' + 'as the third argument and provide "getSavedObject" implementation.');
      }
      const obj = await getSavedObject('search', args.savedSearchId);
      const search = obj.attributes.kibanaSavedObjectMeta;
      const {
        query,
        filter
      } = getParsedValue(search.searchSourceJSON, {});
      if (query) {
        queries = mergeQueries(queries, query);
      }
      if (filter) {
        filters = [...filters, ...(Array.isArray(filter) ? filter : [filter])];
      }
    }
    return {
      type: 'opensearch_dashboards_context',
      query: queries,
      filters: (0, _common.uniqFilters)(filters).filter(f => {
        var _f$meta;
        return !((_f$meta = f.meta) !== null && _f$meta !== void 0 && _f$meta.disabled);
      }),
      timeRange
    };
  }
};