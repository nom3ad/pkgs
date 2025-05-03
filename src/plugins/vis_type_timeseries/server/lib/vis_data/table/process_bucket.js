"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processBucket = processBucket;
var _build_processor_function = require("../build_processor_function");
var _table = require("../response_processors/table");
var _get_last_value = require("../../../../common/get_last_value");
var _lodash = require("lodash");
var _helpers = require("../helpers");
var _get_active_series = require("../helpers/get_active_series");
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

function trendSinceLastBucket(data) {
  if (data.length < 2) {
    return 0;
  }
  const currentBucket = data[data.length - 1];
  const prevBucket = data[data.length - 2];
  const trend = (currentBucket[1] - prevBucket[1]) / currentBucket[1];
  return Number.isNaN(trend) ? 0 : trend;
}
function processBucket(panel) {
  return bucket => {
    const series = (0, _get_active_series.getActiveSeries)(panel).map(series => {
      const timeseries = (0, _lodash.get)(bucket, `${series.id}.timeseries`);
      const buckets = (0, _lodash.get)(bucket, `${series.id}.buckets`);
      if (!timeseries && buckets) {
        const meta = (0, _lodash.get)(bucket, `${series.id}.meta`);
        const timeseries = {
          buckets: (0, _lodash.get)(bucket, `${series.id}.buckets`)
        };
        (0, _helpers.overwrite)(bucket, series.id, {
          meta,
          timeseries
        });
      }
      const processor = (0, _build_processor_function.buildProcessorFunction)(_table.processors, bucket, panel, series);
      const result = (0, _lodash.first)(processor([]));
      if (!result) return null;
      const data = (0, _lodash.get)(result, 'data', []);
      result.slope = trendSinceLastBucket(data);
      result.last = (0, _get_last_value.getLastValue)(data);
      return result;
    });
    return {
      key: bucket.key,
      series
    };
  };
}