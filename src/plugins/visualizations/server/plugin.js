"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VisualizationsPlugin = void 0;
var _i18n = require("@osd/i18n");
var _configSchema = require("@osd/config-schema");
var _constants = require("../common/constants");
var _saved_objects = require("./saved_objects");
var _usage_collector = require("./usage_collector");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */ /*
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
class VisualizationsPlugin {
  constructor(initializerContext) {
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "config", void 0);
    this.logger = initializerContext.logger.get();
    this.config = initializerContext.config.legacy.globalConfig$;
  }
  setup(core, plugins) {
    this.logger.debug('visualizations: Setup');
    core.savedObjects.registerType(_saved_objects.visualizationSavedObjectType);
    core.uiSettings.register({
      [_constants.VISUALIZE_ENABLE_LABS_SETTING]: {
        name: _i18n.i18n.translate('visualizations.advancedSettings.visualizeEnableLabsTitle', {
          defaultMessage: 'Enable experimental visualizations'
        }),
        value: true,
        description: _i18n.i18n.translate('visualizations.advancedSettings.visualizeEnableLabsText', {
          defaultMessage: `Allows users to create, view, and edit experimental visualizations. If disabled,
            only visualizations that are considered production-ready are available to the user.`
        }),
        category: ['visualization'],
        schema: _configSchema.schema.boolean()
      },
      [_constants.VISUALIZE_DISABLE_BUCKET_AGG_SETTING]: {
        name: _i18n.i18n.translate('visualizations.advancedSettings.visualizeDisableBucketAgg', {
          defaultMessage: 'Disable visualizations bucket aggregation types'
        }),
        value: [],
        description: _i18n.i18n.translate('visualizations.advancedSettings.visualizeDisableBucketAgg.description', {
          defaultMessage: `A comma-separated list of bucket aggregations' names. e.g. significant_terms, terms.
            Deactivates the specified bucket aggregations from visualizations.`
        }),
        category: ['visualization'],
        schema: _configSchema.schema.arrayOf(_configSchema.schema.string())
      }
    });
    if (plugins.usageCollection) {
      (0, _usage_collector.registerVisualizationsCollector)(plugins.usageCollection, this.config);
    }
    return {};
  }
  start(core) {
    this.logger.debug('visualizations: Started');
    return {};
  }
  stop() {}
}
exports.VisualizationsPlugin = VisualizationsPlugin;