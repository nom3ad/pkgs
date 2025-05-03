"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenSearchLegacyConfigService = void 0;
var _operators = require("rxjs/operators");
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
class OpenSearchLegacyConfigService {
  constructor() {
    /**
     * The OpenSearch config value at a given point in time.
     */
    _defineProperty(this, "config", void 0);
    /**
     * An observable that emits OpenSearch config.
     */
    _defineProperty(this, "config$", void 0);
    /**
     * A reference to the subscription to the OpenSearch observable
     */
    _defineProperty(this, "configSub", void 0);
  }
  setup(config$) {
    this.config$ = config$;
    this.configSub = this.config$.subscribe(config => {
      this.config = config;
    });
  }
  stop() {
    if (this.configSub) {
      this.configSub.unsubscribe();
    }
  }
  async readConfig() {
    if (!this.config$) {
      throw new Error('Could not read OpenSearch config, this service has not been setup!');
    }
    if (!this.config) {
      return this.config$.pipe((0, _operators.first)()).toPromise();
    }
    return this.config;
  }
}
exports.OpenSearchLegacyConfigService = OpenSearchLegacyConfigService;