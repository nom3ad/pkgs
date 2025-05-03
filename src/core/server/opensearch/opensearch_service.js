"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenSearchService = void 0;
var _rxjs = require("rxjs");
var _operators = require("rxjs/operators");
var _std = require("@osd/std");
var _legacy = require("./legacy");
var _client = require("./client");
var _opensearch_config = require("./opensearch_config");
var _ensure_opensearch_version = require("./version_check/ensure_opensearch_version");
var _status = require("./status");
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
/** @internal */
class OpenSearchService {
  constructor(coreContext) {
    this.coreContext = coreContext;
    _defineProperty(this, "log", void 0);
    _defineProperty(this, "config$", void 0);
    _defineProperty(this, "auditorFactory", void 0);
    _defineProperty(this, "stop$", new _rxjs.Subject());
    _defineProperty(this, "opensearchDashboardsVersion", void 0);
    _defineProperty(this, "getAuthHeaders", void 0);
    _defineProperty(this, "createLegacyCustomClient", void 0);
    _defineProperty(this, "legacyClient", void 0);
    _defineProperty(this, "client", void 0);
    _defineProperty(this, "getAuditorFactory", () => {
      if (!this.auditorFactory) {
        throw new Error('auditTrail has not been initialized');
      }
      return this.auditorFactory;
    });
    this.opensearchDashboardsVersion = coreContext.env.packageInfo.version;
    this.log = coreContext.logger.get('opensearch-service');
    this.config$ = coreContext.configService.atPath('opensearch').pipe((0, _operators.map)(rawConfig => new _opensearch_config.OpenSearchConfig(rawConfig)));
  }
  async setup(deps) {
    this.log.debug('Setting up opensearch service');
    const config = await this.config$.pipe((0, _operators.first)()).toPromise();
    this.getAuthHeaders = deps.http.getAuthHeaders;
    this.legacyClient = this.createLegacyClusterClient('data', config);
    this.client = this.createClusterClient('data', config);
    let opensearchNodesCompatibility$;
    if (config.hosts.length > 0) {
      opensearchNodesCompatibility$ = (0, _ensure_opensearch_version.pollOpenSearchNodesVersion)({
        internalClient: this.client.asInternalUser,
        optimizedHealthcheck: config.optimizedHealthcheck,
        log: this.log,
        ignoreVersionMismatch: config.ignoreVersionMismatch,
        opensearchVersionCheckInterval: config.healthCheckDelay.asMilliseconds(),
        opensearchDashboardsVersion: this.opensearchDashboardsVersion
      }).pipe((0, _operators.takeUntil)(this.stop$), (0, _operators.shareReplay)({
        refCount: true,
        bufferSize: 1
      }));
    } else {
      this.log.debug(`Opensearch is not configured.`);
      opensearchNodesCompatibility$ = (0, _rxjs.of)({
        isCompatible: true,
        message: 'Opensearch is not configured',
        incompatibleNodes: [],
        warningNodes: [],
        opensearchDashboardsVersion: this.opensearchDashboardsVersion
      });
    }
    this.createLegacyCustomClient = (type, clientConfig = {}) => {
      const finalConfig = (0, _std.merge)({}, config, clientConfig);
      return this.createLegacyClusterClient(type, finalConfig);
    };
    return {
      legacy: {
        config$: this.config$,
        client: this.legacyClient,
        createClient: this.createLegacyCustomClient
      },
      opensearchNodesCompatibility$,
      status$: (0, _status.calculateStatus$)(opensearchNodesCompatibility$)
    };
  }
  async start({
    auditTrail
  }) {
    this.auditorFactory = auditTrail;
    if (!this.legacyClient || !this.createLegacyCustomClient) {
      throw new Error('OpenSearchService needs to be setup before calling start');
    }
    const config = await this.config$.pipe((0, _operators.first)()).toPromise();
    const createClient = (type, clientConfig = {}) => {
      const finalConfig = (0, _std.merge)({}, config, clientConfig);
      return this.createClusterClient(type, finalConfig);
    };
    return {
      client: this.client,
      createClient,
      legacy: {
        config$: this.config$,
        client: this.legacyClient,
        createClient: this.createLegacyCustomClient
      }
    };
  }
  async stop() {
    this.log.debug('Stopping opensearch service');
    this.stop$.next();
    if (this.client) {
      await this.client.close();
    }
    if (this.legacyClient) {
      this.legacyClient.close();
    }
  }
  createClusterClient(type, config) {
    return new _client.ClusterClient(config, this.coreContext.logger.get('opensearch', type), this.getAuthHeaders);
  }
  createLegacyClusterClient(type, config) {
    return new _legacy.LegacyClusterClient(config, this.coreContext.logger.get('opensearch', type), this.getAuditorFactory, this.getAuthHeaders);
  }
}
exports.OpenSearchService = OpenSearchService;