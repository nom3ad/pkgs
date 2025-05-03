"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SavedObjectsClientProvider = void 0;
var _priority_collection = require("./priority_collection");
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
 * Options passed to each SavedObjectRepositoryFactoryProvider to aid in creating the repository instance.
 * @public
 */

/**
 * Provider to invoke to a factory function for creating ISavedObjectRepository {@link ISavedObjectRepository} instances.
 * @public
 */

/**
 * Options passed to each SavedObjectsClientWrapperFactory to aid in creating the wrapper instance.
 * @public
 */

/**
 * Describes the factory used to create instances of Saved Objects Client Wrappers.
 * @public
 */

/**
 * Describes the factory used to create instances of the Saved Objects Client.
 * @public
 */

/**
 * Provider to invoke to retrieve a {@link SavedObjectsClientFactory}.
 * @public
 */

/**
 * Options to control the creation of the Saved Objects Client.
 * @public
 */

/**
 * @internal
 */

/**
 * Provider for the Scoped Saved Objects Client.
 *
 * @internal
 */
class SavedObjectsClientProvider {
  constructor({
    defaultClientFactory,
    typeRegistry
  }) {
    _defineProperty(this, "_wrapperFactories", new _priority_collection.PriorityCollection());
    _defineProperty(this, "_clientFactory", void 0);
    _defineProperty(this, "_originalClientFactory", void 0);
    _defineProperty(this, "_typeRegistry", void 0);
    this._originalClientFactory = this._clientFactory = defaultClientFactory;
    this._typeRegistry = typeRegistry;
  }
  addClientWrapperFactory(priority, id, factory) {
    if (this._wrapperFactories.has(entry => entry.id === id)) {
      throw new Error(`wrapper factory with id ${id} is already defined`);
    }
    this._wrapperFactories.add(priority, {
      id,
      factory
    });
  }
  setClientFactory(customClientFactory) {
    if (this._clientFactory !== this._originalClientFactory) {
      throw new Error(`custom client factory is already set, unable to replace the current one`);
    }
    this._clientFactory = customClientFactory;
  }
  getClient(request, {
    includedHiddenTypes,
    excludedWrappers = []
  } = {}) {
    const client = this._clientFactory({
      request,
      includedHiddenTypes
    });
    return this._wrapperFactories.toPrioritizedArray().reduceRight((clientToWrap, {
      id,
      factory
    }) => {
      if (excludedWrappers.includes(id)) {
        return clientToWrap;
      }
      return factory({
        request,
        client: clientToWrap,
        typeRegistry: this._typeRegistry
      });
    }, client);
  }
}
exports.SavedObjectsClientProvider = SavedObjectsClientProvider;