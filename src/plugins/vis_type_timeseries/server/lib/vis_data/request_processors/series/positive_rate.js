"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filter = exports.createPositiveRate = void 0;
exports.positiveRate = positiveRate;
var _get_bucket_size = require("../../helpers/get_bucket_size");
var _get_interval_and_timefield = require("../../get_interval_and_timefield");
var _bucket_transform = require("../../helpers/bucket_transform");
var _helpers = require("../../helpers");
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

const filter = metric => metric.type === 'positive_rate';
exports.filter = filter;
const createPositiveRate = (doc, intervalString, aggRoot) => metric => {
  const maxFn = _bucket_transform.bucketTransform.max;
  const derivativeFn = _bucket_transform.bucketTransform.derivative;
  const positiveOnlyFn = _bucket_transform.bucketTransform.positive_only;
  const maxMetric = {
    id: `${metric.id}-positive-rate-max`,
    type: 'max',
    field: metric.field
  };
  const derivativeMetric = {
    id: `${metric.id}-positive-rate-derivative`,
    type: 'derivative',
    field: `${metric.id}-positive-rate-max`,
    unit: metric.unit
  };
  const positiveOnlyMetric = {
    id: metric.id,
    type: 'positive_only',
    field: `${metric.id}-positive-rate-derivative`
  };
  const fakeSeriesMetrics = [maxMetric, derivativeMetric, positiveOnlyMetric];
  const maxBucket = maxFn(maxMetric, fakeSeriesMetrics, intervalString);
  const derivativeBucket = derivativeFn(derivativeMetric, fakeSeriesMetrics, intervalString);
  const positiveOnlyBucket = positiveOnlyFn(positiveOnlyMetric, fakeSeriesMetrics, intervalString);
  (0, _helpers.overwrite)(doc, `${aggRoot}.timeseries.aggs.${metric.id}-positive-rate-max`, maxBucket);
  (0, _helpers.overwrite)(doc, `${aggRoot}.timeseries.aggs.${metric.id}-positive-rate-derivative`, derivativeBucket);
  (0, _helpers.overwrite)(doc, `${aggRoot}.timeseries.aggs.${metric.id}`, positiveOnlyBucket);
};
exports.createPositiveRate = createPositiveRate;
function positiveRate(req, panel, series, opensearchQueryConfig, indexPatternObject, capabilities) {
  return next => doc => {
    const {
      interval
    } = (0, _get_interval_and_timefield.getIntervalAndTimefield)(panel, series, indexPatternObject);
    const {
      intervalString
    } = (0, _get_bucket_size.getBucketSize)(req, interval, capabilities);
    if (series.metrics.some(filter)) {
      series.metrics.filter(filter).forEach(createPositiveRate(doc, intervalString, `aggs.${series.id}.aggs`));
      return next(doc);
    }
    return next(doc);
  };
}