"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.siblingPipelineType = exports.siblingPipelineAggHelper = void 0;
var _i18n = require("@osd/i18n");
var _sibling_pipeline_agg_writer = require("./sibling_pipeline_agg_writer");
var _nested_agg_helpers = require("./nested_agg_helpers");
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

const metricAggFilter = ['!top_hits', '!percentiles', '!percentile_ranks', '!median', '!std_dev', '!sum_bucket', '!avg_bucket', '!min_bucket', '!max_bucket', '!derivative', '!moving_avg', '!serial_diff', '!cumulative_sum', '!geo_bounds', '!geo_centroid'];
const bucketAggFilter = [];
const siblingPipelineType = exports.siblingPipelineType = _i18n.i18n.translate('data.search.aggs.metrics.siblingPipelineAggregationsSubtypeTitle', {
  defaultMessage: 'Sibling pipeline aggregations'
});
const siblingPipelineAggHelper = exports.siblingPipelineAggHelper = {
  subtype: siblingPipelineType,
  params() {
    return [{
      name: 'customBucket',
      type: 'agg',
      allowedAggs: bucketAggFilter,
      default: null,
      makeAgg(agg, state = {
        type: 'date_histogram'
      }) {
        const orderAgg = agg.aggConfigs.createAggConfig(state, {
          addToAggConfigs: false
        });
        orderAgg.id = agg.id + '-bucket';
        return orderAgg;
      },
      modifyAggConfigOnSearchRequestStart: (0, _nested_agg_helpers.forwardModifyAggConfigOnSearchRequestStart)('customBucket'),
      write: () => {}
    }, {
      name: 'customMetric',
      type: 'agg',
      allowedAggs: metricAggFilter,
      default: null,
      makeAgg(agg, state = {
        type: 'count'
      }) {
        const orderAgg = agg.aggConfigs.createAggConfig(state, {
          addToAggConfigs: false
        });
        orderAgg.id = agg.id + '-metric';
        return orderAgg;
      },
      modifyAggConfigOnSearchRequestStart: (0, _nested_agg_helpers.forwardModifyAggConfigOnSearchRequestStart)('customMetric'),
      write: _sibling_pipeline_agg_writer.siblingPipelineAggWriter
    }];
  },
  getSerializedFormat(agg) {
    const customMetric = agg.getParam('customMetric');
    return customMetric ? customMetric.type.getSerializedFormat(customMetric) : {};
  }
};