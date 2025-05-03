"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bucketTransform = void 0;
var _get_buckets_path = require("./get_buckets_path");
var _parse_interval = require("./parse_interval");
var _saferLodashSet = require("@elastic/safer-lodash-set");
var _lodash = require("lodash");
var _i18n = require("@osd/i18n");
var _moving_fn_scripts = require("./moving_fn_scripts");
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

function checkMetric(metric, fields) {
  fields.forEach(field => {
    if (!metric[field]) {
      throw new Error(_i18n.i18n.translate('visTypeTimeseries.metricMissingErrorMessage', {
        defaultMessage: 'Metric missing {field}',
        values: {
          field
        }
      }));
    }
  });
}
function stdMetric(bucket) {
  checkMetric(bucket, ['type', 'field']);
  const body = {};
  body[bucket.type] = {
    field: bucket.field
  };
  return body;
}
function extendStats(bucket) {
  checkMetric(bucket, ['type', 'field']);
  const body = {
    extended_stats: {
      field: bucket.field
    }
  };
  if (bucket.sigma) body.extended_stats.sigma = parseInt(bucket.sigma, 10);
  return body;
}
function extendStatsBucket(bucket, metrics) {
  const bucketsPath = 'timeseries>' + (0, _get_buckets_path.getBucketsPath)(bucket.field, metrics);
  const body = {
    extended_stats_bucket: {
      buckets_path: bucketsPath
    }
  };
  if (bucket.sigma) {
    body.extended_stats_bucket.sigma = parseInt(bucket.sigma, 10);
  }
  return body;
}
const bucketTransform = exports.bucketTransform = {
  count: () => {
    return {
      bucket_script: {
        buckets_path: {
          count: '_count'
        },
        script: {
          source: 'count * 1',
          lang: 'expression'
        },
        gap_policy: 'skip'
      }
    };
  },
  static: bucket => {
    checkMetric(bucket, ['value']);
    // Anything containing a decimal point or an exponent is considered decimal value
    const isDecimalValue = Boolean(bucket.value.match(/[.e]/i));
    return {
      bucket_script: {
        buckets_path: {
          count: '_count'
        },
        script: {
          source: isDecimalValue ? bucket.value : `${bucket.value}L`,
          lang: 'painless'
        },
        gap_policy: 'skip'
      }
    };
  },
  avg: stdMetric,
  max: stdMetric,
  min: stdMetric,
  sum: stdMetric,
  cardinality: stdMetric,
  value_count: stdMetric,
  sum_of_squares: extendStats,
  variance: extendStats,
  std_deviation: extendStats,
  top_hit: bucket => {
    checkMetric(bucket, ['type', 'field', 'size']);
    const body = {
      filter: {
        exists: {
          field: bucket.field
        }
      },
      aggs: {
        docs: {
          top_hits: {
            size: bucket.size,
            _source: {
              includes: [bucket.field]
            }
          }
        }
      }
    };
    if (bucket.order_by) {
      (0, _saferLodashSet.set)(body, 'aggs.docs.top_hits.sort', [{
        [bucket.order_by]: {
          order: bucket.order
        }
      }]);
    }
    return body;
  },
  avg_bucket: extendStatsBucket,
  max_bucket: extendStatsBucket,
  min_bucket: extendStatsBucket,
  sum_bucket: extendStatsBucket,
  sum_of_squares_bucket: extendStatsBucket,
  std_deviation_bucket: extendStatsBucket,
  variance_bucket: extendStatsBucket,
  percentile: bucket => {
    checkMetric(bucket, ['type', 'field', 'percentiles']);
    let percents = bucket.percentiles.map(p => p.value ? Number(p.value) : 0);
    if (bucket.percentiles.some(p => p.mode === 'band')) {
      percents = percents.concat(bucket.percentiles.filter(p => p.percentile).map(p => p.percentile));
    }
    const agg = {
      percentiles: {
        field: bucket.field,
        percents
      }
    };
    return agg;
  },
  percentile_rank: bucket => {
    checkMetric(bucket, ['type', 'field', 'values']);
    return {
      percentile_ranks: {
        field: bucket.field,
        values: (bucket.values || []).map(value => (0, _lodash.isEmpty)(value) ? 0 : value)
      }
    };
  },
  derivative: (bucket, metrics, bucketSize) => {
    checkMetric(bucket, ['type', 'field']);
    const body = {
      derivative: {
        buckets_path: (0, _get_buckets_path.getBucketsPath)(bucket.field, metrics),
        gap_policy: 'skip',
        // seems sane
        unit: bucketSize
      }
    };
    if (bucket.gap_policy) body.derivative.gap_policy = bucket.gap_policy;
    if (bucket.unit) {
      body.derivative.unit = /^([\d]+)([shmdwMy]|ms)$/.test(bucket.unit) ? bucket.unit : bucketSize;
    }
    return body;
  },
  serial_diff: (bucket, metrics) => {
    checkMetric(bucket, ['type', 'field']);
    const body = {
      serial_diff: {
        buckets_path: (0, _get_buckets_path.getBucketsPath)(bucket.field, metrics),
        gap_policy: 'skip',
        // seems sane
        lag: 1
      }
    };
    if (bucket.gap_policy) body.serial_diff.gap_policy = bucket.gap_policy;
    if (bucket.lag) {
      body.serial_diff.lag = /^([\d]+)$/.test(bucket.lag) ? bucket.lag : 0;
    }
    return body;
  },
  cumulative_sum: (bucket, metrics) => {
    checkMetric(bucket, ['type', 'field']);
    return {
      cumulative_sum: {
        buckets_path: (0, _get_buckets_path.getBucketsPath)(bucket.field, metrics)
      }
    };
  },
  moving_average: (bucket, metrics) => {
    checkMetric(bucket, ['type', 'field']);
    return {
      moving_fn: {
        buckets_path: (0, _get_buckets_path.getBucketsPath)(bucket.field, metrics),
        window: bucket.window,
        script: _moving_fn_scripts.MODEL_SCRIPTS[bucket.model_type](bucket)
      }
    };
  },
  calculation: (bucket, metrics, bucketSize) => {
    checkMetric(bucket, ['variables', 'script']);
    const body = {
      bucket_script: {
        buckets_path: bucket.variables.reduce((acc, row) => {
          acc[row.name] = (0, _get_buckets_path.getBucketsPath)(row.field, metrics);
          return acc;
        }, {}),
        script: {
          source: bucket.script,
          lang: 'painless',
          params: {
            _interval: (0, _parse_interval.parseInterval)(bucketSize).asMilliseconds()
          }
        },
        gap_policy: 'skip' // seems sane
      }
    };

    if (bucket.gap_policy) body.bucket_script.gap_policy = bucket.gap_policy;
    return body;
  },
  positive_only: (bucket, metrics) => {
    checkMetric(bucket, ['field', 'type']);
    const body = {
      bucket_script: {
        buckets_path: {
          value: (0, _get_buckets_path.getBucketsPath)(bucket.field, metrics)
        },
        script: {
          source: 'params.value > 0.0 ? params.value : 0.0',
          lang: 'painless'
        },
        gap_policy: 'skip' // seems sane
      }
    };

    return body;
  }
};