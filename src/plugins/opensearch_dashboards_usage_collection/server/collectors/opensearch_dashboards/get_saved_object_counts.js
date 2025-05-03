"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSavedObjectsCounts = getSavedObjectsCounts;
var _lodash = require("lodash");
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

/**
 * Moved from /x-pack/plugins/monitoring/server/opensearch_dashboards_monitoring/collectors/get_opensearch_dashboards_usage_collector.ts
 *
 * The PR https://github.com/elastic/kibana/pull/62665 proved what the issue https://github.com/elastic/kibana/issues/58249
 * was claiming: the structure and payload for common telemetry bits differs between Monitoring and OSS/X-Pack collections.
 *
 * Unifying this logic from Monitoring that makes sense to have in OSS here and we will import it on the monitoring side to reuse it.
 */

const TYPES = ['dashboard', 'visualization', 'search', 'index-pattern', 'graph-workspace'];
async function getSavedObjectsCounts(callCluster, opensearchDashboardsIndex) {
  var _resp$aggregations;
  const savedObjectCountSearchParams = {
    index: opensearchDashboardsIndex,
    ignoreUnavailable: true,
    filterPath: 'aggregations.types.buckets',
    body: {
      size: 0,
      query: {
        terms: {
          type: TYPES
        }
      },
      aggs: {
        types: {
          terms: {
            field: 'type',
            size: TYPES.length
          }
        }
      }
    }
  };
  const resp = await callCluster('search', savedObjectCountSearchParams);
  const buckets = ((_resp$aggregations = resp.aggregations) === null || _resp$aggregations === void 0 || (_resp$aggregations = _resp$aggregations.types) === null || _resp$aggregations === void 0 ? void 0 : _resp$aggregations.buckets) || [];

  // Initialise the object with all zeros for all the types
  const allZeros = TYPES.reduce((acc, type) => ({
    ...acc,
    [(0, _lodash.snakeCase)(type)]: {
      total: 0
    }
  }), {});

  // Add the doc_count from each bucket
  return buckets.reduce((acc, {
    key,
    doc_count: total
  }) => total ? {
    ...acc,
    [(0, _lodash.snakeCase)(key)]: {
      total
    }
  } : acc, allZeros);
}