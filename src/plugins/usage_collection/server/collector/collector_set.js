"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CollectorSet = void 0;
var _lodash = require("lodash");
var _collector = require("./collector");
var _usage_collector = require("./usage_collector");
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
class CollectorSet {
  constructor({
    logger,
    maximumWaitTimeForAllCollectorsInS,
    collectors: _collectors = []
  }) {
    _defineProperty(this, "_waitingForAllCollectorsTimestamp", void 0);
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "maximumWaitTimeForAllCollectorsInS", void 0);
    _defineProperty(this, "collectors", void 0);
    _defineProperty(this, "makeStatsCollector", options => {
      return new _collector.Collector(this.logger, options);
    });
    _defineProperty(this, "makeUsageCollector", options => {
      return new _usage_collector.UsageCollector(this.logger, options);
    });
    /*
     * @param collector {Collector} collector object
     */
    _defineProperty(this, "registerCollector", collector => {
      // check instanceof
      if (!(collector instanceof _collector.Collector)) {
        throw new Error('CollectorSet can only have Collector instances registered');
      }
      if (this.collectors.get(collector.type)) {
        throw new Error(`Usage collector's type "${collector.type}" is duplicated.`);
      }
      this.collectors.set(collector.type, collector);
      if (collector.init) {
        this.logger.debug(`Initializing ${collector.type} collector`);
        collector.init();
      }
    });
    _defineProperty(this, "getCollectorByType", type => {
      return [...this.collectors.values()].find(c => c.type === type);
    });
    _defineProperty(this, "isUsageCollector", x => {
      return x instanceof _usage_collector.UsageCollector;
    });
    _defineProperty(this, "areAllCollectorsReady", async (collectorSet = this) => {
      if (!(collectorSet instanceof CollectorSet)) {
        throw new Error(`areAllCollectorsReady method given bad collectorSet parameter: ` + typeof collectorSet);
      }
      const collectors = [...collectorSet.collectors.values()];
      const collectorsWithStatus = await Promise.all(collectors.map(async collector => {
        return {
          isReady: await collector.isReady(),
          collector
        };
      }));
      const collectorsTypesNotReady = collectorsWithStatus.filter(collectorWithStatus => collectorWithStatus.isReady === false).map(collectorWithStatus => collectorWithStatus.collector.type);
      const allReady = collectorsTypesNotReady.length === 0;
      if (!allReady && this.maximumWaitTimeForAllCollectorsInS >= 0) {
        const nowTimestamp = +new Date();
        this._waitingForAllCollectorsTimestamp = this._waitingForAllCollectorsTimestamp || nowTimestamp;
        const timeWaitedInMS = nowTimestamp - this._waitingForAllCollectorsTimestamp;
        const timeLeftInMS = this.maximumWaitTimeForAllCollectorsInS * 1000 - timeWaitedInMS;
        if (timeLeftInMS <= 0) {
          this.logger.debug(`All collectors are not ready (waiting for ${collectorsTypesNotReady.join(',')}) ` + `but we have waited the required ` + `${this.maximumWaitTimeForAllCollectorsInS}s and will return data from all collectors that are ready.`);
          return true;
        } else {
          this.logger.debug(`All collectors are not ready. Waiting for ${timeLeftInMS}ms longer.`);
        }
      } else {
        this._waitingForAllCollectorsTimestamp = undefined;
      }
      return allReady;
    });
    // all collections eventually pass through bulkFetch.
    // the shape of the response is different when using the new OpenSearch client as is the error handling.
    // We'll handle the refactor for using the new client in a follow up PR.
    _defineProperty(this, "bulkFetch", async (callCluster, opensearchClient, collectors = this.collectors) => {
      const responses = await Promise.all([...collectors.values()].map(async collector => {
        this.logger.debug(`Fetching data from ${collector.type} collector`);
        try {
          return {
            type: collector.type,
            result: await collector.fetch(callCluster, opensearchClient) // each collector must ensure they handle the response appropriately.
          };
        } catch (err) {
          this.logger.warn(err);
          this.logger.warn(`Unable to fetch data from ${collector.type} collector`);
        }
      }));
      return responses.filter(response => typeof response !== 'undefined');
    });
    /*
     * @return {new CollectorSet}
     */
    _defineProperty(this, "getFilteredCollectorSet", filter => {
      const filtered = [...this.collectors.values()].filter(filter);
      return this.makeCollectorSetFromArray(filtered);
    });
    _defineProperty(this, "bulkFetchUsage", async (callCluster, opensearchClient) => {
      const usageCollectors = this.getFilteredCollectorSet(c => c instanceof _usage_collector.UsageCollector);
      return await this.bulkFetch(callCluster, opensearchClient, usageCollectors.collectors);
    });
    // convert an array of fetched stats results into key/object
    _defineProperty(this, "toObject", (statsData = []) => {
      return statsData.reduce((accumulatedStats, {
        type,
        result
      }) => {
        return {
          ...accumulatedStats,
          [type]: result
        };
      }, {});
    });
    // rename fields to use api conventions
    _defineProperty(this, "toApiFieldNames", apiData => {
      const getValueOrRecurse = value => {
        if (value == null || typeof value !== 'object') {
          return value;
        } else {
          return this.toApiFieldNames(value); // recurse
        }
      };

      // handle array and return early, or return a reduced object

      if (Array.isArray(apiData)) {
        return apiData.map(getValueOrRecurse);
      }
      return Object.keys(apiData).reduce((accum, field) => {
        const value = apiData[field];
        let newName = field;
        newName = (0, _lodash.snakeCase)(newName);
        newName = newName.replace(/^(1|5|15)_m/, '$1m'); // os.load.15m, os.load.5m, os.load.1m
        newName = newName.replace('_in_bytes', '_bytes');
        newName = newName.replace('_in_millis', '_ms');
        return {
          ...accum,
          [newName]: getValueOrRecurse(value)
        };
      }, {});
    });
    // TODO: remove
    _defineProperty(this, "map", mapFn => {
      return [...this.collectors.values()].map(mapFn);
    });
    // TODO: remove
    _defineProperty(this, "some", someFn => {
      return [...this.collectors.values()].some(someFn);
    });
    _defineProperty(this, "makeCollectorSetFromArray", collectors => {
      return new CollectorSet({
        logger: this.logger,
        maximumWaitTimeForAllCollectorsInS: this.maximumWaitTimeForAllCollectorsInS,
        collectors
      });
    });
    this.logger = logger;
    this.collectors = new Map(_collectors.map(collector => [collector.type, collector]));
    this.maximumWaitTimeForAllCollectorsInS = maximumWaitTimeForAllCollectorsInS || 60;
  }
}
exports.CollectorSet = CollectorSet;