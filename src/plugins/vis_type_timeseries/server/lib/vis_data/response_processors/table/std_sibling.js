"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stdSibling = stdSibling;
var _get_splits = require("../../helpers/get_splits");
var _get_last_metric = require("../../helpers/get_last_metric");
var _get_sibling_agg_value = require("../../helpers/get_sibling_agg_value");
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

function stdSibling(bucket, panel, series) {
  return next => results => {
    const metric = (0, _get_last_metric.getLastMetric)(series);
    if (!/_bucket$/.test(metric.type)) return next(results);
    if (metric.type === 'std_deviation_bucket' && metric.mode === 'band') return next(results);
    const fakeResp = {
      aggregations: bucket
    };
    (0, _get_splits.getSplits)(fakeResp, panel, series).forEach(split => {
      const data = split.timeseries.buckets.map(b => {
        return [b.key, (0, _get_sibling_agg_value.getSiblingAggValue)(split, metric)];
      });
      results.push({
        id: split.id,
        label: split.label,
        data
      });
    });
    return next(results);
  };
}