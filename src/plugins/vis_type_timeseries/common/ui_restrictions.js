"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.limitOfSeries = exports.RESTRICTIONS_KEYS = exports.DEFAULT_UI_RESTRICTION = void 0;
var _panel_types = require("./panel_types");
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
/**
 * UI Restrictions keys
 * @constant
 * @public
 */
let RESTRICTIONS_KEYS = exports.RESTRICTIONS_KEYS = /*#__PURE__*/function (RESTRICTIONS_KEYS) {
  RESTRICTIONS_KEYS["WHITE_LISTED_GROUP_BY_FIELDS"] = "whiteListedGroupByFields";
  RESTRICTIONS_KEYS["ALLOW_LISTED_GROUP_BY_FIELDS"] = "allowListedGroupByFields";
  RESTRICTIONS_KEYS["WHITE_LISTED_METRICS"] = "whiteListedMetrics";
  RESTRICTIONS_KEYS["ALLOW_LISTED_METRICS"] = "allowListedMetrics";
  RESTRICTIONS_KEYS["WHITE_LISTED_TIMERANGE_MODES"] = "whiteListedTimerangeModes";
  RESTRICTIONS_KEYS["ALLOW_LISTED_TIMERANGE_MODES"] = "allowListedTimerangeModes";
  return RESTRICTIONS_KEYS;
}({});
/**
 * Default value for the UIRestriction
 * @constant
 * @public
 */
const DEFAULT_UI_RESTRICTION = exports.DEFAULT_UI_RESTRICTION = {
  '*': true
};

/** limit on the number of series for the panel
 * @constant
 * @public
 */
const limitOfSeries = exports.limitOfSeries = {
  [_panel_types.PANEL_TYPES.GAUGE]: 1,
  [_panel_types.PANEL_TYPES.METRIC]: 2
};