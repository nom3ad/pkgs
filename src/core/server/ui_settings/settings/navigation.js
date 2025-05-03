"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNavigationSettings = void 0;
var _configSchema = require("@osd/config-schema");
var _i18n = require("@osd/i18n");
var _std = require("@osd/std");
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

const getNavigationSettings = () => {
  return {
    defaultRoute: {
      name: _i18n.i18n.translate('core.ui_settings.params.defaultRoute.defaultRouteTitle', {
        defaultMessage: 'Default route'
      }),
      value: '/app/home',
      schema: _configSchema.schema.string({
        validate(value) {
          if (!value.startsWith('/') || !(0, _std.isRelativeUrl)(value)) {
            return _i18n.i18n.translate('core.ui_settings.params.defaultRoute.defaultRouteIsRelativeValidationMessage', {
              defaultMessage: 'Must be a relative URL.'
            });
          }
        }
      }),
      description: _i18n.i18n.translate('core.ui_settings.params.defaultRoute.defaultRouteText', {
        defaultMessage: 'This setting specifies the default route when opening OpenSearch Dashboards, ' + 'You can use this setting to modify the landing page when opening OpenSearch Dashboards, ' + 'The route must be a relative URL.'
      })
    },
    pageNavigation: {
      name: _i18n.i18n.translate('core.ui_settings.params.pageNavigationName', {
        defaultMessage: 'Side nav style'
      }),
      value: 'modern',
      description: _i18n.i18n.translate('core.ui_settings.params.pageNavigationDesc', {
        defaultMessage: 'Change the style of navigation'
      }),
      type: 'select',
      options: ['modern', 'legacy'],
      optionLabels: {
        modern: _i18n.i18n.translate('core.ui_settings.params.pageNavigationModern', {
          defaultMessage: 'Modern'
        }),
        legacy: _i18n.i18n.translate('core.ui_settings.params.pageNavigationLegacy', {
          defaultMessage: 'Legacy'
        })
      },
      category: ['appearance'],
      schema: _configSchema.schema.oneOf([_configSchema.schema.literal('modern'), _configSchema.schema.literal('legacy')])
    }
  };
};
exports.getNavigationSettings = getNavigationSettings;