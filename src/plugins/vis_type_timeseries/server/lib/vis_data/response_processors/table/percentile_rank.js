"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.percentileRank = percentileRank;
var _lodash = require("lodash");
var _get_splits = require("../../helpers/get_splits");
var _get_last_metric = require("../../helpers/get_last_metric");
var _to_percentile_number = require("../../../../../common/to_percentile_number");
var _get_agg_value = require("../../helpers/get_agg_value");
var _metric_types = require("../../../../../common/metric_types");
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

function percentileRank(bucket, panel, series) {
  return next => results => {
    const metric = (0, _get_last_metric.getLastMetric)(series);
    if (metric.type !== _metric_types.METRIC_TYPES.PERCENTILE_RANK) {
      return next(results);
    }
    const fakeResp = {
      aggregations: bucket
    };
    (0, _get_splits.getSplits)(fakeResp, panel, series).forEach(split => {
      // table allows only one percentile rank in a series (the last one will be chosen in case of several)
      const lastRankValue = (0, _lodash.last)(metric.values);
      const percentileRank = (0, _to_percentile_number.toPercentileNumber)(lastRankValue);
      const data = split.timeseries.buckets.map(bucket => [bucket.key, (0, _get_agg_value.getAggValue)(bucket, {
        ...metric,
        value: percentileRank
      })]);
      results.push({
        data,
        id: split.id,
        label: `${split.label} (${percentileRank || 0})`
      });
    });
    return next(results);
  };
}