"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIpRangeBucketAgg = exports.IP_RANGE_TYPES = void 0;
var _lodash = require("lodash");
var _i18n = require("@osd/i18n");
var _bucket_agg_type = require("./bucket_agg_type");
var _bucket_agg_types = require("./bucket_agg_types");
var _ip_range = require("./create_filter/ip_range");
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

const ipRangeTitle = _i18n.i18n.translate('data.search.aggs.buckets.ipRangeTitle', {
  defaultMessage: 'IPv4 Range'
});
let IP_RANGE_TYPES = exports.IP_RANGE_TYPES = /*#__PURE__*/function (IP_RANGE_TYPES) {
  IP_RANGE_TYPES["FROM_TO"] = "fromTo";
  IP_RANGE_TYPES["MASK"] = "mask";
  return IP_RANGE_TYPES;
}({});
const getIpRangeBucketAgg = () => new _bucket_agg_type.BucketAggType({
  name: _bucket_agg_types.BUCKET_TYPES.IP_RANGE,
  title: ipRangeTitle,
  createFilter: _ip_range.createFilterIpRange,
  getKey(bucket, key, agg) {
    if (agg.params.ipRangeType === IP_RANGE_TYPES.MASK) {
      return {
        type: 'mask',
        mask: key
      };
    }
    return {
      type: 'range',
      from: bucket.from,
      to: bucket.to
    };
  },
  getSerializedFormat(agg) {
    return {
      id: 'ip_range',
      params: agg.params.field ? agg.aggConfigs.indexPattern.getFormatterForField(agg.params.field).toJSON() : {}
    };
  },
  makeLabel(aggConfig) {
    return _i18n.i18n.translate('data.search.aggs.buckets.ipRangeLabel', {
      defaultMessage: '{fieldName} IP ranges',
      values: {
        fieldName: aggConfig.getFieldDisplayName()
      }
    });
  },
  params: [{
    name: 'field',
    type: 'field',
    filterFieldTypes: _common.OSD_FIELD_TYPES.IP
  }, {
    name: 'ipRangeType',
    default: IP_RANGE_TYPES.FROM_TO,
    write: _lodash.noop
  }, {
    name: 'ranges',
    default: {
      fromTo: [{
        from: '0.0.0.0',
        to: '127.255.255.255'
      }, {
        from: '128.0.0.0',
        to: '191.255.255.255'
      }],
      mask: [{
        mask: '0.0.0.0/1'
      }, {
        mask: '128.0.0.0/2'
      }]
    },
    write(aggConfig, output) {
      const ipRangeType = aggConfig.params.ipRangeType;
      let ranges = aggConfig.params.ranges[ipRangeType];
      if (ipRangeType === IP_RANGE_TYPES.FROM_TO) {
        ranges = (0, _lodash.map)(ranges, range => (0, _lodash.omitBy)(range, _lodash.isNull));
      }
      output.params.ranges = ranges;
    }
  }]
});
exports.getIpRangeBucketAgg = getIpRangeBucketAgg;