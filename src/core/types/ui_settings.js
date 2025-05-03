"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UiSettingScope = void 0;
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
 * UI element type to represent the settings.
 * @public
 * */
/**
 * UiSettings deprecation field options.
 * @public
 * */
/**
 * UiSettings scope options.
 * @experimental
 */
let UiSettingScope = exports.UiSettingScope = /*#__PURE__*/function (UiSettingScope) {
  UiSettingScope["GLOBAL"] = "global";
  UiSettingScope["USER"] = "user";
  UiSettingScope["WORKSPACE"] = "workspace";
  return UiSettingScope;
}({});
/**
 * UiSettings parameters defined by the plugins.
 * @public
 * */
/**
 * A sub-set of {@link UiSettingsParams} exposed to the client-side.
 * @public
 * */
/**
 * Allows regex objects or a regex string
 * @public
 * */
/**
 * StringValidation with regex object
 * @public
 * */
/**
 * StringValidation as regex string
 * @public
 * */
/**
 * @public
 * */
/**
 * Describes the values explicitly set by user.
 * @public
 * */