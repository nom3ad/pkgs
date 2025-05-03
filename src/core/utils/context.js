"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContextContainer = void 0;
var _lodash = require("lodash");
var _std = require("@osd/std");
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
/**
 * Make all properties in T optional, except for the properties whose keys are in the union K
 */

/**
 * A function that returns a context value for a specific key of given context type.
 *
 * @remarks
 * This function will be called each time a new context is built for a handler invocation.
 *
 * @param context - A partial context object containing only the keys for values provided by plugin dependencies
 * @param rest - Additional parameters provided by the service owner of this context
 * @returns The context value associated with this key. May also return a Promise which will be resolved before
 *          attaching to the context object.
 *
 * @public
 */

/**
 * A function that accepts a context object and an optional number of additional arguments. Used for the generic types
 * in {@link IContextContainer}
 *
 * @public
 */

/**
 * Extracts the type of the first argument of a {@link HandlerFunction} to represent the type of the context.
 *
 * @public
 */

/**
 * Extracts the types of the additional arguments of a {@link HandlerFunction}, excluding the
 * {@link HandlerContextType}.
 *
 * @public
 */

/**
 * An object that handles registration of context providers and configuring handlers with context.
 *
 * @remarks
 * A {@link IContextContainer} can be used by any Core service or plugin (known as the "service owner") which wishes to
 * expose APIs in a handler function. The container object will manage registering context providers and configuring a
 * handler with all of the contexts that should be exposed to the handler's plugin. This is dependent on the
 * dependencies that the handler's plugin declares.
 *
 * Contexts providers are executed in the order they were registered. Each provider gets access to context values
 * provided by any plugins that it depends on.
 *
 * In order to configure a handler with context, you must call the {@link IContextContainer.createHandler} function and
 * use the returned handler which will automatically build a context object when called.
 *
 * When registering context or creating handlers, the _calling plugin's opaque id_ must be provided. This id is passed
 * in via the plugin's initializer and can be accessed from the {@link PluginInitializerContext.opaqueId} Note this
 * should NOT be the context service owner's id, but the plugin that is actually registering the context or handler.
 *
 * ```ts
 * // Correct
 * class MyPlugin {
 *   private readonly handlers = new Map();
 *
 *   setup(core) {
 *     this.contextContainer = core.context.createContextContainer();
 *     return {
 *       registerContext(pluginOpaqueId, contextName, provider) {
 *         this.contextContainer.registerContext(pluginOpaqueId, contextName, provider);
 *       },
 *       registerRoute(pluginOpaqueId, path, handler) {
 *         this.handlers.set(
 *           path,
 *           this.contextContainer.createHandler(pluginOpaqueId, handler)
 *         );
 *       }
 *     }
 *   }
 * }
 *
 * // Incorrect
 * class MyPlugin {
 *   private readonly handlers = new Map();
 *
 *   constructor(private readonly initContext: PluginInitializerContext) {}
 *
 *   setup(core) {
 *     this.contextContainer = core.context.createContextContainer();
 *     return {
 *       registerContext(contextName, provider) {
 *         // BUG!
 *         // This would leak this context to all handlers rather that only plugins that depend on the calling plugin.
 *         this.contextContainer.registerContext(this.initContext.opaqueId, contextName, provider);
 *       },
 *       registerRoute(path, handler) {
 *         this.handlers.set(
 *           path,
 *           // BUG!
 *           // This handler will not receive any contexts provided by other dependencies of the calling plugin.
 *           this.contextContainer.createHandler(this.initContext.opaqueId, handler)
 *         );
 *       }
 *     }
 *   }
 * }
 * ```
 *
 * @typeParam THandler - the type of {@link HandlerFunction} this container should manage. The first argument of this
 *                       function will be used as the context type.
 *
 * @public
 */

/** @internal */
class ContextContainer {
  /**
   * @param pluginDependencies - A map of plugins to an array of their dependencies.
   */
  constructor(pluginDependencies, coreId) {
    this.pluginDependencies = pluginDependencies;
    this.coreId = coreId;
    /**
     * Used to map contexts to their providers and associated plugin. In registration order which is tightly coupled to
     * plugin load order.
     */
    _defineProperty(this, "contextProviders", new Map());
    /** Used to keep track of which plugins registered which contexts for dependency resolution. */
    _defineProperty(this, "contextNamesBySource", void 0);
    _defineProperty(this, "registerContext", (source, contextName, provider) => {
      if (this.contextProviders.has(contextName)) {
        throw new Error(`Context provider for ${contextName} has already been registered.`);
      }
      if (source !== this.coreId && !this.pluginDependencies.has(source)) {
        throw new Error(`Cannot register context for unknown plugin: ${source.toString()}`);
      }
      this.contextProviders.set(contextName, {
        provider,
        source
      });
      this.contextNamesBySource.set(source, [...(this.contextNamesBySource.get(source) || []), contextName]);
      return this;
    });
    _defineProperty(this, "createHandler", (source, handler) => {
      if (source !== this.coreId && !this.pluginDependencies.has(source)) {
        throw new Error(`Cannot create handler for unknown plugin: ${source.toString()}`);
      }
      return async (...args) => {
        const context = await this.buildContext(source, ...args);
        return handler(context, ...args);
      };
    });
    this.contextNamesBySource = new Map([[coreId, []]]);
  }
  async buildContext(source, ...contextArgs) {
    const contextsToBuild = new Set(this.getContextNamesForSource(source));
    return [...this.contextProviders].sort(sortByCoreFirst(this.coreId)).filter(([contextName]) => contextsToBuild.has(contextName)).reduce(async (contextPromise, [contextName, {
      provider,
      source: providerSource
    }]) => {
      const resolvedContext = await contextPromise;

      // For the next provider, only expose the context available based on the dependencies of the plugin that
      // registered that provider.
      const exposedContext = (0, _std.pick)(resolvedContext, [...this.getContextNamesForSource(providerSource)]);
      return {
        ...resolvedContext,
        [contextName]: await provider(exposedContext, ...contextArgs)
      };
    }, Promise.resolve({}));
  }
  getContextNamesForSource(source) {
    if (source === this.coreId) {
      return this.getContextNamesForCore();
    } else {
      return this.getContextNamesForPluginId(source);
    }
  }
  getContextNamesForCore() {
    return new Set(this.contextNamesBySource.get(this.coreId));
  }
  getContextNamesForPluginId(pluginId) {
    // If the source is a plugin...
    const pluginDeps = this.pluginDependencies.get(pluginId);
    if (!pluginDeps) {
      // This case should never be hit, but let's be safe.
      throw new Error(`Cannot create context for unknown plugin: ${pluginId.toString()}`);
    }
    return new Set([
    // Core contexts
    ...this.contextNamesBySource.get(this.coreId),
    // Contexts source created
    ...(this.contextNamesBySource.get(pluginId) || []),
    // Contexts sources's dependencies created
    ...(0, _lodash.flatten)(pluginDeps.map(p => this.contextNamesBySource.get(p) || []))]);
  }
}

/** Sorts context provider pairs by core pairs first. */
exports.ContextContainer = ContextContainer;
const sortByCoreFirst = coreId => ([leftName, leftProvider], [rightName, rightProvider]) => {
  if (leftProvider.source === coreId) {
    return rightProvider.source === coreId ? 0 : -1;
  } else {
    return rightProvider.source === coreId ? 1 : 0;
  }
};