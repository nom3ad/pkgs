"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uiSettings = void 0;
var _configSchema = require("@osd/config-schema");
var _i18n = require("@osd/i18n");
var _server = require("../../../core/server");
var _constants = require("../common/constants");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const uiSettings = exports.uiSettings = {
  [_constants.DEFAULT_WORKSPACE]: {
    name: 'Default workspace',
    scope: _server.UiSettingScope.USER,
    value: null,
    type: 'string',
    schema: _configSchema.schema.nullable(_configSchema.schema.string())
  },
  [_constants.ESSENTIAL_WORKSPACE_DISMISS_GET_STARTED]: {
    value: false,
    description: _i18n.i18n.translate('workspace.ui_settings.essentialOverview.dismissGetStarted.description', {
      defaultMessage: 'Dismiss get started section on essential overview page'
    }),
    scope: _server.UiSettingScope.USER,
    schema: _configSchema.schema.boolean()
  },
  [_constants.ANALYTICS_WORKSPACE_DISMISS_GET_STARTED]: {
    value: false,
    description: _i18n.i18n.translate('workspace.ui_settings.analyticsOverview.dismissGetStarted.description', {
      defaultMessage: 'Dismiss get started section on analytics overview page'
    }),
    scope: _server.UiSettingScope.USER,
    schema: _configSchema.schema.boolean()
  }
};