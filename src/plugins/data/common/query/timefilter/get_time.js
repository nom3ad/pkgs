"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateBounds = calculateBounds;
exports.getTime = getTime;
var _datemath = _interopRequireDefault(require("@elastic/datemath"));
var _ = require("../..");
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

function calculateBounds(timeRange, options = {}) {
  return {
    min: _datemath.default.parse(timeRange.from, {
      forceNow: options.forceNow
    }),
    max: _datemath.default.parse(timeRange.to, {
      roundUp: true,
      forceNow: options.forceNow
    })
  };
}
function getTime(indexPattern, timeRange, options) {
  return createTimeRangeFilter(indexPattern, timeRange, (options === null || options === void 0 ? void 0 : options.fieldName) || (indexPattern === null || indexPattern === void 0 ? void 0 : indexPattern.timeFieldName), options === null || options === void 0 ? void 0 : options.forceNow);
}
function createTimeRangeFilter(indexPattern, timeRange, fieldName, forceNow) {
  if (!indexPattern) {
    return;
  }
  const field = indexPattern.fields.find(f => f.name === (fieldName || indexPattern.timeFieldName));
  if (!field) {
    return;
  }
  const bounds = calculateBounds(timeRange, {
    forceNow
  });
  if (!bounds) {
    return;
  }
  return (0, _.buildRangeFilter)(field, {
    ...(bounds.min && {
      gte: bounds.min.toISOString()
    }),
    ...(bounds.max && {
      lte: bounds.max.toISOString()
    }),
    format: 'strict_date_optional_time'
  }, indexPattern);
}