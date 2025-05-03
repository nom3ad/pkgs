"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LegacyService = void 0;
var _rxjs = require("rxjs");
var _operators = require("rxjs/operators");
var _config = require("../../../legacy/server/config");
var _csp = require("../csp");
var _dev = require("../dev");
var _http = require("../http");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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
 */ // @ts-expect-error legacy config class
function getLegacyRawConfig(config, pathConfig) {
  const rawConfig = config.toRaw();

  // OpenSearch config is solely handled by the core and legacy platform
  // shouldn't have direct access to it.
  if (rawConfig.opensearch !== undefined) {
    delete rawConfig.opensearch;
  }
  return {
    ...rawConfig,
    // We rely heavily in the default value of 'path.data' in the legacy world and,
    // since it has been moved to NP, it won't show up in RawConfig.
    path: pathConfig
  };
}

/** @internal */

/** @internal */
class LegacyService {
  constructor(coreContext) {
    this.coreContext = coreContext;
    /** Symbol to represent the legacy platform as a fake "plugin". Used by the ContextService */
    _defineProperty(this, "legacyId", Symbol());
    _defineProperty(this, "log", void 0);
    _defineProperty(this, "devConfig$", void 0);
    _defineProperty(this, "httpConfig$", void 0);
    _defineProperty(this, "osdServer", void 0);
    _defineProperty(this, "configSubscription", void 0);
    _defineProperty(this, "setupDeps", void 0);
    _defineProperty(this, "update$", void 0);
    _defineProperty(this, "legacyRawConfig", void 0);
    _defineProperty(this, "settings", void 0);
    const {
      logger,
      configService
    } = coreContext;
    this.log = logger.get('legacy-service');
    this.devConfig$ = configService.atPath(_dev.config.path).pipe((0, _operators.map)(rawConfig => new _dev.DevConfig(rawConfig)));
    this.httpConfig$ = (0, _rxjs.combineLatest)(configService.atPath(_http.config.path), configService.atPath(_csp.config.path)).pipe((0, _operators.map)(([http, csp]) => new _http.HttpConfig(http, csp)));
  }
  async setupLegacyConfig() {
    this.update$ = (0, _rxjs.combineLatest)([this.coreContext.configService.getConfig$(), this.coreContext.configService.atPath('path')]).pipe((0, _operators.tap)(([config, pathConfig]) => {
      if (this.osdServer !== undefined) {
        this.osdServer.applyLoggingConfiguration(getLegacyRawConfig(config, pathConfig));
      }
    }), (0, _operators.tap)({
      error: err => this.log.error(err)
    }), (0, _operators.publishReplay)(1));
    this.configSubscription = this.update$.connect();
    this.settings = await this.update$.pipe((0, _operators.first)(), (0, _operators.map)(([config, pathConfig]) => getLegacyRawConfig(config, pathConfig))).toPromise();
    this.legacyRawConfig = _config.Config.withDefaultSchema(this.settings);
    return {
      settings: this.settings,
      legacyConfig: this.legacyRawConfig
    };
  }
  async setup(setupDeps) {
    this.log.debug('setting up legacy service');
    if (!this.legacyRawConfig) {
      throw new Error('Legacy config not initialized yet. Ensure LegacyService.setupLegacyConfig() is called before LegacyService.setup()');
    }

    // propagate the instance uuid to the legacy config, as it was the legacy way to access it.
    this.legacyRawConfig.set('server.uuid', setupDeps.core.environment.instanceUuid);
    this.setupDeps = setupDeps;
  }
  async start(startDeps) {
    const {
      setupDeps
    } = this;
    if (!setupDeps || !this.legacyRawConfig) {
      throw new Error('Legacy service is not setup yet.');
    }
    this.log.debug('starting legacy service');

    // Receive initial config and create osdServer/ClusterManager.
    if (this.coreContext.env.isDevClusterManager) {
      await this.createClusterManager(this.legacyRawConfig);
    } else {
      this.osdServer = await this.createOsdServer(this.settings, this.legacyRawConfig, setupDeps, startDeps);
    }
  }
  async stop() {
    this.log.debug('stopping legacy service');
    if (this.configSubscription !== undefined) {
      this.configSubscription.unsubscribe();
      this.configSubscription = undefined;
    }
    if (this.osdServer !== undefined) {
      await this.osdServer.close();
      this.osdServer = undefined;
    }
  }
  async createClusterManager(config) {
    const basePathProxy$ = this.coreContext.env.cliArgs.basePath ? (0, _rxjs.combineLatest)([this.devConfig$, this.httpConfig$]).pipe((0, _operators.first)(), (0, _operators.map)(([dev, http]) => new _http.BasePathProxyServer(this.coreContext.logger.get('server'), http, dev))) : _rxjs.EMPTY;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {
      ClusterManager
    } = require('./cluster_manager');
    return new ClusterManager(this.coreContext.env.cliArgs, config, await basePathProxy$.toPromise());
  }
  async createOsdServer(settings, config, setupDeps, startDeps) {
    const coreStart = {
      capabilities: startDeps.core.capabilities,
      opensearch: startDeps.core.opensearch,
      http: {
        auth: startDeps.core.http.auth,
        basePath: startDeps.core.http.basePath,
        getServerInfo: startDeps.core.http.getServerInfo
      },
      savedObjects: {
        getScopedClient: startDeps.core.savedObjects.getScopedClient,
        createScopedRepository: startDeps.core.savedObjects.createScopedRepository,
        createInternalRepository: startDeps.core.savedObjects.createInternalRepository,
        createSerializer: startDeps.core.savedObjects.createSerializer,
        getTypeRegistry: startDeps.core.savedObjects.getTypeRegistry
      },
      metrics: {
        collectionInterval: startDeps.core.metrics.collectionInterval,
        getOpsMetrics$: startDeps.core.metrics.getOpsMetrics$
      },
      uiSettings: {
        asScopedToClient: startDeps.core.uiSettings.asScopedToClient
      },
      auditTrail: startDeps.core.auditTrail,
      coreUsageData: {
        getCoreUsageData: () => {
          throw new Error('core.start.coreUsageData.getCoreUsageData is unsupported in legacy');
        }
      },
      crossCompatibility: startDeps.core.crossCompatibility,
      dynamicConfig: {
        getClient: startDeps.core.dynamicConfig.getClient,
        getAsyncLocalStore: startDeps.core.dynamicConfig.getAsyncLocalStore,
        createStoreFromRequest: startDeps.core.dynamicConfig.createStoreFromRequest
      },
      workspace: startDeps.core.workspace
    };
    const router = setupDeps.core.http.createRouter('', this.legacyId);
    const coreSetup = {
      capabilities: setupDeps.core.capabilities,
      context: setupDeps.core.context,
      opensearch: {
        legacy: setupDeps.core.opensearch.legacy
      },
      http: {
        createCookieSessionStorageFactory: setupDeps.core.http.createCookieSessionStorageFactory,
        registerRouteHandlerContext: setupDeps.core.http.registerRouteHandlerContext.bind(null, this.legacyId),
        createRouter: () => router,
        resources: setupDeps.core.httpResources.createRegistrar(router),
        registerOnPreRouting: setupDeps.core.http.registerOnPreRouting,
        registerOnPreAuth: setupDeps.core.http.registerOnPreAuth,
        registerAuth: setupDeps.core.http.registerAuth,
        registerOnPostAuth: setupDeps.core.http.registerOnPostAuth,
        registerOnPreResponse: setupDeps.core.http.registerOnPreResponse,
        basePath: setupDeps.core.http.basePath,
        auth: {
          get: setupDeps.core.http.auth.get,
          isAuthenticated: setupDeps.core.http.auth.isAuthenticated
        },
        csp: setupDeps.core.http.csp,
        getServerInfo: setupDeps.core.http.getServerInfo
      },
      logging: {
        configure: config$ => setupDeps.core.logging.configure([], config$)
      },
      metrics: {
        collectionInterval: setupDeps.core.metrics.collectionInterval,
        getOpsMetrics$: setupDeps.core.metrics.getOpsMetrics$
      },
      savedObjects: {
        setClientFactoryProvider: setupDeps.core.savedObjects.setClientFactoryProvider,
        addClientWrapper: setupDeps.core.savedObjects.addClientWrapper,
        registerType: setupDeps.core.savedObjects.registerType,
        getImportExportObjectLimit: setupDeps.core.savedObjects.getImportExportObjectLimit,
        setRepositoryFactoryProvider: setupDeps.core.savedObjects.setRepositoryFactoryProvider,
        setStatus: () => {
          throw new Error(`core.savedObjects.setStatus is unsupported in legacy`);
        }
      },
      status: {
        isStatusPageAnonymous: setupDeps.core.status.isStatusPageAnonymous,
        core$: setupDeps.core.status.core$,
        overall$: setupDeps.core.status.overall$,
        set: () => {
          throw new Error(`core.status.set is unsupported in legacy`);
        },
        // @ts-expect-error
        get dependencies$() {
          throw new Error(`core.status.dependencies$ is unsupported in legacy`);
        },
        // @ts-expect-error
        get derivedStatus$() {
          throw new Error(`core.status.derivedStatus$ is unsupported in legacy`);
        }
      },
      uiSettings: {
        register: setupDeps.core.uiSettings.register
      },
      auditTrail: setupDeps.core.auditTrail,
      getStartServices: () => Promise.resolve([coreStart, startDeps.plugins, {}]),
      security: setupDeps.core.security,
      workspace: setupDeps.core.workspace
    };

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const OsdServer = require('../../../legacy/server/osd_server');
    const osdServer = new OsdServer(settings, config, {
      env: {
        mode: this.coreContext.env.mode,
        packageInfo: this.coreContext.env.packageInfo
      },
      setupDeps: {
        core: coreSetup,
        plugins: setupDeps.plugins
      },
      startDeps: {
        core: coreStart,
        plugins: startDeps.plugins
      },
      __internals: {
        hapiServer: setupDeps.core.http.server,
        uiPlugins: setupDeps.uiPlugins,
        rendering: setupDeps.core.rendering
      },
      logger: this.coreContext.logger
    });

    // The osdWorkerType check is necessary to prevent the repl
    // from being started multiple times in different processes.
    // We only want one REPL.
    if (this.coreContext.env.cliArgs.repl && process.env.osdWorkerType === 'server') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('./cli').startRepl(osdServer);
    }
    const {
      autoListen
    } = await this.httpConfig$.pipe((0, _operators.first)()).toPromise();
    if (autoListen) {
      try {
        await osdServer.listen();
      } catch (err) {
        await osdServer.close();
        throw err;
      }
    } else {
      await osdServer.ready();
    }
    return osdServer;
  }
}
exports.LegacyService = LegacyService;