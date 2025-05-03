"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Server = void 0;
var _elasticApmNode = _interopRequireDefault(require("elastic-apm-node"));
var _utils = require("@osd/utils");
var _std = require("@osd/std");
var _config = require("./config");
var _core_app = require("./core_app");
var _audit_trail = require("./audit_trail");
var _opensearch = require("./opensearch");
var _http = require("./http");
var _http_resources = require("./http_resources");
var _rendering = require("./rendering");
var _legacy = require("./legacy");
var _logging = require("./logging");
var _ui_settings = require("./ui_settings");
var _plugins = require("./plugins");
var _saved_objects = require("../server/saved_objects");
var _metrics = require("./metrics");
var _capabilities = require("./capabilities");
var _environment = require("./environment");
var _status_service = require("./status/status_service");
var _security_service = require("./security/security_service");
var _cross_compatibility = require("./cross_compatibility");
var _csp = require("./csp");
var _dev = require("./dev");
var _opensearch_dashboards_config = require("./opensearch_dashboards_config");
var _saved_objects2 = require("./saved_objects");
var _status = require("./status");
var _context = require("./context");
var _core_usage_data = require("./core_usage_data");
var _core_route_handler_context = require("./core_route_handler_context");
var _dynamic_config_service = require("./config/dynamic_config_service");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }
function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }
function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }
function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }
function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } } /*
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
const coreId = Symbol('core');
const rootConfigPath = '';
var _pluginsInitialized = /*#__PURE__*/new WeakMap();
class Server {
  constructor(rawConfigProvider, env, loggingSystem) {
    this.env = env;
    this.loggingSystem = loggingSystem;
    _defineProperty(this, "configService", void 0);
    _defineProperty(this, "dynamicConfigService", void 0);
    _defineProperty(this, "capabilities", void 0);
    _defineProperty(this, "context", void 0);
    _defineProperty(this, "opensearch", void 0);
    _defineProperty(this, "http", void 0);
    _defineProperty(this, "rendering", void 0);
    _defineProperty(this, "legacy", void 0);
    _defineProperty(this, "log", void 0);
    _defineProperty(this, "plugins", void 0);
    _defineProperty(this, "savedObjects", void 0);
    _defineProperty(this, "uiSettings", void 0);
    _defineProperty(this, "environment", void 0);
    _defineProperty(this, "metrics", void 0);
    _defineProperty(this, "httpResources", void 0);
    _defineProperty(this, "status", void 0);
    _defineProperty(this, "logging", void 0);
    _defineProperty(this, "coreApp", void 0);
    _defineProperty(this, "auditTrail", void 0);
    _defineProperty(this, "coreUsageData", void 0);
    _defineProperty(this, "security", void 0);
    _defineProperty(this, "crossCompatibility", void 0);
    _classPrivateFieldInitSpec(this, _pluginsInitialized, {
      writable: true,
      value: void 0
    });
    _defineProperty(this, "coreStart", void 0);
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "openSearchPluginDeps", new Map());
    this.logger = this.loggingSystem.asLoggerFactory();
    this.log = this.logger.get('server');
    this.configService = new _config.ConfigService(rawConfigProvider, env, this.logger);
    this.dynamicConfigService = new _dynamic_config_service.DynamicConfigService(this.configService, env, this.logger);
    const core = {
      coreId,
      configService: this.configService,
      dynamicConfigService: this.dynamicConfigService,
      env,
      logger: this.logger
    };
    this.context = new _context.ContextService(core);
    this.http = new _http.HttpService(core);
    this.rendering = new _rendering.RenderingService(core);
    this.plugins = new _plugins.PluginsService(core);
    this.legacy = new _legacy.LegacyService(core);
    this.opensearch = new _opensearch.OpenSearchService(core);
    this.savedObjects = new _saved_objects.SavedObjectsService(core);
    this.uiSettings = new _ui_settings.UiSettingsService(core);
    this.capabilities = new _capabilities.CapabilitiesService(core);
    this.environment = new _environment.EnvironmentService(core);
    this.metrics = new _metrics.MetricsService(core);
    this.status = new _status_service.StatusService(core);
    this.coreApp = new _core_app.CoreApp(core);
    this.httpResources = new _http_resources.HttpResourcesService(core);
    this.auditTrail = new _audit_trail.AuditTrailService(core);
    this.logging = new _logging.LoggingService(core);
    this.coreUsageData = new _core_usage_data.CoreUsageDataService(core);
    this.security = new _security_service.SecurityService(core);
    this.crossCompatibility = new _cross_compatibility.CrossCompatibilityService(core);
  }
  async setup() {
    this.log.debug('setting up server');
    const setupTransaction = _elasticApmNode.default.startTransaction('server_setup', 'opensearch_dashboards_platform');
    const environmentSetup = await this.environment.setup();

    // Discover any plugins before continuing. This allows other systems to utilize the plugin dependency graph.
    const {
      pluginTree,
      uiPlugins,
      requiredEnginePlugins
    } = await this.plugins.discover({
      environment: environmentSetup
    });
    this.openSearchPluginDeps = requiredEnginePlugins;
    const legacyConfigSetup = await this.legacy.setupLegacyConfig();

    // Immediately terminate in case of invalid configuration
    // This needs to be done after plugin discovery
    await this.configService.validate();
    await (0, _legacy.ensureValidConfiguration)(this.configService, legacyConfigSetup);

    // Once the configs have been validated, setup the dynamic config as schemas have also been verified
    const dynamicConfigServiceSetup = await this.dynamicConfigService.setup();
    const contextServiceSetup = this.context.setup({
      // We inject a fake "legacy plugin" with dependencies on every plugin so that legacy plugins:
      // 1) Can access context from any KP plugin
      // 2) Can register context providers that will only be available to other legacy plugins and will not leak into
      //    New Platform plugins.
      pluginDependencies: new Map([...pluginTree.asOpaqueIds, [this.legacy.legacyId, [...pluginTree.asOpaqueIds.keys()]]])
    });
    const auditTrailSetup = this.auditTrail.setup();
    const httpSetup = await this.http.setup({
      context: contextServiceSetup
    });

    // Once http is setup, register routes and async local storage
    await this.dynamicConfigService.registerRoutesAndHandlers({
      http: httpSetup
    });
    const capabilitiesSetup = this.capabilities.setup({
      http: httpSetup
    });
    const opensearchServiceSetup = await this.opensearch.setup({
      http: httpSetup
    });
    const savedObjectsSetup = await this.savedObjects.setup({
      http: httpSetup,
      opensearch: opensearchServiceSetup
    });
    const uiSettingsSetup = await this.uiSettings.setup({
      http: httpSetup,
      savedObjects: savedObjectsSetup
    });
    const metricsSetup = await this.metrics.setup({
      http: httpSetup
    });
    const statusSetup = await this.status.setup({
      opensearch: opensearchServiceSetup,
      pluginDependencies: pluginTree.asNames,
      savedObjects: savedObjectsSetup,
      environment: environmentSetup,
      http: httpSetup,
      metrics: metricsSetup
    });
    const renderingSetup = await this.rendering.setup({
      http: httpSetup,
      status: statusSetup,
      uiPlugins,
      dynamicConfig: dynamicConfigServiceSetup
    });
    const httpResourcesSetup = this.httpResources.setup({
      http: httpSetup,
      rendering: renderingSetup
    });
    const loggingSetup = this.logging.setup({
      loggingSystem: this.loggingSystem
    });
    const securitySetup = this.security.setup();
    this.coreUsageData.setup({
      metrics: metricsSetup
    });
    const coreSetup = {
      capabilities: capabilitiesSetup,
      context: contextServiceSetup,
      opensearch: opensearchServiceSetup,
      environment: environmentSetup,
      http: httpSetup,
      savedObjects: savedObjectsSetup,
      status: statusSetup,
      uiSettings: uiSettingsSetup,
      rendering: renderingSetup,
      httpResources: httpResourcesSetup,
      auditTrail: auditTrailSetup,
      logging: loggingSetup,
      metrics: metricsSetup,
      security: securitySetup,
      dynamicConfig: dynamicConfigServiceSetup
    };
    const pluginsSetup = await this.plugins.setup(coreSetup);
    _classPrivateFieldSet(this, _pluginsInitialized, pluginsSetup.initialized);
    await this.legacy.setup({
      core: {
        ...coreSetup,
        plugins: pluginsSetup,
        rendering: renderingSetup
      },
      plugins: (0, _std.mapToObject)(pluginsSetup.contracts),
      uiPlugins
    });
    this.registerCoreContext(coreSetup);
    this.coreApp.setup(coreSetup);
    setupTransaction === null || setupTransaction === void 0 || setupTransaction.end();
    return coreSetup;
  }
  async start() {
    this.log.debug('starting server');
    const startTransaction = _elasticApmNode.default.startTransaction('server_start', 'opensearch_dashboards_platform');
    const auditTrailStart = this.auditTrail.start();
    const opensearchStart = await this.opensearch.start({
      auditTrail: auditTrailStart
    });
    const dynamicConfigServiceStart = await this.dynamicConfigService.start({
      opensearch: opensearchStart
    });
    const soStartSpan = startTransaction === null || startTransaction === void 0 ? void 0 : startTransaction.startSpan('saved_objects.migration', 'migration');
    const savedObjectsStart = await this.savedObjects.start({
      opensearch: opensearchStart,
      pluginsInitialized: _classPrivateFieldGet(this, _pluginsInitialized)
    });
    soStartSpan === null || soStartSpan === void 0 || soStartSpan.end();
    const capabilitiesStart = this.capabilities.start();
    const uiSettingsStart = await this.uiSettings.start();
    const metricsStart = await this.metrics.start();
    const httpStart = this.http.getStartContract();
    const coreUsageDataStart = this.coreUsageData.start({
      opensearch: opensearchStart,
      savedObjects: savedObjectsStart
    });
    const crossCompatibilityServiceStart = this.crossCompatibility.start({
      opensearch: opensearchStart,
      plugins: this.openSearchPluginDeps
    });
    this.coreStart = {
      capabilities: capabilitiesStart,
      opensearch: opensearchStart,
      http: httpStart,
      metrics: metricsStart,
      savedObjects: savedObjectsStart,
      uiSettings: uiSettingsStart,
      auditTrail: auditTrailStart,
      coreUsageData: coreUsageDataStart,
      crossCompatibility: crossCompatibilityServiceStart,
      dynamicConfig: dynamicConfigServiceStart
    };
    const pluginsStart = await this.plugins.start(this.coreStart);
    await this.legacy.start({
      core: {
        ...this.coreStart,
        plugins: pluginsStart
      },
      plugins: (0, _std.mapToObject)(pluginsStart.contracts)
    });
    await this.http.start({
      dynamicConfigService: dynamicConfigServiceStart
    });
    await this.security.start();
    startTransaction === null || startTransaction === void 0 || startTransaction.end();
    return this.coreStart;
  }
  async stop() {
    this.log.debug('stopping server');
    await this.legacy.stop();
    await this.plugins.stop();
    await this.savedObjects.stop();
    await this.opensearch.stop();
    await this.http.stop();
    await this.uiSettings.stop();
    await this.rendering.stop();
    await this.metrics.stop();
    await this.status.stop();
    await this.logging.stop();
    await this.auditTrail.stop();
    await this.security.stop();
  }
  registerCoreContext(coreSetup) {
    coreSetup.http.registerRouteHandlerContext(coreId, 'core', async (context, req, res) => {
      return new _core_route_handler_context.CoreRouteHandlerContext(this.coreStart, req);
    });
  }
  async setupCoreConfig() {
    const configDescriptors = [_utils.config, _csp.config, _opensearch.config, _logging.config, _http.config, _plugins.config, _dev.config, _opensearch_dashboards_config.config, _saved_objects2.savedObjectsConfig, _saved_objects2.savedObjectsMigrationConfig, _ui_settings.config, _metrics.opsConfig, _status.config, _environment.config, _config.config];
    this.configService.addDeprecationProvider(rootConfigPath, _config.coreDeprecationProvider);
    for (const descriptor of configDescriptors) {
      if (descriptor.deprecations) {
        this.configService.addDeprecationProvider(descriptor.path, descriptor.deprecations);
      }
      await this.configService.setSchema(descriptor.path, descriptor.schema);
      this.dynamicConfigService.setSchema(descriptor.path, descriptor.schema);
    }
  }
}
exports.Server = Server;