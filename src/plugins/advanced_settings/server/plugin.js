"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdvancedSettingsServerPlugin = void 0;
var _operators = require("rxjs/operators");
var _capabilities_provider = require("./capabilities_provider");
var _user_ui_settings_client_wrapper = require("./saved_objects/user_ui_settings_client_wrapper");
var _utils = require("./utils");
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
class AdvancedSettingsServerPlugin {
  constructor(initializerContext) {
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "userUiSettingsClientWrapper", void 0);
    _defineProperty(this, "coreStart", void 0);
    _defineProperty(this, "globalConfig$", void 0);
    this.logger = initializerContext.logger.get();
    this.globalConfig$ = initializerContext.config.legacy.globalConfig$;
  }
  async setup(core) {
    this.logger.debug('advancedSettings: Setup');
    core.capabilities.registerProvider(_capabilities_provider.capabilitiesProvider);
    core.capabilities.registerSwitcher(async (request, capabilities) => {
      return await core.security.readonlyService().hideForReadonly(request, capabilities, {
        advancedSettings: {
          save: false
        }
      });
    });
    const globalConfig = await this.globalConfig$.pipe((0, _operators.first)()).toPromise();
    const isPermissionControlEnabled = globalConfig.savedObjects.permission.enabled === true;
    const userUiSettingsClientWrapper = new _user_ui_settings_client_wrapper.UserUISettingsClientWrapper(this.logger, isPermissionControlEnabled);
    this.userUiSettingsClientWrapper = userUiSettingsClientWrapper;
    core.savedObjects.addClientWrapper(3,
    // The wrapper should be triggered after workspace_id_consumer wrapper which id is -3 to avoid creating user settings within any workspace.
    'user_ui_settings', userUiSettingsClientWrapper.wrapperFactory);
    core.capabilities.registerSwitcher(async (request, capabilities) => {
      const userName = (0, _utils.extractUserName)(request, this.coreStart);
      if (userName) {
        return {
          ...capabilities,
          userSettings: {
            enabled: true
          }
        };
      }
      return capabilities;
    });
    return {};
  }
  start(core) {
    var _this$userUiSettingsC;
    this.logger.debug('advancedSettings: Started');
    this.coreStart = core;
    (_this$userUiSettingsC = this.userUiSettingsClientWrapper) === null || _this$userUiSettingsC === void 0 || _this$userUiSettingsC.setCore(core);
    return {};
  }
  stop() {}
}
exports.AdvancedSettingsServerPlugin = AdvancedSettingsServerPlugin;