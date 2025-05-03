"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCoreSettings = void 0;
var _accessibility = require("./accessibility");
var _date_formats = require("./date_formats");
var _misc = require("./misc");
var _navigation = require("./navigation");
var _notifications = require("./notifications");
var _theme = require("./theme");
var _state = require("./state");
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

const getCoreSettings = () => {
  return {
    ...(0, _accessibility.getAccessibilitySettings)(),
    ...(0, _date_formats.getDateFormatSettings)(),
    ...(0, _misc.getMiscUiSettings)(),
    ...(0, _navigation.getNavigationSettings)(),
    ...(0, _notifications.getNotificationsSettings)(),
    ...(0, _theme.getThemeSettings)(),
    ...(0, _state.getStateSettings)()
  };
};
exports.getCoreSettings = getCoreSettings;