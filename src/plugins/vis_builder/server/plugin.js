"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VisBuilderPlugin = void 0;
var _i18n = require("@osd/i18n");
var _configSchema = require("@osd/config-schema");
var _capabilities_provider = require("./capabilities_provider");
var _saved_objects = require("./saved_objects");
var _constants = require("../common/constants");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class VisBuilderPlugin {
  constructor(initializerContext) {
    _defineProperty(this, "logger", void 0);
    this.logger = initializerContext.logger.get();
  }
  setup({
    capabilities,
    http,
    savedObjects,
    uiSettings
  }) {
    this.logger.debug('vis-builder: Setup');

    // Register saved object types
    savedObjects.registerType(_saved_objects.visBuilderSavedObjectType);

    // Register capabilities
    capabilities.registerProvider(_capabilities_provider.capabilitiesProvider);

    // Register settings
    uiSettings.register({
      [_constants.VISBUILDER_ENABLE_VEGA_SETTING]: {
        name: _i18n.i18n.translate('visBuilder.advancedSettings.visbuilderEnableVegaTitle', {
          defaultMessage: 'Enable vega transformation in visbuilder'
        }),
        value: false,
        description: _i18n.i18n.translate('visBuilder.advancedSettings.visbuilderEnableVegaText', {
          defaultMessage: `Allow visbuilder to render visualizations via vega.`
        }),
        requiresPageReload: true,
        category: ['visbuilder'],
        schema: _configSchema.schema.boolean()
      }
    });
    return {};
  }
  start(_core) {
    this.logger.debug('vis-builder: Started');
    return {};
  }
  stop() {}
}
exports.VisBuilderPlugin = VisBuilderPlugin;