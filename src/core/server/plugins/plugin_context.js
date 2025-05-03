"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPluginInitializerContext = createPluginInitializerContext;
exports.createPluginSetupContext = createPluginSetupContext;
exports.createPluginStartContext = createPluginStartContext;
var _operators = require("rxjs/operators");
var _rxjs = require("rxjs");
var _utils = require("@osd/utils");
var _std = require("@osd/std");
var _types = require("./types");
var _opensearch_dashboards_config = require("../opensearch_dashboards_config");
var _opensearch_config = require("../opensearch/opensearch_config");
var _saved_objects_config = require("../saved_objects/saved_objects_config");
/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
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

/**
 * This returns a facade for `CoreContext` that will be exposed to the plugin initializer.
 * This facade should be safe to use across entire plugin lifespan.
 *
 * This is called for each plugin when it's created, so each plugin gets its own
 * version of these values.
 *
 * We should aim to be restrictive and specific in the APIs that we expose.
 *
 * @param coreContext OpenSearch Dashboards core context
 * @param pluginManifest The manifest of the plugin we're building these values for.
 * @internal
 */
function createPluginInitializerContext(coreContext, opaqueId, pluginManifest, instanceInfo) {
  return {
    opaqueId,
    /**
     * Environment information that is safe to expose to plugins and may be beneficial for them.
     */
    env: {
      mode: coreContext.env.mode,
      packageInfo: coreContext.env.packageInfo,
      instanceUuid: instanceInfo.uuid
    },
    /**
     * Plugin-scoped logger
     */
    logger: {
      get(...contextParts) {
        return coreContext.logger.get('plugins', pluginManifest.id, ...contextParts);
      }
    },
    /**
     * Core configuration functionality, enables fetching a subset of the config.
     */
    config: {
      legacy: {
        /**
         * Global configuration
         * Note: naming not final here, it will be renamed in a near future (https://github.com/elastic/kibana/issues/46240)
         * @deprecated
         */
        globalConfig$: (0, _rxjs.combineLatest)([coreContext.configService.atPath(_opensearch_dashboards_config.config.path), coreContext.configService.atPath(_opensearch_config.config.path), coreContext.configService.atPath(_utils.config.path), coreContext.configService.atPath(_saved_objects_config.savedObjectsConfig.path)]).pipe((0, _operators.map)(([opensearchDashboards, opensearch, path, savedObjects]) => (0, _std.deepFreeze)({
          opensearchDashboards: (0, _std.pick)(opensearchDashboards, _types.SharedGlobalConfigKeys.opensearchDashboards),
          opensearch: (0, _std.pick)(opensearch, _types.SharedGlobalConfigKeys.opensearch),
          path: (0, _std.pick)(path, _types.SharedGlobalConfigKeys.path),
          savedObjects: (0, _std.pick)(savedObjects, _types.SharedGlobalConfigKeys.savedObjects)
        })))
      },
      /**
       * Reads the subset of the config at the `configPath` defined in the plugin
       * manifest and validates it against the schema in the static `schema` on
       * the given `ConfigClass`.
       * @param ConfigClass A class (not an instance of a class) that contains a
       * static `schema` that we validate the config at the given `path` against.
       */
      create() {
        return coreContext.configService.atPath(pluginManifest.configPath).pipe((0, _operators.shareReplay)(1));
      },
      createIfExists() {
        return coreContext.configService.optionalAtPath(pluginManifest.configPath);
      }
    }
  };
}

/**
 * This returns a facade for `CoreContext` that will be exposed to the plugin `setup` method.
 * This facade should be safe to use only within `setup` itself.
 *
 * This is called for each plugin when it's set up, so each plugin gets its own
 * version of these values.
 *
 * We should aim to be restrictive and specific in the APIs that we expose.
 *
 * @param coreContext OpenSearch Dashboards core context
 * @param plugin The plugin we're building these values for.
 * @param deps Dependencies that Plugins services gets during setup.
 * @internal
 */
