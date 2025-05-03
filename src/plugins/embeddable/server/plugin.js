"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmbeddableServerPlugin = void 0;
var _lodash = require("lodash");
var _migrate_base_input = require("../common/lib/migrate_base_input");
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
class EmbeddableServerPlugin {
  constructor() {
    _defineProperty(this, "embeddableFactories", new Map());
    _defineProperty(this, "enhancements", new Map());
    _defineProperty(this, "telemetry", (state, telemetryData = {}) => {
      const enhancements = state.enhancements || {};
      const factory = this.getEmbeddableFactory(state.id);
      let telemetry = (0, _migrate_base_input.telemetryBaseEmbeddableInput)(state, telemetryData);
      if (factory) {
        telemetry = factory.telemetry(state, telemetry);
      }
      Object.keys(enhancements).map(key => {
        if (!enhancements[key]) return;
        telemetry = this.getEnhancement(key).telemetry(enhancements[key], telemetry);
      });
      return telemetry;
    });
    _defineProperty(this, "extract", state => {
      const enhancements = state.enhancements || {};
      const factory = this.getEmbeddableFactory(state.id);
      const baseResponse = (0, _migrate_base_input.extractBaseEmbeddableInput)(state);
      let updatedInput = baseResponse.state;
      const refs = baseResponse.references;
      if (factory) {
        const factoryResponse = factory.extract(state);
        updatedInput = factoryResponse.state;
        refs.push(...factoryResponse.references);
      }
      updatedInput.enhancements = {};
      Object.keys(enhancements).forEach(key => {
        if (!enhancements[key]) return;
        const enhancementResult = this.getEnhancement(key).extract(enhancements[key]);
        refs.push(...enhancementResult.references);
        updatedInput.enhancements[key] = enhancementResult.state;
      });
      return {
        state: updatedInput,
        references: refs
      };
    });
    _defineProperty(this, "inject", (state, references) => {
      const enhancements = state.enhancements || {};
      const factory = this.getEmbeddableFactory(state.id);
      let updatedInput = (0, _migrate_base_input.injectBaseEmbeddableInput)(state, references);
      if (factory) {
        updatedInput = factory.inject(updatedInput, references);
      }
      updatedInput.enhancements = {};
      Object.keys(enhancements).forEach(key => {
        if (!enhancements[key]) return;
        updatedInput.enhancements[key] = this.getEnhancement(key).inject(enhancements[key], references);
      });
      return updatedInput;
    });
    _defineProperty(this, "registerEnhancement", enhancement => {
      if (this.enhancements.has(enhancement.id)) {
        throw new Error(`enhancement with id ${enhancement.id} already exists in the registry`);
      }
      this.enhancements.set(enhancement.id, {
        id: enhancement.id,
        telemetry: enhancement.telemetry || (() => ({})),
        inject: enhancement.inject || _lodash.identity,
        extract: enhancement.extract || (state => {
          return {
            state,
            references: []
          };
        })
      });
    });
    _defineProperty(this, "getEnhancement", id => {
      return this.enhancements.get(id) || {
        id: 'unknown',
        telemetry: () => ({}),
        inject: _lodash.identity,
        extract: state => {
          return {
            state,
            references: []
          };
        }
      };
    });
    _defineProperty(this, "registerEmbeddableFactory", factory => {
      if (this.embeddableFactories.has(factory.id)) {
        throw new Error(`Embeddable factory [embeddableFactoryId = ${factory.id}] already registered in Embeddables API.`);
      }
      this.embeddableFactories.set(factory.id, {
        id: factory.id,
        telemetry: factory.telemetry || (() => ({})),
        inject: factory.inject || _lodash.identity,
        extract: factory.extract || (state => ({
          state,
          references: []
        }))
      });
    });
    _defineProperty(this, "getEmbeddableFactory", embeddableFactoryId => {
      return this.embeddableFactories.get(embeddableFactoryId) || {
        id: 'unknown',
        telemetry: () => ({}),
        inject: state => state,
        extract: state => {
          return {
            state,
            references: []
          };
        }
      };
    });
  }
  setup(core) {
    return {
      registerEmbeddableFactory: this.registerEmbeddableFactory,
      registerEnhancement: this.registerEnhancement
    };
  }
  start(core) {
    return {
      telemetry: this.telemetry,
      extract: this.extract,
      inject: this.inject
    };
  }
  stop() {}
}
exports.EmbeddableServerPlugin = EmbeddableServerPlugin;