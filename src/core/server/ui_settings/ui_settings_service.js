"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UiSettingsService = void 0;
var _operators = require("rxjs/operators");
var _std = require("@osd/std");
var _ui_settings_config = require("./ui_settings_config");
var _ui_settings_client = require("./ui_settings_client");
var _saved_objects = require("./saved_objects");
var _routes = require("./routes");
var _settings = require("./settings");
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
/** @internal */
class UiSettingsService {
  constructor(coreContext) {
    this.coreContext = coreContext;
    _defineProperty(this, "log", void 0);
    _defineProperty(this, "config$", void 0);
    _defineProperty(this, "uiSettingsDefaults", new Map());
    _defineProperty(this, "overrides", {});
    this.log = coreContext.logger.get('ui-settings-service');
    this.config$ = coreContext.configService.atPath(_ui_settings_config.config.path);
  }
  async setup({
    http,
    savedObjects
  }) {
    this.log.debug('Setting up ui settings service');
    savedObjects.registerType(_saved_objects.uiSettingsType);
    (0, _routes.registerRoutes)(http.createRouter(''));
    this.register((0, _settings.getCoreSettings)());
    const config = await this.config$.pipe((0, _operators.first)()).toPromise();
    this.overrides = config.overrides || {};

    // Use uiSettings.defaults from the config file
    this.validateAndUpdateConfiguredDefaults(config.defaults);
    return {
      register: this.register.bind(this)
    };
  }
  async start() {
    this.validatesDefinitions();
    this.validatesOverrides();
    return {
      asScopedToClient: this.getScopedClientFactory()
    };
  }
  async stop() {}
  getScopedClientFactory() {
    const {
      version,
      buildNum
    } = this.coreContext.env.packageInfo;
    return savedObjectsClient => new _ui_settings_client.UiSettingsClient({
      type: 'config',
      id: version,
      buildNum,
      savedObjectsClient,
      defaults: (0, _std.mapToObject)(this.uiSettingsDefaults),
      overrides: this.overrides,
      log: this.log
    });
  }
  register(settings = {}) {
    Object.entries(settings).forEach(([key, value]) => {
      if (this.uiSettingsDefaults.has(key)) {
        throw new Error(`uiSettings for the key [${key}] has been already registered`);
      }
      this.uiSettingsDefaults.set(key, value);
    });
  }
  validatesDefinitions() {
    for (const [key, definition] of this.uiSettingsDefaults) {
      if (definition.schema) {
        definition.schema.validate(definition.value, {}, `ui settings defaults [${key}]`);
      }
    }
  }
  validatesOverrides() {
    for (const [key, value] of Object.entries(this.overrides)) {
      const definition = this.uiSettingsDefaults.get(key);
      if (definition !== null && definition !== void 0 && definition.schema) {
        definition.schema.validate(value, {}, `ui settings overrides [${key}]`);
      }
    }
  }
  validateAndUpdateConfiguredDefaults(defaults = {}) {
    for (const [key, value] of Object.entries(defaults)) {
      const definition = this.uiSettingsDefaults.get(key);
      if (!definition) throw new Error(`[ui settings defaults [${key}]: expected key to be have been registered`);
      if (definition.schema) {
        definition.schema.validate(value, {}, `ui settings configuration [${key}]`);
      }
      definition.value = value;
    }
  }
}
exports.UiSettingsService = UiSettingsService;