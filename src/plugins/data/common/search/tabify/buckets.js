"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TabifyBuckets = void 0;
var _lodash = require("lodash");
var _moment = _interopRequireDefault(require("moment"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
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
const isRangeEqual = (range1, range2) => (range1 === null || range1 === void 0 ? void 0 : range1.from) === (range2 === null || range2 === void 0 ? void 0 : range2.from) && (range1 === null || range1 === void 0 ? void 0 : range1.to) === (range2 === null || range2 === void 0 ? void 0 : range2.to);
class TabifyBuckets {
  constructor(aggResp, aggParams, timeRange) {
    _defineProperty(this, "length", void 0);
    _defineProperty(this, "objectMode", void 0);
    _defineProperty(this, "buckets", void 0);
    _defineProperty(this, "_keys", []);
    if (aggResp && aggResp.buckets) {
      this.buckets = aggResp.buckets;
    } else if (aggResp) {
      // Some Bucket Aggs only return a single bucket (like filter).
      // In those instances, the aggResp is the content of the single bucket.
      this.buckets = [aggResp];
    } else {
      this.buckets = [];
    }
    this.objectMode = (0, _lodash.isPlainObject)(this.buckets);
    if (this.objectMode) {
      this._keys = (0, _lodash.keys)(this.buckets);
      this.length = this._keys.length;
    } else {
      this.length = this.buckets.length;
    }
    if (this.length && aggParams) {
      this.orderBucketsAccordingToParams(aggParams);
      if (aggParams.drop_partials) {
        this.dropPartials(aggParams, timeRange);
      }
    }
  }
  forEach(fn) {
    const buckets = this.buckets;
    if (this.objectMode) {
      this._keys.forEach(key => {
        fn(buckets[key], key);
      });
    } else {
      buckets.forEach(bucket => {
        fn(bucket, bucket.key);
      });
    }
  }
  orderBucketsAccordingToParams(params) {
    if (params.filters && this.objectMode) {
      this._keys = params.filters.map(filter => {
        const query = (0, _lodash.get)(filter, 'input.query.query_string.query', filter.input.query);
        const queryString = typeof query === 'string' ? query : JSON.stringify(query);
        return filter.label || queryString || '*';
      });
    } else if (params.ranges && this.objectMode) {
      this._keys = params.ranges.map(range => (0, _lodash.findKey)(this.buckets, el => isRangeEqual(el, range)));
    } else if (params.ranges && params.field.type !== 'date') {
      let ranges = params.ranges;
      if (params.ipRangeType) {
        ranges = params.ipRangeType === 'mask' ? ranges.mask : ranges.fromTo;
      }
      this.buckets = ranges.map(range => {
        if (range.mask) {
          return this.buckets.find(el => el.key === range.mask);
        }
        return this.buckets.find(el => isRangeEqual(el, range));
      });
    }
  }

  // dropPartials should only be called if the aggParam setting is enabled,
  // and the agg field is the same as the Time Range.
  dropPartials(params, timeRange) {
    if (!timeRange || this.buckets.length <= 1 || this.objectMode || !timeRange.timeFields.includes(params.field.name)) {
      return;
    }
    const interval = this.buckets[1].key - this.buckets[0].key;
    this.buckets = this.buckets.filter(bucket => {
      if ((0, _moment.default)(bucket.key).isBefore(timeRange.from)) {
        return false;
      }
      if ((0, _moment.default)(bucket.key + interval).isAfter(timeRange.to)) {
        return false;
      }
      return true;
    });
    this.length = this.buckets.length;
  }
}
exports.TabifyBuckets = TabifyBuckets;