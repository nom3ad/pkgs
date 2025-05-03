"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDateRangeBucketAgg = void 0;
var _lodash = require("lodash");
var _momentTimezone = _interopRequireDefault(require("moment-timezone"));
var _i18n = require("@osd/i18n");
var _bucket_agg_types = require("./bucket_agg_types");
var _bucket_agg_type = require("./bucket_agg_type");
var _date_range = require("./create_filter/date_range");
var _types = require("../../../osd_field_types/types");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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

const dateRangeTitle = _i18n.i18n.translate('data.search.aggs.buckets.dateRangeTitle', {
  defaultMessage: 'Date Range'
});
const getDateRangeBucketAgg = ({
  isDefaultTimezone,
  getConfig
}) => new _bucket_agg_type.BucketAggType({
  name: _bucket_agg_types.BUCKET_TYPES.DATE_RANGE,
  title: dateRangeTitle,
  createFilter: _date_range.createFilterDateRange,
  getKey({
    from,
    to
  }) {
    return {
      from,
      to
    };
  },
  getSerializedFormat(agg) {
    return {
      id: 'date_range',
      params: agg.params.field ? agg.aggConfigs.indexPattern.getFormatterForField(agg.params.field).toJSON() : {}
    };
  },
  makeLabel(aggConfig) {
    return aggConfig.getFieldDisplayName() + ' date ranges';
  },
  params: [{
    name: 'field',
    type: 'field',
    filterFieldTypes: _types.OSD_FIELD_TYPES.DATE,
    default(agg) {
      return agg.getIndexPattern().timeFieldName;
    }
  }, {
    name: 'ranges',
    default: [{
      from: 'now-1w/w',
      to: 'now'
    }]
  }, {
    name: 'time_zone',
    default: undefined,
    // Implimentation method is the same as that of date_histogram
    serialize: () => undefined,
    write: (agg, output) => {
      const field = agg.getParam('field');
      let tz = agg.getParam('time_zone');
      if (!tz && field) {
        tz = (0, _lodash.get)(agg.getIndexPattern(), ['typeMeta', 'aggs', 'date_range', field.name, 'time_zone']);
      }
      if (!tz) {
        const detectedTimezone = _momentTimezone.default.tz.guess();
        const tzOffset = (0, _momentTimezone.default)().format('Z');
        tz = isDefaultTimezone() ? detectedTimezone || tzOffset : getConfig('dateFormat:tz');
      }
      output.params.time_zone = tz;
    }
  }]
});
exports.getDateRangeBucketAgg = getDateRangeBucketAgg;