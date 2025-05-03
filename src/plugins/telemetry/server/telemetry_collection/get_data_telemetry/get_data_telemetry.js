"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildDataTelemetryPayload = buildDataTelemetryPayload;
exports.getDataTelemetry = getDataTelemetry;
var _constants = require("./constants");
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

function findMatchingDescriptors({
  name,
  shipper,
  packageName,
  managedBy,
  dataStreamDataset,
  dataStreamType
}) {
  // If we already have the data from the indices' mappings...
  if ([shipper, packageName].some(Boolean) || managedBy === 'ingest-manager' && [dataStreamType, dataStreamDataset].some(Boolean)) {
    return [{
      ...(shipper && {
        shipper
      }),
      ...(packageName && {
        packageName
      }),
      ...(dataStreamDataset && {
        dataStreamDataset
      }),
      ...(dataStreamType && {
        dataStreamType
      })
    }

    // Using casting here because TS doesn't infer at least one exists from the if clause
    ];
  }

  // Otherwise, try with the list of known index patterns
  return _constants.DATA_DATASETS_INDEX_PATTERNS_UNIQUE.filter(({
    pattern
  }) => {
    if (!pattern.startsWith('.') && name.startsWith('.')) {
      // avoid system indices caught by very fuzzy index patterns (i.e.: *log* would catch `.opensearch_dashboards-log-...`)
      return false;
    }
    return new RegExp(`^${pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`).test(name);
  });
}
function increaseCounters(previousValue = {
  index_count: 0
}, {
  isECS,
  docCount,
  sizeInBytes
}) {
  return {
    ...previousValue,
    index_count: previousValue.index_count + 1,
    ...(typeof isECS === 'boolean' ? {
      ecs_index_count: (previousValue.ecs_index_count || 0) + (isECS ? 1 : 0)
    } : {}),
    ...(typeof docCount === 'number' ? {
      doc_count: (previousValue.doc_count || 0) + docCount
    } : {}),
    ...(typeof sizeInBytes === 'number' ? {
      size_in_bytes: (previousValue.size_in_bytes || 0) + sizeInBytes
    } : {})
  };
}
function buildDataTelemetryPayload(indices) {
  const startingDotPatternsUntilTheFirstAsterisk = _constants.DATA_DATASETS_INDEX_PATTERNS_UNIQUE.map(({
    pattern
  }) => pattern.replace(/^\.(.+)\*.*$/g, '.$1')).filter(Boolean);

  // Filter out the system indices unless they are required by the patterns
  const indexCandidates = indices.filter(({
    name
  }) => !(name.startsWith('.') && !name.startsWith('.ds-') &&
  // data_stream-related indices can be included
  !startingDotPatternsUntilTheFirstAsterisk.find(pattern => name.startsWith(pattern))));
  const acc = new Map();
  for (const indexCandidate of indexCandidates) {
    const matchingDescriptors = findMatchingDescriptors(indexCandidate);
    for (const {
      dataStreamDataset,
      dataStreamType,
      packageName,
      shipper,
      patternName
    } of matchingDescriptors) {
      const key = `${dataStreamDataset}-${dataStreamType}-${packageName}-${shipper}-${patternName}`;
      acc.set(key, {
        ...((dataStreamDataset || dataStreamType) && {
          data_stream: {
            dataset: dataStreamDataset,
            type: dataStreamType
          }
        }),
        ...(packageName && {
          package: {
            name: packageName
          }
        }),
        ...(shipper && {
          shipper
        }),
        ...(patternName && {
          pattern_name: patternName
        }),
        ...increaseCounters(acc.get(key), indexCandidate)
      });
    }
  }
  return [...acc.values()];
}
async function getDataTelemetry(opensearchClient) {
  try {
    const index = [..._constants.DATA_DATASETS_INDEX_PATTERNS_UNIQUE.map(({
      pattern
    }) => pattern), '*-*-*' // Include data-streams aliases `{type}-{dataset}-{namespace}`
    ];

    const indexMappingsParams = {
      // GET */_mapping?filter_path=*.mappings._meta.beat,*.mappings.properties.ecs.properties.version.type,*.mappings.properties.dataset.properties.type.value,*.mappings.properties.dataset.properties.name.value
      index: '*',
      // Request all indices because filter_path already filters out the indices without any of those fields
      filter_path: [
      // _meta.beat tells the shipper
      '*.mappings._meta.beat',
      // _meta.package.name tells the Ingest Manager's package
      '*.mappings._meta.package.name',
      // _meta.managed_by is usually populated by Ingest Manager for the UI to identify it
      '*.mappings._meta.managed_by',
      // Does it have `ecs.version` in the mappings? => It follows the ECS conventions
      '*.mappings.properties.ecs.properties.version.type',
      // If `data_stream.type` is a `constant_keyword`, it can be reported as a type
      '*.mappings.properties.data_stream.properties.type.value',
      // If `data_stream.dataset` is a `constant_keyword`, it can be reported as the dataset
      '*.mappings.properties.data_stream.properties.dataset.value']
    };
    const indicesStatsParams = {
      // GET <index>/_stats/docs,store?level=indices&filter_path=indices.*.total
      index,
      level: 'indices',
      metric: ['docs', 'store'],
      filter_path: ['indices.*.total']
    };
    const [{
      body: indexMappings
    }, {
      body: indexStats
    }] = await Promise.all([opensearchClient.indices.getMapping(indexMappingsParams), opensearchClient.indices.stats(indicesStatsParams)]);
    const indexNames = Object.keys({
      ...indexMappings,
      ...(indexStats === null || indexStats === void 0 ? void 0 : indexStats.indices)
    });
    const indices = indexNames.map(name => {
      var _indexMappings$name, _indexMappings$name2, _indexMappings$name3, _indexMappings$name4, _indexMappings$name5, _indexMappings$name6;
      const baseIndexInfo = {
        name,
        isECS: !!((_indexMappings$name = indexMappings[name]) !== null && _indexMappings$name !== void 0 && (_indexMappings$name = _indexMappings$name.mappings) !== null && _indexMappings$name !== void 0 && (_indexMappings$name = _indexMappings$name.properties.ecs) !== null && _indexMappings$name !== void 0 && (_indexMappings$name = _indexMappings$name.properties.version) !== null && _indexMappings$name !== void 0 && _indexMappings$name.type),
        shipper: (_indexMappings$name2 = indexMappings[name]) === null || _indexMappings$name2 === void 0 || (_indexMappings$name2 = _indexMappings$name2.mappings) === null || _indexMappings$name2 === void 0 || (_indexMappings$name2 = _indexMappings$name2._meta) === null || _indexMappings$name2 === void 0 ? void 0 : _indexMappings$name2.beat,
        packageName: (_indexMappings$name3 = indexMappings[name]) === null || _indexMappings$name3 === void 0 || (_indexMappings$name3 = _indexMappings$name3.mappings) === null || _indexMappings$name3 === void 0 || (_indexMappings$name3 = _indexMappings$name3._meta) === null || _indexMappings$name3 === void 0 || (_indexMappings$name3 = _indexMappings$name3.package) === null || _indexMappings$name3 === void 0 ? void 0 : _indexMappings$name3.name,
        managedBy: (_indexMappings$name4 = indexMappings[name]) === null || _indexMappings$name4 === void 0 || (_indexMappings$name4 = _indexMappings$name4.mappings) === null || _indexMappings$name4 === void 0 || (_indexMappings$name4 = _indexMappings$name4._meta) === null || _indexMappings$name4 === void 0 ? void 0 : _indexMappings$name4.managed_by,
        dataStreamDataset: (_indexMappings$name5 = indexMappings[name]) === null || _indexMappings$name5 === void 0 || (_indexMappings$name5 = _indexMappings$name5.mappings) === null || _indexMappings$name5 === void 0 || (_indexMappings$name5 = _indexMappings$name5.properties.data_stream) === null || _indexMappings$name5 === void 0 || (_indexMappings$name5 = _indexMappings$name5.properties.dataset) === null || _indexMappings$name5 === void 0 ? void 0 : _indexMappings$name5.value,
        dataStreamType: (_indexMappings$name6 = indexMappings[name]) === null || _indexMappings$name6 === void 0 || (_indexMappings$name6 = _indexMappings$name6.mappings) === null || _indexMappings$name6 === void 0 || (_indexMappings$name6 = _indexMappings$name6.properties.data_stream) === null || _indexMappings$name6 === void 0 || (_indexMappings$name6 = _indexMappings$name6.properties.type) === null || _indexMappings$name6 === void 0 ? void 0 : _indexMappings$name6.value
      };
      const stats = ((indexStats === null || indexStats === void 0 ? void 0 : indexStats.indices) || {})[name];
      if (stats) {
        var _stats$total, _stats$total2;
        return {
          ...baseIndexInfo,
          docCount: (_stats$total = stats.total) === null || _stats$total === void 0 || (_stats$total = _stats$total.docs) === null || _stats$total === void 0 ? void 0 : _stats$total.count,
          sizeInBytes: (_stats$total2 = stats.total) === null || _stats$total2 === void 0 || (_stats$total2 = _stats$total2.store) === null || _stats$total2 === void 0 ? void 0 : _stats$total2.size_in_bytes
        };
      }
      return baseIndexInfo;
    });
    return buildDataTelemetryPayload(indices);
  } catch (e) {
    return [];
  }
}