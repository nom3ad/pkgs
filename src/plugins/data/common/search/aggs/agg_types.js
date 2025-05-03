"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAggTypesFunctions = exports.getAggTypes = void 0;
var _buckets = require("./buckets");
var _metrics = require("./metrics");
var _count = require("./metrics/count");
var _avg = require("./metrics/avg");
var _sum = require("./metrics/sum");
var _median = require("./metrics/median");
var _min = require("./metrics/min");
var _max = require("./metrics/max");
var _top_hit = require("./metrics/top_hit");
var _std_deviation = require("./metrics/std_deviation");
var _cardinality = require("./metrics/cardinality");
var _percentiles = require("./metrics/percentiles");
var _geo_bounds = require("./metrics/geo_bounds");
var _geo_centroid = require("./metrics/geo_centroid");
var _percentile_ranks = require("./metrics/percentile_ranks");
var _derivative = require("./metrics/derivative");
var _cumulative_sum = require("./metrics/cumulative_sum");
var _moving_avg = require("./metrics/moving_avg");
var _serial_diff = require("./metrics/serial_diff");
var _date_histogram = require("./buckets/date_histogram");
var _histogram = require("./buckets/histogram");
var _range = require("./buckets/range");
var _date_range = require("./buckets/date_range");
var _ip_range = require("./buckets/ip_range");
var _terms = require("./buckets/terms");
var _filter = require("./buckets/filter");
var _filters = require("./buckets/filters");
var _significant_terms = require("./buckets/significant_terms");
var _geo_hash = require("./buckets/geo_hash");
var _geo_tile = require("./buckets/geo_tile");
var _bucket_sum = require("./metrics/bucket_sum");
var _bucket_avg = require("./metrics/bucket_avg");
var _bucket_min = require("./metrics/bucket_min");
var _bucket_max = require("./metrics/bucket_max");
var _filter_fn = require("./buckets/filter_fn");
var _filters_fn = require("./buckets/filters_fn");
var _significant_terms_fn = require("./buckets/significant_terms_fn");
var _ip_range_fn = require("./buckets/ip_range_fn");
var _date_range_fn = require("./buckets/date_range_fn");
var _range_fn = require("./buckets/range_fn");
var _geo_tile_fn = require("./buckets/geo_tile_fn");
var _geo_hash_fn = require("./buckets/geo_hash_fn");
var _histogram_fn = require("./buckets/histogram_fn");
var _date_histogram_fn = require("./buckets/date_histogram_fn");
var _terms_fn = require("./buckets/terms_fn");
var _avg_fn = require("./metrics/avg_fn");
var _bucket_avg_fn = require("./metrics/bucket_avg_fn");
var _bucket_max_fn = require("./metrics/bucket_max_fn");
var _bucket_min_fn = require("./metrics/bucket_min_fn");
var _bucket_sum_fn = require("./metrics/bucket_sum_fn");
var _cardinality_fn = require("./metrics/cardinality_fn");
var _count_fn = require("./metrics/count_fn");
var _cumulative_sum_fn = require("./metrics/cumulative_sum_fn");
var _derivative_fn = require("./metrics/derivative_fn");
var _geo_bounds_fn = require("./metrics/geo_bounds_fn");
var _geo_centroid_fn = require("./metrics/geo_centroid_fn");
var _max_fn = require("./metrics/max_fn");
var _median_fn = require("./metrics/median_fn");
var _min_fn = require("./metrics/min_fn");
var _moving_avg_fn = require("./metrics/moving_avg_fn");
var _percentile_ranks_fn = require("./metrics/percentile_ranks_fn");
var _percentiles_fn = require("./metrics/percentiles_fn");
var _serial_diff_fn = require("./metrics/serial_diff_fn");
var _std_deviation_fn = require("./metrics/std_deviation_fn");
var _sum_fn = require("./metrics/sum_fn");
var _top_hit_fn = require("./metrics/top_hit_fn");
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

/** @internal */

