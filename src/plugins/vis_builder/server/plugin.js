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
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
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
        name: _i18n.i18n.translate('visbuilder.advancedSettings.visbuilderEnableVegaTitle', {
          defaultMessage: 'Enable vega transformation in visbuilder'
        }),
        value: false,
        description: _i18n.i18n.translate('visbuilder.advancedSettings.visbuilderEnableVegaText', {
          defaultMessage: `Allow visbuilder to render visualizations via vega.`
        }),
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