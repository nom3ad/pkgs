"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AggsService = void 0;
var _lodash = require("lodash");
var _common = require("../../../common");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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

/** @internal */

/**
 * The aggs service provides a means of modeling and manipulating the various
 * OpenSearch aggregations supported by OpenSearch Dashboards, providing the ability to
 * output the correct DSL when you are ready to send your request to OpenSearch.
 */
class AggsService {
  constructor() {
    _defineProperty(this, "aggsCommonService", new _common.AggsCommonService());
    /**
     * getForceNow uses window.location on the client, so we must have a
     * separate implementation of calculateBounds on the server.
     */
    _defineProperty(this, "calculateBounds", timeRange => (0, _common.calculateBounds)(timeRange, {}));
  }
  setup({
    registerFunction
  }) {
    return this.aggsCommonService.setup({
      registerFunction
    });
  }
  start({
    fieldFormats,
    uiSettings
  }) {
    return {
      asScopedToClient: async savedObjectsClient => {
        const uiSettingsClient = uiSettings.asScopedToClient(savedObjectsClient);
        const formats = await fieldFormats.fieldFormatServiceFactory(uiSettingsClient);

        // cache ui settings, only including items which are explicitly needed by aggs
        const uiSettingsCache = (0, _lodash.pick)(await uiSettingsClient.getAll(), _common.aggsRequiredUiSettings);
        const getConfig = key => {
          return uiSettingsCache[key];
        };
        const {
          calculateAutoTimeExpression,
          types
        } = this.aggsCommonService.start({
          getConfig,
          uiSettings: uiSettingsClient
        });
        const aggTypesDependencies = {
          calculateBounds: this.calculateBounds,
          getConfig,
          getFieldFormatsStart: () => ({
            deserialize: formats.deserialize,
            getDefaultInstance: formats.getDefaultInstance
          }),
          /**
           * Date histogram and date range need to know whether we are using the
           * default timezone, but `isDefault` is not currently offered on the
           * server, so we need to manually check for the default value.
           */
          isDefaultTimezone: () => getConfig('dateFormat:tz') === 'Browser'
        };
        const typesRegistry = {
          get: name => {
            const type = types.get(name);
            if (!type) {
              return;
            }
            return type(aggTypesDependencies);
          },
          getAll: () => {
            return {
              // initialize each agg type on the fly
              buckets: types.getAll().buckets.map(type => type(aggTypesDependencies)),
              metrics: types.getAll().metrics.map(type => type(aggTypesDependencies))
            };
          }
        };
        return {
          calculateAutoTimeExpression,
          createAggConfigs: (indexPattern, configStates = [], schemas) => {
            return new _common.AggConfigs(indexPattern, configStates, {
              typesRegistry
            });
          },
          types: typesRegistry
        };
      }
    };
  }
  stop() {}
}
exports.AggsService = AggsService;