"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBucketSize = void 0;
var _calculate_auto = require("./calculate_auto");
var _unit_to_seconds = require("./unit_to_seconds");
var _get_timerange = require("./get_timerange");
var _interval_regexp = require("../../../../common/interval_regexp");
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

const calculateBucketData = (timeInterval, capabilities) => {
  let intervalString = capabilities ? capabilities.getValidTimeInterval(timeInterval) : timeInterval;
  const intervalStringMatch = intervalString.match(_interval_regexp.INTERVAL_STRING_RE);
  const parsedInterval = (0, _unit_to_seconds.parseInterval)(intervalString);
  let bucketSize = Number(intervalStringMatch[1]) * (0, _unit_to_seconds.getUnitValue)(intervalStringMatch[2]);

  // don't go too small
  if (bucketSize < 1) {
    bucketSize = 1;
  }

  // Check decimal
  if (parsedInterval.value % 1 !== 0) {
    if (parsedInterval.unit !== 'ms') {
      const {
        value,
        unit
      } = (0, _unit_to_seconds.convertIntervalToUnit)(intervalString, _unit_to_seconds.ASCENDING_UNIT_ORDER[_unit_to_seconds.ASCENDING_UNIT_ORDER.indexOf(parsedInterval.unit) - 1]);
      intervalString = value + unit;
    } else {
      intervalString = '1ms';
    }
  }
  return {
    bucketSize,
    intervalString
  };
};
const calculateBucketSizeForAutoInterval = req => {
  const duration = (0, _get_timerange.getTimerangeDuration)(req);
  return _calculate_auto.calculateAuto.near(100, duration).asSeconds();
};
const getBucketSize = (req, interval, capabilities) => {
  const bucketSize = calculateBucketSizeForAutoInterval(req);
  let intervalString = `${bucketSize}s`;
  const gteAutoMatch = Boolean(interval) && interval.match(_interval_regexp.GTE_INTERVAL_RE);
  if (gteAutoMatch) {
    const bucketData = calculateBucketData(gteAutoMatch[1], capabilities);
    if (bucketData.bucketSize >= bucketSize) {
      return bucketData;
    }
  }
  const matches = interval && interval.match(_interval_regexp.INTERVAL_STRING_RE);
  if (matches) {
    intervalString = interval;
  }
  return calculateBucketData(intervalString, capabilities);
};
exports.getBucketSize = getBucketSize;