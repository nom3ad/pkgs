"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VisAugmenterPlugin = void 0;
var _i18n = require("@osd/i18n");
var _configSchema = require("@osd/config-schema");
var _operators = require("rxjs/operators");
var _saved_objects = require("./saved_objects");
var _capabilities_provider = require("./capabilities_provider");
var _constants = require("../common/constants");
var _stats = require("./routes/stats");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface

// eslint-disable-next-line @typescript-eslint/no-empty-interface

class VisAugmenterPlugin {
  constructor(initializerContext) {
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "config$", void 0);
    this.logger = initializerContext.logger.get();
    this.config$ = initializerContext.config.create();
  }
  async setup(core) {
    this.logger.debug('VisAugmenter: Setup');
    core.savedObjects.registerType(_saved_objects.augmentVisSavedObjectType);
    core.capabilities.registerProvider(_capabilities_provider.capabilitiesProvider);
    const config = await this.config$.pipe((0, _operators.first)()).toPromise();
    const isAugmentationEnabled = config.pluginAugmentationEnabled === undefined ? true : config.pluginAugmentationEnabled;

    // Checks if the global yaml setting for enabling plugin augmentation is disabled.
    // If it is disabled, remove the settings as we would not want to show these to the
    // user due to it being disabled at the cluster level.
    if (isAugmentationEnabled) {
      core.uiSettings.register({
        [_constants.PLUGIN_AUGMENTATION_ENABLE_SETTING]: {
          name: _i18n.i18n.translate('visAugmenter.enablePluginAugmentationTitle', {
            defaultMessage: 'Enable plugin augmentation'
          }),
          value: true,
          description: _i18n.i18n.translate('visAugmenter.enablePluginAugmentationText', {
            defaultMessage: 'Plugin functionality can be accessed from line chart visualizations'
          }),
          category: ['visualization'],
          schema: _configSchema.schema.boolean()
        },
        [_constants.PLUGIN_AUGMENTATION_MAX_OBJECTS_SETTING]: {
          name: _i18n.i18n.translate('visAugmenter.enablePluginAugmentation.maxPluginObjectsTitle', {
            defaultMessage: 'Max number of associated augmentations'
          }),
          value: 10,
          description: _i18n.i18n.translate('visAugmenter.enablePluginAugmentation.maxPluginObjectsText', {
            defaultMessage: 'Associating more than 10 plugin resources per visualization can lead to performance ' + 'issues and increase the cost of running clusters.'
          }),
          category: ['visualization'],
          schema: _configSchema.schema.number({
            min: 0
          })
        }
      });
    }

    // Register server-side APIs
    const router = core.http.createRouter();
    (0, _stats.registerStatsRoute)(router, this.logger);
    return {};
  }
  start(core) {
    this.logger.debug('VisAugmenter: Started');
    return {};
  }
  stop() {}
}
exports.VisAugmenterPlugin = VisAugmenterPlugin;