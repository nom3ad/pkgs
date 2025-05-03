"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.aggFilters = void 0;
var _i18n = require("@osd/i18n");
var _ = require("../");
var _get_parsed_value = require("../utils/get_parsed_value");
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

const fnName = 'aggFilters';
const aggFilters = () => ({
  name: fnName,
  help: _i18n.i18n.translate('data.search.aggs.function.buckets.filters.help', {
    defaultMessage: 'Generates a serialized agg config for a Filter agg'
  }),
  type: 'agg_type',
  args: {
    id: {
      types: ['string'],
      help: _i18n.i18n.translate('data.search.aggs.buckets.filters.id.help', {
        defaultMessage: 'ID for this aggregation'
      })
    },
    enabled: {
      types: ['boolean'],
      default: true,
      help: _i18n.i18n.translate('data.search.aggs.buckets.filters.enabled.help', {
        defaultMessage: 'Specifies whether this aggregation should be enabled'
      })
    },
    schema: {
      types: ['string'],
      help: _i18n.i18n.translate('data.search.aggs.buckets.filters.schema.help', {
        defaultMessage: 'Schema to use for this aggregation'
      })
    },
    filters: {
      types: ['string'],
      help: _i18n.i18n.translate('data.search.aggs.buckets.filters.filters.help', {
        defaultMessage: 'Filters to use for this aggregation'
      })
    },
    json: {
      types: ['string'],
      help: _i18n.i18n.translate('data.search.aggs.buckets.filters.json.help', {
        defaultMessage: 'Advanced json to include when the agg is sent to OpenSearch'
      })
    }
  },
  fn: (input, args) => {
    const {
      id,
      enabled,
      schema,
      ...rest
    } = args;
    return {
      type: 'agg_type',
      value: {
        id,
        enabled,
        schema,
        type: _.BUCKET_TYPES.FILTERS,
        params: {
          ...rest,
          filters: (0, _get_parsed_value.getParsedValue)(args, 'filters'),
          json: (0, _get_parsed_value.getParsedValue)(args, 'json')
        }
      }
    };
  }
});
exports.aggFilters = aggFilters;