"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCalculateAutoTimeExpression = getCalculateAutoTimeExpression;
var _moment = _interopRequireDefault(require("moment"));
var _constants = require("../../../../common/constants");
var _time_buckets = require("../buckets/lib/time_buckets");
var _date_interval_utils = require("./date_interval_utils");
var _interval_options = require("../buckets/_interval_options");
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

function getCalculateAutoTimeExpression(getConfig) {
  return function calculateAutoTimeExpression(range) {
    const dates = (0, _date_interval_utils.toAbsoluteDates)(range);
    if (!dates) {
      return;
    }
    const buckets = new _time_buckets.TimeBuckets({
      'histogram:maxBars': getConfig(_constants.UI_SETTINGS.HISTOGRAM_MAX_BARS),
      'histogram:barTarget': getConfig(_constants.UI_SETTINGS.HISTOGRAM_BAR_TARGET),
      dateFormat: getConfig('dateFormat'),
      'dateFormat:scaled': getConfig('dateFormat:scaled')
    });
    buckets.setInterval(_interval_options.autoInterval);
    buckets.setBounds({
      min: (0, _moment.default)(dates.from),
      max: (0, _moment.default)(dates.to)
    });
    return buckets.getInterval().expression;
  };
}