const getAggTypes = () => ({
  metrics: [{
    name: _metrics.METRIC_TYPES.COUNT,
    fn: _count.getCountMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.AVG,
    fn: _avg.getAvgMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.SUM,
    fn: _sum.getSumMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.MEDIAN,
    fn: _median.getMedianMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.MIN,
    fn: _min.getMinMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.MAX,
    fn: _max.getMaxMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.STD_DEV,
    fn: _std_deviation.getStdDeviationMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.CARDINALITY,
    fn: _cardinality.getCardinalityMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.PERCENTILES,
    fn: _percentiles.getPercentilesMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.PERCENTILE_RANKS,
    fn: _percentile_ranks.getPercentileRanksMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.TOP_HITS,
    fn: _top_hit.getTopHitMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.DERIVATIVE,
    fn: _derivative.getDerivativeMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.CUMULATIVE_SUM,
    fn: _cumulative_sum.getCumulativeSumMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.MOVING_FN,
    fn: _moving_avg.getMovingAvgMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.SERIAL_DIFF,
    fn: _serial_diff.getSerialDiffMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.AVG_BUCKET,
    fn: _bucket_avg.getBucketAvgMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.SUM_BUCKET,
    fn: _bucket_sum.getBucketSumMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.MIN_BUCKET,
    fn: _bucket_min.getBucketMinMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.MAX_BUCKET,
    fn: _bucket_max.getBucketMaxMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.GEO_BOUNDS,
    fn: _geo_bounds.getGeoBoundsMetricAgg
  }, {
    name: _metrics.METRIC_TYPES.GEO_CENTROID,
    fn: _geo_centroid.getGeoCentroidMetricAgg
  }],
  buckets: [{
    name: _buckets.BUCKET_TYPES.DATE_HISTOGRAM,
    fn: _date_histogram.getDateHistogramBucketAgg
  }, {
    name: _buckets.BUCKET_TYPES.HISTOGRAM,
    fn: _histogram.getHistogramBucketAgg
  }, {
    name: _buckets.BUCKET_TYPES.RANGE,
    fn: _range.getRangeBucketAgg
  }, {
    name: _buckets.BUCKET_TYPES.DATE_RANGE,
    fn: _date_range.getDateRangeBucketAgg
  }, {
    name: _buckets.BUCKET_TYPES.IP_RANGE,
    fn: _ip_range.getIpRangeBucketAgg
  }, {
    name: _buckets.BUCKET_TYPES.TERMS,
    fn: _terms.getTermsBucketAgg
  }, {
    name: _buckets.BUCKET_TYPES.FILTER,
    fn: _filter.getFilterBucketAgg
  }, {
    name: _buckets.BUCKET_TYPES.FILTERS,
    fn: _filters.getFiltersBucketAgg
  }, {
    name: _buckets.BUCKET_TYPES.SIGNIFICANT_TERMS,
    fn: _significant_terms.getSignificantTermsBucketAgg
  }, {
    name: _buckets.BUCKET_TYPES.GEOHASH_GRID,
    fn: _geo_hash.getGeoHashBucketAgg
  }, {
    name: _buckets.BUCKET_TYPES.GEOTILE_GRID,
    fn: _geo_tile.getGeoTitleBucketAgg
  }]
});

/** Buckets: **/

/** Metrics: **/
exports.getAggTypes = getAggTypes;
const getAggTypesFunctions = () => [_avg_fn.aggAvg, _bucket_avg_fn.aggBucketAvg, _bucket_max_fn.aggBucketMax, _bucket_min_fn.aggBucketMin, _bucket_sum_fn.aggBucketSum, _cardinality_fn.aggCardinality, _count_fn.aggCount, _cumulative_sum_fn.aggCumulativeSum, _derivative_fn.aggDerivative, _geo_bounds_fn.aggGeoBounds, _geo_centroid_fn.aggGeoCentroid, _max_fn.aggMax, _median_fn.aggMedian, _min_fn.aggMin, _moving_avg_fn.aggMovingAvg, _percentile_ranks_fn.aggPercentileRanks, _percentiles_fn.aggPercentiles, _serial_diff_fn.aggSerialDiff, _std_deviation_fn.aggStdDeviation, _sum_fn.aggSum, _top_hit_fn.aggTopHit, _filter_fn.aggFilter, _filters_fn.aggFilters, _significant_terms_fn.aggSignificantTerms, _ip_range_fn.aggIpRange, _date_range_fn.aggDateRange, _range_fn.aggRange, _geo_tile_fn.aggGeoTile, _geo_hash_fn.aggGeoHash, _date_histogram_fn.aggDateHistogram, _histogram_fn.aggHistogram, _terms_fn.aggTerms];
exports.getAggTypesFunctions = getAggTypesFunctions;