"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TelemetryCollectionManagerPlugin = void 0;
var _util = require("./util");
var _encryption = require("./encryption");
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
class TelemetryCollectionManagerPlugin {
  constructor(initializerContext) {
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "collections", []);
    _defineProperty(this, "usageGetterMethodPriority", -1);
    _defineProperty(this, "usageCollection", void 0);
    _defineProperty(this, "isDistributable", void 0);
    _defineProperty(this, "version", void 0);
    _defineProperty(this, "areAllCollectorsReady", async () => {
      var _this$usageCollection;
      return await ((_this$usageCollection = this.usageCollection) === null || _this$usageCollection === void 0 ? void 0 : _this$usageCollection.areAllCollectorsReady());
    });
    _defineProperty(this, "getOptInStatsForCollection", async (collection, optInStatus, statsCollectionConfig) => {
      const context = {
        logger: this.logger.get(collection.title),
        version: this.version,
        ...collection.customContext
      };
      const clustersDetails = await collection.clusterDetailsGetter(statsCollectionConfig, context);
      return clustersDetails.map(({
        clusterUuid
      }) => ({
        cluster_uuid: clusterUuid,
        opt_in_status: optInStatus
      }));
    });
    this.logger = initializerContext.logger.get();
    this.isDistributable = initializerContext.env.packageInfo.dist;
    this.version = initializerContext.env.packageInfo.version;
  }
  setup(core, {
    usageCollection
  }) {
    this.usageCollection = usageCollection;
    return {
      setCollection: this.setCollection.bind(this),
      getOptInStats: this.getOptInStats.bind(this),
      getStats: this.getStats.bind(this),
      areAllCollectorsReady: this.areAllCollectorsReady.bind(this)
    };
  }
  start(core) {
    return {
      setCollection: this.setCollection.bind(this),
      getOptInStats: this.getOptInStats.bind(this),
      getStats: this.getStats.bind(this),
      areAllCollectorsReady: this.areAllCollectorsReady.bind(this)
    };
  }
  stop() {}
  setCollection(collectionConfig) {
    const {
      title,
      priority,
      opensearchCluster,
      opensearchClientGetter,
      statsGetter,
      clusterDetailsGetter,
      licenseGetter
    } = collectionConfig;
    if (typeof priority !== 'number') {
      throw new Error('priority must be set.');
    }
    if (priority === this.usageGetterMethodPriority) {
      throw new Error(`A Usage Getter with the same priority is already set.`);
    }
    if (priority > this.usageGetterMethodPriority) {
      if (!statsGetter) {
        throw Error('Stats getter method not set.');
      }
      if (!opensearchCluster) {
        throw Error('opensearchCluster name must be set for the getCluster method.');
      }
      if (!opensearchClientGetter) {
        throw Error('opensearchClientGetter method not set.');
      }
      if (!clusterDetailsGetter) {
        throw Error('Cluster UUIds method is not set.');
      }
      if (!licenseGetter) {
        throw Error('License getter method not set.');
      }
      this.collections.unshift({
        licenseGetter,
        statsGetter,
        clusterDetailsGetter,
        opensearchCluster,
        title,
        opensearchClientGetter
      });
      this.usageGetterMethodPriority = priority;
    }
  }
  getStatsCollectionConfig(config, collection, collectionOpenSearchClient, usageCollection) {
    const {
      start,
      end,
      request
    } = config;
    const callCluster = config.unencrypted ? collection.opensearchCluster.asScoped(request).callAsCurrentUser : collection.opensearchCluster.callAsInternalUser;
    // Scope the new OpenSearch Client appropriately and pass to the stats collection config
    const opensearchClient = config.unencrypted ? collectionOpenSearchClient.asScoped(config.request).asCurrentUser : collectionOpenSearchClient.asInternalUser;
    return {
      callCluster,
      start,
      end,
      usageCollection,
      opensearchClient
    };
  }
  async getOptInStats(optInStatus, config) {
    if (!this.usageCollection) {
      return [];
    }
    for (const collection of this.collections) {
      // first fetch the client and make sure it's not undefined.
      const collectionOpenSearchClient = collection.opensearchClientGetter();
      if (collectionOpenSearchClient !== undefined) {
        const statsCollectionConfig = this.getStatsCollectionConfig(config, collection, collectionOpenSearchClient, this.usageCollection);
        try {
          const optInStats = await this.getOptInStatsForCollection(collection, optInStatus, statsCollectionConfig);
          if (optInStats && optInStats.length) {
            this.logger.debug(`Got Opt In stats using ${collection.title} collection.`);
            if (config.unencrypted) {
              return optInStats;
            }
            return (0, _encryption.encryptTelemetry)(optInStats, {
              useProdKey: this.isDistributable
            });
          }
        } catch (err) {
          this.logger.debug(`Failed to collect any opt in stats with registered collections.`);
          // swallow error to try next collection;
        }
      }
    }

    return [];
  }
  async getStats(config) {
    if (!this.usageCollection) {
      return [];
    }
    for (const collection of this.collections) {
      const collectionOpenSearchClient = collection.opensearchClientGetter();
      if (collectionOpenSearchClient !== undefined) {
        const statsCollectionConfig = this.getStatsCollectionConfig(config, collection, collectionOpenSearchClient, this.usageCollection);
        try {
          const usageData = await this.getUsageForCollection(collection, statsCollectionConfig);
          if (usageData.length) {
            this.logger.debug(`Got Usage using ${collection.title} collection.`);
            if (config.unencrypted) {
              return usageData;
            }
            return (0, _encryption.encryptTelemetry)(usageData.filter(_util.isClusterOptedIn), {
              useProdKey: this.isDistributable
            });
          }
        } catch (err) {
          this.logger.debug(`Failed to collect any usage with registered collection ${collection.title}.`);
          // swallow error to try next collection;
        }
      }
    }

    return [];
  }
  async getUsageForCollection(collection, statsCollectionConfig) {
    const context = {
      logger: this.logger.get(collection.title),
      version: this.version,
      ...collection.customContext
    };
    const clustersDetails = await collection.clusterDetailsGetter(statsCollectionConfig, context);
    if (clustersDetails.length === 0) {
      // don't bother doing a further lookup, try next collection.
      return [];
    }
    const [stats, licenses] = await Promise.all([collection.statsGetter(clustersDetails, statsCollectionConfig, context), collection.licenseGetter(clustersDetails, statsCollectionConfig, context)]);
    return stats.map(stat => {
      const license = licenses[stat.cluster_uuid];
      return {
        ...(license ? {
          license
        } : {}),
        ...stat,
        collectionSource: collection.title
      };
    });
  }
}
exports.TelemetryCollectionManagerPlugin = TelemetryCollectionManagerPlugin;