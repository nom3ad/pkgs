"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPercentilesMetricAgg = void 0;
var _i18n = require("@osd/i18n");
var _metric_agg_type = require("./metric_agg_type");
var _metric_agg_types = require("./metric_agg_types");
var _common = require("../../../../common");
var _get_response_agg_config_class = require("./lib/get_response_agg_config_class");
var _percentiles_get_value = require("./percentiles_get_value");
var _ordinal_suffix = require("./lib/ordinal_suffix");
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

const valueProps = {
  makeLabel() {
    const customLabel = this.getParam('customLabel');
    const label = customLabel || this.getFieldDisplayName();
    return _i18n.i18n.translate('data.search.aggs.metrics.percentiles.valuePropsLabel', {
      defaultMessage: '{percentile} percentile of {label}',
      values: {
        percentile: (0, _ordinal_suffix.ordinalSuffix)(this.key),
        label
      }
    });
  }
};
const getPercentilesMetricAgg = () => {
  return new _metric_agg_type.MetricAggType({
    name: _metric_agg_types.METRIC_TYPES.PERCENTILES,
    title: _i18n.i18n.translate('data.search.aggs.metrics.percentilesTitle', {
      defaultMessage: 'Percentiles'
    }),
    makeLabel(agg) {
      return _i18n.i18n.translate('data.search.aggs.metrics.percentilesLabel', {
        defaultMessage: 'Percentiles of {field}',
        values: {
          field: agg.getFieldDisplayName()
        }
      });
    },
    params: [{
      name: 'field',
      type: 'field',
      filterFieldTypes: [_common.OSD_FIELD_TYPES.NUMBER, _common.OSD_FIELD_TYPES.DATE, _common.OSD_FIELD_TYPES.HISTOGRAM]
    }, {
      name: 'percents',
      default: [1, 5, 25, 50, 75, 95, 99]
    }, {
      write(agg, output) {
        output.params.keyed = false;
      }
    }],
    getResponseAggs(agg) {
      const ValueAggConfig = (0, _get_response_agg_config_class.getResponseAggConfigClass)(agg, valueProps);
      return agg.getParam('percents').map(percent => new ValueAggConfig(percent));
    },
    getValue: _percentiles_get_value.getPercentileValue
  });
};
exports.getPercentilesMetricAgg = getPercentilesMetricAgg;