"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CapabilitiesService = void 0;
var _merge_capabilities = require("./merge_capabilities");
var _resolve_capabilities = require("./resolve_capabilities");
var _routes = require("./routes");
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
 * APIs to manage the {@link Capabilities} that will be used by the application.
 *
 * Plugins relying on capabilities to toggle some of their features should register them during the setup phase
 * using the `registerProvider` method.
 *
 * Plugins having the responsibility to restrict capabilities depending on a given context should register
 * their capabilities switcher using the `registerSwitcher` method.
 *
 * Refers to the methods documentation for complete description and examples.
 *
 * @public
 */

/**
 * APIs to access the application {@link Capabilities}.
 *
 * @public
 */

const defaultCapabilities = {
  navLinks: {},
  management: {},
  catalogue: {},
  workspaces: {}
};

/** @internal */
class CapabilitiesService {
  constructor(core) {
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "capabilitiesProviders", []);
    _defineProperty(this, "capabilitiesSwitchers", []);
    _defineProperty(this, "resolveCapabilities", void 0);
    this.logger = core.logger.get('capabilities-service');
    this.resolveCapabilities = (0, _resolve_capabilities.getCapabilitiesResolver)(() => (0, _merge_capabilities.mergeCapabilities)(defaultCapabilities, ...this.capabilitiesProviders.map(provider => provider())), () => this.capabilitiesSwitchers);
  }
  setup(setupDeps) {
    this.logger.debug('Setting up capabilities service');
    (0, _routes.registerRoutes)(setupDeps.http, this.resolveCapabilities);
    return {
      registerProvider: provider => {
        this.capabilitiesProviders.push(provider);
      },
      registerSwitcher: switcher => {
        this.capabilitiesSwitchers.push(switcher);
      }
    };
  }
  start() {
    return {
      resolveCapabilities: request => this.resolveCapabilities(request, [])
    };
  }
}
exports.CapabilitiesService = CapabilitiesService;