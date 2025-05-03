"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = validateTime;
var _i18n = require("@osd/i18n");
var _moment = _interopRequireDefault(require("moment"));
var _to_milliseconds = require("../../../common/lib/to_milliseconds");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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

function validateTime(time, tlConfig) {
  const span = _moment.default.duration((0, _moment.default)(time.to).diff((0, _moment.default)(time.from))).asMilliseconds();
  const interval = (0, _to_milliseconds.toMS)(time.interval);
  const bucketCount = span / interval;
  const maxBuckets = tlConfig.settings['timeline:max_buckets'];
  if (bucketCount > maxBuckets) {
    throw new Error(_i18n.i18n.translate('timeline.serverSideErrors.bucketsOverflowErrorMessage', {
      defaultMessage: 'Max buckets exceeded: {bucketCount} of {maxBuckets} allowed. ' + 'Choose a larger interval or a shorter time span',
      values: {
        bucketCount: Math.round(bucketCount),
        maxBuckets
      }
    }));
  }
  return true;
}
module.exports = exports.default;