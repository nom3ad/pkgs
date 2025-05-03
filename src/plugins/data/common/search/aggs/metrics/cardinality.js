"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCardinalityMetricAgg = void 0;
var _i18n = require("@osd/i18n");
var _metric_agg_type = require("./metric_agg_type");
var _metric_agg_types = require("./metric_agg_types");
var _common = require("../../../../common");
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

const uniqueCountTitle = _i18n.i18n.translate('data.search.aggs.metrics.uniqueCountTitle', {
  defaultMessage: 'Unique Count'
});
const getCardinalityMetricAgg = () => new _metric_agg_type.MetricAggType({
  name: _metric_agg_types.METRIC_TYPES.CARDINALITY,
  title: uniqueCountTitle,
  makeLabel(aggConfig) {
    return _i18n.i18n.translate('data.search.aggs.metrics.uniqueCountLabel', {
      defaultMessage: 'Unique count of {field}',
      values: {
        field: aggConfig.getFieldDisplayName()
      }
    });
  },
  getSerializedFormat(agg) {
    return {
      id: 'number'
    };
  },
  params: [{
    name: 'field',
    type: 'field',
    filterFieldTypes: Object.values(_common.OSD_FIELD_TYPES).filter(type => type !== _common.OSD_FIELD_TYPES.HISTOGRAM)
  }]
});
exports.getCardinalityMetricAgg = getCardinalityMetricAgg;