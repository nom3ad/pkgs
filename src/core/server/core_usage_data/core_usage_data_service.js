"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CoreUsageDataService = void 0;
var _rxjs = require("rxjs");
var _operators = require("rxjs/operators");
var _is_configured = require("./is_configured");
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
 * Because users can configure their Saved Object to any arbitrary index name,
 * we need to map customized index names back to a "standard" index name.
 *
 * e.g. If a user configures `opensearchDashboards.index: .my_saved_objects` we want to the
 * collected data to be grouped under `.kibana` not ".my_saved_objects".
 *
 * This is rather brittle, but the option to configure index names might go
 * away completely anyway (see #60053).
 *
 * @param index The index name configured for this SO type
 * @param opensearchDashboardsConfigIndex The default opensearch-dashboards index as configured by the user
 * with `opensearchDashboards.index`
 */
const opensearchDashboardsOrTaskManagerIndex = (index, opensearchDashboardsConfigIndex) => {
  return index === opensearchDashboardsConfigIndex ? '.kibana' : '.kibana_task_manager';
};
class CoreUsageDataService {
  constructor(core) {
    _defineProperty(this, "opensearchConfig", void 0);
    _defineProperty(this, "configService", void 0);
    _defineProperty(this, "httpConfig", void 0);
    _defineProperty(this, "loggingConfig", void 0);
    _defineProperty(this, "soConfig", void 0);
    _defineProperty(this, "stop$", void 0);
    _defineProperty(this, "opsMetrics", void 0);
    _defineProperty(this, "opensearchDashboardsConfig", void 0);
    this.configService = core.configService;
    this.stop$ = new _rxjs.Subject();
  }
  async getSavedObjectIndicesUsageData(savedObjects, opensearch) {
    const indices = await Promise.all(Array.from(savedObjects.getTypeRegistry().getAllTypes().reduce((acc, type) => {
      var _type$indexPattern;
      const index = (_type$indexPattern = type.indexPattern) !== null && _type$indexPattern !== void 0 ? _type$indexPattern : this.opensearchDashboardsConfig.index;
      return index != null ? acc.add(index) : acc;
    }, new Set()).values()).map(index => {
      // The _cat/indices API returns the _index_ and doesn't return a way
      // to map back from the index to the alias. So we have to make an API
      // call for every alias
      return opensearch.client.asInternalUser.cat.indices({
        index,
        format: 'JSON',
        bytes: 'b'
      }).then(({
        body
      }) => {
        const stats = body[0];
        return {
          alias: opensearchDashboardsOrTaskManagerIndex(index, this.opensearchDashboardsConfig.index),
          docsCount: stats['docs.count'] ? parseInt(stats['docs.count'], 10) : 0,
          docsDeleted: stats['docs.deleted'] ? parseInt(stats['docs.deleted'], 10) : 0,
          storeSizeBytes: stats['store.size'] ? parseInt(stats['store.size'], 10) : 0,
          primaryStoreSizeBytes: stats['pri.store.size'] ? parseInt(stats['pri.store.size'], 10) : 0
        };
      });
    }));
    return {
      indices
    };
  }
  async getCoreUsageData(savedObjects, opensearch) {
    var _this$loggingConfig$a, _this$loggingConfig, _this$loggingConfig$l, _this$loggingConfig2;
    if (this.opensearchConfig == null || this.httpConfig == null || this.soConfig == null || this.opsMetrics == null) {
      throw new Error('Unable to read config valuopensearch. Ensure that setup() has completed.');
    }
    const opensearchConfig = this.opensearchConfig;
    const soUsageData = await this.getSavedObjectIndicesUsageData(savedObjects, opensearch);
    const http = this.httpConfig;
    return {
      config: {
        opensearch: {
          apiVersion: opensearchConfig.apiVersion,
          sniffOnStart: opensearchConfig.sniffOnStart,
          sniffIntervalMs: opensearchConfig.sniffInterval !== false ? opensearchConfig.sniffInterval.asMilliseconds() : -1,
          sniffOnConnectionFault: opensearchConfig.sniffOnConnectionFault,
          numberOfHostsConfigured: Array.isArray(opensearchConfig.hosts) ? opensearchConfig.hosts.length : _is_configured.isConfigured.string(opensearchConfig.hosts) ? 1 : 0,
          customHeadersConfigured: _is_configured.isConfigured.record(opensearchConfig.customHeaders),
          healthCheckDelayMs: opensearchConfig.healthCheck.delay.asMilliseconds(),
          logQueries: opensearchConfig.logQueries,
          pingTimeoutMs: opensearchConfig.pingTimeout.asMilliseconds(),
          requestHeadersWhitelistConfigured: _is_configured.isConfigured.stringOrArray(opensearchConfig.requestHeadersWhitelist, ['authorization']),
          requestTimeoutMs: opensearchConfig.requestTimeout.asMilliseconds(),
          shardTimeoutMs: opensearchConfig.shardTimeout.asMilliseconds(),
          ssl: {
            alwaysPresentCertificate: opensearchConfig.ssl.alwaysPresentCertificate,
            certificateAuthoritiesConfigured: _is_configured.isConfigured.stringOrArray(opensearchConfig.ssl.certificateAuthorities),
            certificateConfigured: _is_configured.isConfigured.string(opensearchConfig.ssl.certificate),
            keyConfigured: _is_configured.isConfigured.string(opensearchConfig.ssl.key),
            verificationMode: opensearchConfig.ssl.verificationMode,
            truststoreConfigured: _is_configured.isConfigured.record(opensearchConfig.ssl.truststore),
            keystoreConfigured: _is_configured.isConfigured.record(opensearchConfig.ssl.keystore)
          }
        },
        http: {
          basePathConfigured: _is_configured.isConfigured.string(http.basePath),
          maxPayloadInBytes: http.maxPayload.getValueInBytes(),
          rewriteBasePath: http.rewriteBasePath,
          keepaliveTimeout: http.keepaliveTimeout,
          socketTimeout: http.socketTimeout,
          compression: {
            enabled: http.compression.enabled,
            referrerWhitelistConfigured: _is_configured.isConfigured.array(http.compression.referrerWhitelist)
          },
          xsrf: {
            disableProtection: http.xsrf.disableProtection,
            whitelistConfigured: _is_configured.isConfigured.array(http.xsrf.whitelist)
          },
          requestId: {
            allowFromAnyIp: http.requestId.allowFromAnyIp,
            ipAllowlistConfigured: _is_configured.isConfigured.array(http.requestId.ipAllowlist)
          },
          ssl: {
            certificateAuthoritiesConfigured: _is_configured.isConfigured.stringOrArray(http.ssl.certificateAuthorities),
            certificateConfigured: _is_configured.isConfigured.string(http.ssl.certificate),
            cipherSuites: http.ssl.cipherSuites,
            keyConfigured: _is_configured.isConfigured.string(http.ssl.key),
            redirectHttpFromPortConfigured: _is_configured.isConfigured.number(http.ssl.redirectHttpFromPort),
            supportedProtocols: http.ssl.supportedProtocols,
            clientAuthentication: http.ssl.clientAuthentication,
            keystoreConfigured: _is_configured.isConfigured.record(http.ssl.keystore),
            truststoreConfigured: _is_configured.isConfigured.record(http.ssl.truststore)
          }
        },
        logging: {
          appendersTypesUsed: Array.from(Array.from((_this$loggingConfig$a = (_this$loggingConfig = this.loggingConfig) === null || _this$loggingConfig === void 0 ? void 0 : _this$loggingConfig.appenders.values()) !== null && _this$loggingConfig$a !== void 0 ? _this$loggingConfig$a : []).reduce((acc, a) => acc.add(a.kind), new Set()).values()),
          loggersConfiguredCount: (_this$loggingConfig$l = (_this$loggingConfig2 = this.loggingConfig) === null || _this$loggingConfig2 === void 0 ? void 0 : _this$loggingConfig2.loggers.length) !== null && _this$loggingConfig$l !== void 0 ? _this$loggingConfig$l : 0
        },
        savedObjects: {
          maxImportPayloadBytes: this.soConfig.maxImportPayloadBytes.getValueInBytes(),
          maxImportExportSizeBytes: this.soConfig.maxImportExportSize.getValueInBytes()
        }
      },
      environment: {
        memory: {
          heapSizeLimit: this.opsMetrics.process.memory.heap.size_limit,
          heapTotalBytes: this.opsMetrics.process.memory.heap.total_in_bytes,
          heapUsedBytes: this.opsMetrics.process.memory.heap.used_in_bytes
        }
      },
      services: {
        savedObjects: soUsageData
      }
    };
  }
  setup({
    metrics
  }) {
    metrics.getOpsMetrics$().pipe((0, _operators.takeUntil)(this.stop$)).subscribe(opsMetrics => this.opsMetrics = opsMetrics);
    this.configService.atPath('opensearch').pipe((0, _operators.takeUntil)(this.stop$)).subscribe(config => {
      this.opensearchConfig = config;
    });
    this.configService.atPath('server').pipe((0, _operators.takeUntil)(this.stop$)).subscribe(config => {
      this.httpConfig = config;
    });
    this.configService.atPath('logging').pipe((0, _operators.takeUntil)(this.stop$)).subscribe(config => {
      this.loggingConfig = config;
    });
    this.configService.atPath('savedObjects').pipe((0, _operators.takeUntil)(this.stop$)).subscribe(config => {
      this.soConfig = config;
    });
    this.configService.atPath('opensearchDashboards').pipe((0, _operators.takeUntil)(this.stop$)).subscribe(config => {
      this.opensearchDashboardsConfig = config;
    });
  }
  start({
    savedObjects,
    opensearch
  }) {
    return {
      getCoreUsageData: () => {
        return this.getCoreUsageData(savedObjects, opensearch);
      }
    };
  }
  stop() {
    this.stop$.next();
    this.stop$.complete();
  }
}
exports.CoreUsageDataService = CoreUsageDataService;