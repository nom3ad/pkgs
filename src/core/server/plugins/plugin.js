"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PluginWrapper = void 0;
var _path = require("path");
var _typeDetect = _interopRequireDefault(require("type-detect"));
var _rxjs = require("rxjs");
var _operators = require("rxjs/operators");
var _configSchema = require("@osd/config-schema");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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
const {
  join
} = _path.posix;

/**
 * Lightweight wrapper around discovered plugin that is responsible for instantiating
 * plugin and dispatching proper context and dependencies into plugin's lifecycle hooks.
 *
 * @internal
 */
class PluginWrapper {
  constructor(params) {
    this.params = params;
    _defineProperty(this, "path", void 0);
    _defineProperty(this, "manifest", void 0);
    _defineProperty(this, "opaqueId", void 0);
    _defineProperty(this, "name", void 0);
    _defineProperty(this, "configPath", void 0);
    _defineProperty(this, "requiredPlugins", void 0);
    _defineProperty(this, "optionalPlugins", void 0);
    _defineProperty(this, "requiredEnginePlugins", void 0);
    _defineProperty(this, "requiredBundles", void 0);
    _defineProperty(this, "includesServerPlugin", void 0);
    _defineProperty(this, "includesUiPlugin", void 0);
    _defineProperty(this, "supportedOSDataSourceVersions", void 0);
    _defineProperty(this, "requiredOSDataSourcePlugins", void 0);
    _defineProperty(this, "log", void 0);
    _defineProperty(this, "initializerContext", void 0);
    _defineProperty(this, "instance", void 0);
    _defineProperty(this, "startDependencies$", new _rxjs.Subject());
    _defineProperty(this, "startDependencies", this.startDependencies$.pipe((0, _operators.first)()).toPromise());
    this.path = params.path;
    this.manifest = params.manifest;
    this.opaqueId = params.opaqueId;
    this.initializerContext = params.initializerContext;
    this.log = params.initializerContext.logger.get();
    this.name = params.manifest.id;
    this.configPath = params.manifest.configPath;
    this.requiredPlugins = params.manifest.requiredPlugins;
    this.optionalPlugins = params.manifest.optionalPlugins;
    this.requiredEnginePlugins = params.manifest.requiredEnginePlugins;
    this.requiredBundles = params.manifest.requiredBundles;
    this.includesServerPlugin = params.manifest.server;
    this.includesUiPlugin = params.manifest.ui;
    this.supportedOSDataSourceVersions = params.manifest.supportedOSDataSourceVersions;
    this.requiredOSDataSourcePlugins = params.manifest.requiredOSDataSourcePlugins;
  }

  /**
   * Instantiates plugin and calls `setup` function exposed by the plugin initializer.
   * @param setupContext Context that consists of various core services tailored specifically
   * for the `setup` lifecycle event.
   * @param plugins The dictionary where the key is the dependency name and the value
   * is the contract returned by the dependency's `setup` function.
   */
  async setup(setupContext, plugins) {
    this.instance = this.createPluginInstance();
    return this.instance.setup(setupContext, plugins);
  }

  /**
   * Calls `start` function exposed by the initialized plugin.
   * @param startContext Context that consists of various core services tailored specifically
   * for the `start` lifecycle event.
   * @param plugins The dictionary where the key is the dependency name and the value
   * is the contract returned by the dependency's `start` function.
   */
  async start(startContext, plugins) {
    if (this.instance === undefined) {
      throw new Error(`Plugin "${this.name}" can't be started since it isn't set up.`);
    }
    const startContract = await this.instance.start(startContext, plugins);
    this.startDependencies$.next([startContext, plugins, startContract]);
    return startContract;
  }

  /**
   * Calls optional `stop` function exposed by the plugin initializer.
   */
  async stop() {
    if (this.instance === undefined) {
      throw new Error(`Plugin "${this.name}" can't be stopped since it isn't set up.`);
    }
    if (typeof this.instance.stop === 'function') {
      await this.instance.stop();
    }
    this.instance = undefined;
  }
  getConfigDescriptor() {
    if (!this.manifest.server) {
      return null;
    }
    const pluginPathServer = join(this.path, 'server');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pluginDefinition = require(pluginPathServer);
    if (!('config' in pluginDefinition)) {
      this.log.debug(`"${pluginPathServer}" does not export "config".`);
      return null;
    }
    const configDescriptor = pluginDefinition.config;
    if (!(0, _configSchema.isConfigSchema)(configDescriptor.schema)) {
      throw new Error('Configuration schema expected to be an instance of Type');
    }
    return configDescriptor;
  }
  createPluginInstance() {
    this.log.debug('Initializing plugin');

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pluginDefinition = require(join(this.path, 'server'));
    if (!('plugin' in pluginDefinition)) {
      throw new Error(`Plugin "${this.name}" does not export "plugin" definition (${this.path}).`);
    }
    const {
      plugin: initializer
    } = pluginDefinition;
    if (!initializer || typeof initializer !== 'function') {
      throw new Error(`Definition of plugin "${this.name}" should be a function (${this.path}).`);
    }
    const instance = initializer(this.initializerContext);
    if (!instance || typeof instance !== 'object') {
      throw new Error(`Initializer for plugin "${this.manifest.id}" is expected to return plugin instance, but returned "${(0, _typeDetect.default)(instance)}".`);
    }
    if (typeof instance.setup !== 'function') {
      throw new Error(`Instance of plugin "${this.name}" does not define "setup" function.`);
    }
    return instance;
  }
}
exports.PluginWrapper = PluginWrapper;