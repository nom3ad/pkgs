"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MetricAggType = void 0;
exports.isMetricAggType = isMetricAggType;
var _i18n = require("@osd/i18n");
var _agg_type = require("../agg_type");
var _metric_agg_types = require("./metric_agg_types");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */ /*
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
const metricType = 'metrics';

// TODO need to make a more explicit interface for this

class MetricAggType extends _agg_type.AggType {
  constructor(config) {
    super(config);
    _defineProperty(this, "subtype", void 0);
    _defineProperty(this, "isScalable", void 0);
    _defineProperty(this, "type", metricType);
    _defineProperty(this, "getKey", () => {});
    this.getValue = config.getValue || ((agg, bucket) => {
      // Metric types where an empty set equals `zero`
      const isSettableToZero = [_metric_agg_types.METRIC_TYPES.CARDINALITY, _metric_agg_types.METRIC_TYPES.SUM].includes(agg.type.name);

      // Return proper values when no buckets are present
      // `Count` handles empty sets properly
      if (!bucket[agg.id] && isSettableToZero) return 0;
      return bucket[agg.id] && bucket[agg.id].value;
    });
    this.subtype = config.subtype || _i18n.i18n.translate('data.search.aggs.metrics.metricAggregationsSubtypeTitle', {
      defaultMessage: 'Metric Aggregations'
    });
    this.isScalable = config.isScalable || (() => false);
  }
}
exports.MetricAggType = MetricAggType;
function isMetricAggType(aggConfig) {
  return aggConfig && aggConfig.type === metricType;
}