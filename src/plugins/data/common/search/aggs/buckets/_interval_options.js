"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAutoInterval = exports.intervalOptions = exports.autoInterval = void 0;
var _i18n = require("@osd/i18n");
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

const autoInterval = exports.autoInterval = 'auto';
const isAutoInterval = value => value === autoInterval;
exports.isAutoInterval = isAutoInterval;
const intervalOptions = exports.intervalOptions = [{
  display: _i18n.i18n.translate('data.search.aggs.buckets.intervalOptions.autoDisplayName', {
    defaultMessage: 'Auto'
  }),
  val: autoInterval,
  enabled(agg) {
    // not only do we need a time field, but the selected field needs
    // to be the time field. (see #3028)
    return agg.fieldIsTimeField();
  }
}, {
  display: _i18n.i18n.translate('data.search.aggs.buckets.intervalOptions.millisecondDisplayName', {
    defaultMessage: 'Millisecond'
  }),
  val: 'ms'
}, {
  display: _i18n.i18n.translate('data.search.aggs.buckets.intervalOptions.secondDisplayName', {
    defaultMessage: 'Second'
  }),
  val: 's'
}, {
  display: _i18n.i18n.translate('data.search.aggs.buckets.intervalOptions.minuteDisplayName', {
    defaultMessage: 'Minute'
  }),
  val: 'm'
}, {
  display: _i18n.i18n.translate('data.search.aggs.buckets.intervalOptions.hourlyDisplayName', {
    defaultMessage: 'Hour'
  }),
  val: 'h'
}, {
  display: _i18n.i18n.translate('data.search.aggs.buckets.intervalOptions.dailyDisplayName', {
    defaultMessage: 'Day'
  }),
  val: 'd'
}, {
  display: _i18n.i18n.translate('data.search.aggs.buckets.intervalOptions.weeklyDisplayName', {
    defaultMessage: 'Week'
  }),
  val: 'w'
}, {
  display: _i18n.i18n.translate('data.search.aggs.buckets.intervalOptions.monthlyDisplayName', {
    defaultMessage: 'Month'
  }),
  val: 'M'
}, {
  display: _i18n.i18n.translate('data.search.aggs.buckets.intervalOptions.yearlyDisplayName', {
    defaultMessage: 'Year'
  }),
  val: 'y'
}];