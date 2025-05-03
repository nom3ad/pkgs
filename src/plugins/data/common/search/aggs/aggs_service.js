"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.aggsRequiredUiSettings = exports.AggsCommonService = void 0;
var _common = require("../../../common");
var _ = require("./");
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
 */ // eslint-disable-next-line @osd/eslint/no-restricted-paths
/** @internal */
const aggsRequiredUiSettings = exports.aggsRequiredUiSettings = ['dateFormat', 'dateFormat:scaled', 'dateFormat:tz', _common.UI_SETTINGS.HISTOGRAM_BAR_TARGET, _common.UI_SETTINGS.HISTOGRAM_MAX_BARS, _common.UI_SETTINGS.SEARCH_QUERY_LANGUAGE, _common.UI_SETTINGS.QUERY_ALLOW_LEADING_WILDCARDS, _common.UI_SETTINGS.QUERY_STRING_OPTIONS, _common.UI_SETTINGS.COURIER_IGNORE_FILTER_IF_FIELD_NOT_IN_INDEX];

/** @internal */

/** @internal */

/**
 * The aggs service provides a means of modeling and manipulating the various
 * OpenSearch aggregations supported by OpenSearch Dashboards, providing the ability to
 * output the correct DSL when you are ready to send your request to OpenSearch.
 */
class AggsCommonService {
  constructor() {
    _defineProperty(this, "aggTypesRegistry", new _.AggTypesRegistry());
  }
  setup({
    registerFunction
  }) {
    const aggTypesSetup = this.aggTypesRegistry.setup();

    // register each agg type
    const aggTypes = (0, _.getAggTypes)();
    aggTypes.buckets.forEach(({
      name,
      fn
    }) => aggTypesSetup.registerBucket(name, fn));
    aggTypes.metrics.forEach(({
      name,
      fn
    }) => aggTypesSetup.registerMetric(name, fn));

    // register expression functions for each agg type
    const aggFunctions = (0, _.getAggTypesFunctions)();
    aggFunctions.forEach(fn => registerFunction(fn));
    return {
      types: aggTypesSetup
    };
  }
  start({
    getConfig,
    uiSettings
  }) {
    const aggTypesStart = this.aggTypesRegistry.start({
      uiSettings
    });
    return {
      calculateAutoTimeExpression: (0, _.getCalculateAutoTimeExpression)(getConfig),
      createAggConfigs: (indexPattern, configStates = [], schemas) => {
        return new _.AggConfigs(indexPattern, configStates, {
          typesRegistry: aggTypesStart
        });
      },
      types: aggTypesStart
    };
  }
}
exports.AggsCommonService = AggsCommonService;