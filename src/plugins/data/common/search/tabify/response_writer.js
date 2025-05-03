"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TabbedAggResponseWriter = void 0;
var _lodash = require("lodash");
var _get_columns = require("./get_columns");
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
/**
 * Writer class that collects information about an aggregation response and
 * produces a table, or a series of tables.
 */
class TabbedAggResponseWriter {
  /**
   * @param {AggConfigs} aggs - the agg configs object to which the aggregation response correlates
   * @param {boolean} metricsAtAllLevels - setting to true will produce metrics for every bucket
   * @param {boolean} partialRows - setting to true will not remove rows with missing values
   */
  constructor(aggs, {
    metricsAtAllLevels = false,
    partialRows = false
  }) {
    _defineProperty(this, "columns", void 0);
    _defineProperty(this, "rows", []);
    _defineProperty(this, "bucketBuffer", []);
    _defineProperty(this, "metricBuffer", []);
    _defineProperty(this, "partialRows", void 0);
    this.partialRows = partialRows;
    this.columns = (0, _get_columns.tabifyGetColumns)(aggs.getResponseAggs(), !metricsAtAllLevels);
    this.rows = [];
  }

  /**
   * Create a new row by reading the row buffer and bucketBuffer
   */
  row() {
    const rowBuffer = {};
    this.bucketBuffer.forEach(bucket => {
      rowBuffer[bucket.id] = bucket.value;
    });
    this.metricBuffer.forEach(metric => {
      rowBuffer[metric.id] = metric.value;
    });
    const isPartialRow = !this.columns.every(column => rowBuffer.hasOwnProperty(column.id));
    const removePartial = isPartialRow && !this.partialRows;
    if (!(0, _lodash.isEmpty)(rowBuffer) && !removePartial) {
      this.rows.push(rowBuffer);
    }
  }
  response() {
    return {
      columns: this.columns,
      rows: this.rows
    };
  }
}
exports.TabbedAggResponseWriter = TabbedAggResponseWriter;