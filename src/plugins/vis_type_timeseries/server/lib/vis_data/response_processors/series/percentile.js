"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.percentile = percentile;
var _get_agg_value = require("../../helpers/get_agg_value");
var _get_default_decoration = require("../../helpers/get_default_decoration");
var _get_splits = require("../../helpers/get_splits");
var _get_last_metric = require("../../helpers/get_last_metric");
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

function percentile(resp, panel, series, meta) {
  return next => results => {
    const metric = (0, _get_last_metric.getLastMetric)(series);
    if (metric.type !== _metric_types.METRIC_TYPES.PERCENTILE) {
      return next(results);
    }
    (0, _get_splits.getSplits)(resp, panel, series, meta).forEach(split => {
      metric.percentiles.forEach(percentile => {
        const percentileValue = percentile.value ? percentile.value : 0;
        const id = `${split.id}:${percentile.id}`;
        const data = split.timeseries.buckets.map(bucket => {
          const higherMetric = {
            ...metric,
            percent: percentileValue
          };
          const serieData = [bucket.key, (0, _get_agg_value.getAggValue)(bucket, higherMetric)];
          if (percentile.mode === 'band') {
            const lowerMetric = {
              ...metric,
              percent: percentile.percentile
            };
            serieData.push((0, _get_agg_value.getAggValue)(bucket, lowerMetric));
          }
          return serieData;
        });
        if (percentile.mode === 'band') {
          results.push({
            id,
            color: split.color,
            label: split.label,
            data,
            lines: {
              show: series.chart_type === 'line',
              fill: Number(percentile.shade),
              lineWidth: 0,
              mode: 'band'
            },
            bars: {
              show: series.chart_type === 'bar',
              fill: Number(percentile.shade),
              mode: 'band'
            },
            points: {
              show: false
            },
            y1AccessorFormat: ` (${percentileValue})`,
            y0AccessorFormat: ` (${percentile.percentile})`
          });
        } else {
          const decoration = (0, _get_default_decoration.getDefaultDecoration)(series);
          results.push({
            id,
            color: split.color,
            label: `${split.label} (${percentileValue})`,
            data,
            ...decoration
          });
        }
      });
    });
    return next(results);
  };
}