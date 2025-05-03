"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRangeBucketAgg = void 0;
var _i18n = require("@osd/i18n");
var _common = require("../../../../common");
var _bucket_agg_type = require("./bucket_agg_type");
var _range_key = require("./range_key");
var _range = require("./create_filter/range");
var _bucket_agg_types = require("./bucket_agg_types");
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

const rangeTitle = _i18n.i18n.translate('data.search.aggs.buckets.rangeTitle', {
  defaultMessage: 'Range'
});
const getRangeBucketAgg = ({
  getFieldFormatsStart
}) => {
  const keyCaches = new WeakMap();
  return new _bucket_agg_type.BucketAggType({
    name: _bucket_agg_types.BUCKET_TYPES.RANGE,
    title: rangeTitle,
    createFilter: (0, _range.createFilterRange)(getFieldFormatsStart),
    makeLabel(aggConfig) {
      return _i18n.i18n.translate('data.search.aggs.aggTypesLabel', {
        defaultMessage: '{fieldName} ranges',
        values: {
          fieldName: aggConfig.getFieldDisplayName()
        }
      });
    },
    getKey(bucket, key, agg) {
      let keys = keyCaches.get(agg);
      if (!keys) {
        keys = new Map();
        keyCaches.set(agg, keys);
      }
      const id = _range_key.RangeKey.idBucket(bucket);
      key = keys.get(id);
      if (!key) {
        key = new _range_key.RangeKey(bucket);
        keys.set(id, key);
      }
      return key;
    },
    getSerializedFormat(agg) {
      const format = agg.params.field ? agg.aggConfigs.indexPattern.getFormatterForField(agg.params.field).toJSON() : {
        id: undefined,
        params: undefined
      };
      return {
        id: 'range',
        params: {
          id: format.id,
          params: format.params
        }
      };
    },
    params: [{
      name: 'field',
      type: 'field',
      filterFieldTypes: [_common.OSD_FIELD_TYPES.NUMBER]
    }, {
      name: 'ranges',
      default: [{
        from: 0,
        to: 1000
      }, {
        from: 1000,
        to: 2000
      }],
      write(aggConfig, output) {
        output.params.ranges = aggConfig.params.ranges;
        output.params.keyed = true;
      }
    }]
  });
};
exports.getRangeBucketAgg = getRangeBucketAgg;