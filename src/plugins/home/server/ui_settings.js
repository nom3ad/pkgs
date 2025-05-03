"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uiSettings = exports.searchOverviewPageUISetting = void 0;
var _i18n = require("@osd/i18n");
var _configSchema = require("@osd/config-schema");
var _server = require("../../../core/server");
var _constants = require("../common/constants");
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

const uiSettings = exports.uiSettings = {
  [_constants.USE_NEW_HOME_PAGE]: {
    name: _i18n.i18n.translate('home.ui_settings.useNewHomePage.label', {
      defaultMessage: 'Use New Home Page'
    }),
    value: false,
    description: _i18n.i18n.translate('home.ui_settings.useNewHomePage.description', {
      defaultMessage: 'Try the new home page'
    }),
    schema: _configSchema.schema.boolean(),
    requiresPageReload: true
  }
};
const searchOverviewPageUISetting = exports.searchOverviewPageUISetting = {
  [_constants.SEARCH_WORKSPACE_DISMISS_GET_STARTED]: {
    value: false,
    description: _i18n.i18n.translate('home.ui_settings.searchOverview.dismissGetStarted.description', {
      defaultMessage: 'Dismiss get started section on search overview page'
    }),
    scope: _server.UiSettingScope.USER,
    schema: _configSchema.schema.boolean()
  }
};