"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getThemeSettings = void 0;
var _configSchema = require("@osd/config-schema");
var _i18n = require("@osd/i18n");
var _uiSharedDeps = require("@osd/ui-shared-deps");
var _ui_settings_config = require("../ui_settings_config");
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

// Setup theme options to be backwards compatible with the fact that v8 was persisted with its
// label rather than with the correct themeVersion value
const THEME_VERSIONS = Object.keys(_uiSharedDeps.themeVersionLabelMap);
const THEME_SCHEMA_VALUES = THEME_VERSIONS.concat(_uiSharedDeps.themeVersionLabelMap.v8);
const THEME_OPTIONS = THEME_VERSIONS.map(v => v !== 'v8' ? v : _uiSharedDeps.themeVersionLabelMap.v8);
const getThemeSettings = () => {
  return {
    'theme:darkMode': {
      name: _i18n.i18n.translate('core.ui_settings.params.darkModeTitle', {
        defaultMessage: 'Dark mode'
      }),
      value: false,
      description: _i18n.i18n.translate('core.ui_settings.params.darkModeText', {
        defaultMessage: `Enable a dark mode for the OpenSearch Dashboards UI. A page refresh is required for the setting to be applied.`
      }),
      requiresPageReload: true,
      category: ['appearance'],
      schema: _configSchema.schema.boolean()
    },
    'theme:version': {
      name: _i18n.i18n.translate('core.ui_settings.params.themeVersionTitle', {
        defaultMessage: 'Theme version'
      }),
      value: _ui_settings_config.DEFAULT_THEME_VERSION === 'v8' ? _uiSharedDeps.themeVersionLabelMap[_ui_settings_config.DEFAULT_THEME_VERSION] : _ui_settings_config.DEFAULT_THEME_VERSION,
      type: 'select',
      options: THEME_OPTIONS,
      optionLabels: _uiSharedDeps.themeVersionLabelMap,
      description: _i18n.i18n.translate('core.ui_settings.params.themeVersionText', {
        defaultMessage: `<p>Switch between the themes used for the current and next versions of OpenSearch Dashboards. A page refresh is required for the setting to be applied.</p><p><a href="{href}">{linkText}</a></p>`,
        values: {
          href: 'https://forum.opensearch.org/t/feedback-on-dark-mode-experience/15725',
          linkText: 'Theme feedback'
        }
      }),
      requiresPageReload: true,
      category: ['appearance'],
      schema: _configSchema.schema.oneOf(THEME_SCHEMA_VALUES.map(v => _configSchema.schema.literal(v)))
    }
  };
};
exports.getThemeSettings = getThemeSettings;