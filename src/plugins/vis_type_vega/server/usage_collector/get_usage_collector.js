"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUsageCollector = getUsageCollector;
var _hjson = require("hjson");
var _operators = require("rxjs/operators");
/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
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

const VEGA_USAGE_TYPE = 'vis_type_vega';
function isVegaType(attributes) {
  var _attributes$params;
  return attributes && attributes.type === 'vega' && ((_attributes$params = attributes.params) === null || _attributes$params === void 0 ? void 0 : _attributes$params.spec);
}
const checkVegaSchemaType = (schemaURL, type) => schemaURL.includes(`//vega.github.io/schema/${type}/`);
const getDefaultVegaVisualizations = home => {
  var _home$sampleData$getS;
  const titles = [];
  const sampleDataSets = (_home$sampleData$getS = home === null || home === void 0 ? void 0 : home.sampleData.getSampleDatasets()) !== null && _home$sampleData$getS !== void 0 ? _home$sampleData$getS : [];
  sampleDataSets.forEach(sampleDataSet => sampleDataSet.savedObjects.forEach(savedObject => {
    try {
      if (savedObject.type === 'visualization') {
        var _savedObject$attribut;
        const visState = JSON.parse((_savedObject$attribut = savedObject.attributes) === null || _savedObject$attribut === void 0 ? void 0 : _savedObject$attribut.visState);
        if (isVegaType(visState)) {
          titles.push(visState.title);
        }
      }
    } catch (e) {
      // Let it go, visState is invalid and we'll don't need to handle it
    }
  }));
  return titles;
};
const getStats = async (callCluster, index, {
  home
}) => {
  var _opensearchResponse$h, _opensearchResponse$h2;
  const searchParams = {
    size: 10000,
    index,
    ignoreUnavailable: true,
    filterPath: ['hits.hits._id', 'hits.hits._source.visualization'],
    body: {
      query: {
        bool: {
          filter: {
            term: {
              type: 'visualization'
            }
          }
        }
      }
    }
  };
  const opensearchResponse = await callCluster('search', searchParams);
  const size = (_opensearchResponse$h = opensearchResponse === null || opensearchResponse === void 0 || (_opensearchResponse$h2 = opensearchResponse.hits) === null || _opensearchResponse$h2 === void 0 || (_opensearchResponse$h2 = _opensearchResponse$h2.hits) === null || _opensearchResponse$h2 === void 0 ? void 0 : _opensearchResponse$h2.length) !== null && _opensearchResponse$h !== void 0 ? _opensearchResponse$h : 0;
  let shouldPublishTelemetry = false;
  if (!size) {
    return;
  }

  // we want to exclude the Vega Sample Data visualizations from the stats
  // in order to have more accurate results
  const excludedFromStatsVisualizations = getDefaultVegaVisualizations(home);
  const finalTelemetry = opensearchResponse.hits.hits.reduce((telemetry, hit) => {
    var _hit$_source, _visualization$visSta;
    const visualization = (_hit$_source = hit._source) === null || _hit$_source === void 0 ? void 0 : _hit$_source.visualization;
    const visState = JSON.parse((_visualization$visSta = visualization === null || visualization === void 0 ? void 0 : visualization.visState) !== null && _visualization$visSta !== void 0 ? _visualization$visSta : '{}');
    if (isVegaType(visState) && !excludedFromStatsVisualizations.includes(visState.title)) try {
      const spec = (0, _hjson.parse)(visState.params.spec, {
        legacyRoot: false
      });
      if (spec) {
        var _spec$config;
        shouldPublishTelemetry = true;
        if (checkVegaSchemaType(spec.$schema, 'vega')) {
          telemetry.vega_lib_specs_total++;
        }
        if (checkVegaSchemaType(spec.$schema, 'vega-lite')) {
          telemetry.vega_lite_lib_specs_total++;
        }
        if (((_spec$config = spec.config) === null || _spec$config === void 0 || (_spec$config = _spec$config.kibana) === null || _spec$config === void 0 ? void 0 : _spec$config.type) === 'map') {
          telemetry.vega_use_map_total++;
        }
      }
    } catch (e) {
      // Let it go, the data is invalid and we'll don't need to handle it
    }
    return telemetry;
  }, {
    vega_lib_specs_total: 0,
    vega_lite_lib_specs_total: 0,
    vega_use_map_total: 0
  });
  return shouldPublishTelemetry ? finalTelemetry : undefined;
};
function getUsageCollector(config, dependencies) {
  return {
    type: VEGA_USAGE_TYPE,
    isReady: () => true,
    fetch: async callCluster => {
      const {
        index
      } = (await config.pipe((0, _operators.first)()).toPromise()).opensearchDashboards;
      return await getStats(callCluster, index, dependencies);
    }
  };
}