function createPluginSetupContext(coreContext, deps, plugin) {
  const router = deps.http.createRouter('', plugin.opaqueId);
  return {
    capabilities: {
      registerProvider: deps.capabilities.registerProvider,
      registerSwitcher: deps.capabilities.registerSwitcher
    },
    context: {
      createContextContainer: deps.context.createContextContainer
    },
    opensearch: {
      legacy: deps.opensearch.legacy
    },
    http: {
      createCookieSessionStorageFactory: deps.http.createCookieSessionStorageFactory,
      registerRouteHandlerContext: deps.http.registerRouteHandlerContext.bind(null, plugin.opaqueId),
      createRouter: () => router,
      resources: deps.httpResources.createRegistrar(router),
      registerOnPreRouting: deps.http.registerOnPreRouting,
      registerOnPreAuth: deps.http.registerOnPreAuth,
      registerAuth: deps.http.registerAuth,
      registerOnPostAuth: deps.http.registerOnPostAuth,
      registerOnPreResponse: deps.http.registerOnPreResponse,
      basePath: deps.http.basePath,
      auth: {
        get: deps.http.auth.get,
        isAuthenticated: deps.http.auth.isAuthenticated
      },
      csp: deps.http.csp,
      getServerInfo: deps.http.getServerInfo
    },
    logging: {
      configure: config$ => deps.logging.configure(['plugins', plugin.name], config$)
    },
    metrics: {
      collectionInterval: deps.metrics.collectionInterval,
      getOpsMetrics$: deps.metrics.getOpsMetrics$
    },
    savedObjects: {
      setClientFactoryProvider: deps.savedObjects.setClientFactoryProvider,
      addClientWrapper: deps.savedObjects.addClientWrapper,
      registerType: deps.savedObjects.registerType,
      getImportExportObjectLimit: deps.savedObjects.getImportExportObjectLimit,
      setRepositoryFactoryProvider: deps.savedObjects.setRepositoryFactoryProvider,
      setStatus: deps.savedObjects.setStatus
    },
    status: {
      core$: deps.status.core$,
      overall$: deps.status.overall$,
      set: deps.status.plugins.set.bind(null, plugin.name),
      dependencies$: deps.status.plugins.getDependenciesStatus$(plugin.name),
      derivedStatus$: deps.status.plugins.getDerivedStatus$(plugin.name),
      isStatusPageAnonymous: deps.status.isStatusPageAnonymous
    },
    uiSettings: {
      register: deps.uiSettings.register
    },
    getStartServices: () => plugin.startDependencies,
    auditTrail: deps.auditTrail,
    security: deps.security,
    dynamicConfigService: {
      registerDynamicConfigClientFactory: deps.dynamicConfig.registerDynamicConfigClientFactory,
      registerAsyncLocalStoreRequestHeader: deps.dynamicConfig.registerAsyncLocalStoreRequestHeader,
      getStartService: deps.dynamicConfig.getStartService
    }
  };
}

/**
 * This returns a facade for `CoreContext` that will be exposed to the plugin `start` method.
 * This facade should be safe to use only within `start` itself.
 *
 * This is called for each plugin when it starts, so each plugin gets its own
 * version of these values.
 *
 * @param coreContext OpenSearch Dashboards core context
 * @param plugin The plugin we're building these values for.
 * @param deps Dependencies that Plugins services gets during start.
 * @internal
 */
function createPluginStartContext(coreContext, deps, plugin) {
  return {
    capabilities: {
      resolveCapabilities: deps.capabilities.resolveCapabilities
    },
    opensearch: {
      client: deps.opensearch.client,
      createClient: deps.opensearch.createClient,
      legacy: deps.opensearch.legacy
    },
    http: {
      auth: deps.http.auth,
      basePath: deps.http.basePath,
      getServerInfo: deps.http.getServerInfo
    },
    savedObjects: {
      getScopedClient: deps.savedObjects.getScopedClient,
      createInternalRepository: deps.savedObjects.createInternalRepository,
      createScopedRepository: deps.savedObjects.createScopedRepository,
      createSerializer: deps.savedObjects.createSerializer,
      getTypeRegistry: deps.savedObjects.getTypeRegistry
    },
    metrics: {
      collectionInterval: deps.metrics.collectionInterval,
      getOpsMetrics$: deps.metrics.getOpsMetrics$
    },
    uiSettings: {
      asScopedToClient: deps.uiSettings.asScopedToClient
    },
    auditTrail: deps.auditTrail,
    coreUsageData: deps.coreUsageData,
    crossCompatibility: deps.crossCompatibility,
    dynamicConfig: {
      getAsyncLocalStore: deps.dynamicConfig.getAsyncLocalStore,
      getClient: deps.dynamicConfig.getClient,
      createStoreFromRequest: deps.dynamicConfig.createStoreFromRequest
    }
  };
}