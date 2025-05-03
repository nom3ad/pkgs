"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.percentileRank = percentileRank;
var _get_agg_value = require("../../helpers/get_agg_value");
var _get_default_decoration = require("../../helpers/get_default_decoration");
var _get_splits = require("../../helpers/get_splits");
var _get_last_metric = require("../../helpers/get_last_metric");
var _to_percentile_number = require("../../../../../common/to_percentile_number");
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

function percentileRank(resp, panel, series, meta) {
  return next => results => {
    const metric = (0, _get_last_metric.getLastMetric)(series);
    if (metric.type !== _metric_types.METRIC_TYPES.PERCENTILE_RANK) {
      return next(results);
    }
    (0, _get_splits.getSplits)(resp, panel, series, meta).forEach(split => {
      (metric.values || []).forEach(percentileRank => {
        const data = split.timeseries.buckets.map(bucket => [bucket.key, (0, _get_agg_value.getAggValue)(bucket, {
          ...metric,
          value: (0, _to_percentile_number.toPercentileNumber)(percentileRank)
        })]);
        results.push({
          data,
          id: `${split.id}:${percentileRank}`,
          label: `${split.label} (${percentileRank || 0})`,
          color: split.color,
          ...(0, _get_default_decoration.getDefaultDecoration)(series)
        });
      });
    });
    return next(results);
  };
}