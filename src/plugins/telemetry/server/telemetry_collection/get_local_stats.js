"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLocalStats = void 0;
exports.handleLocalStats = handleLocalStats;
var _get_cluster_info = require("./get_cluster_info");
var _get_cluster_stats = require("./get_cluster_stats");
var _get_opensearch_dashboards = require("./get_opensearch_dashboards");
var _get_nodes_usage = require("./get_nodes_usage");
var _get_data_telemetry = require("./get_data_telemetry");
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
 * Handle the separate local calls by combining them into a single object response that looks like the
 * "cluster_stats" document from X-Pack monitoring.
 *
 * @param {Object} server ??
 * @param {Object} clusterInfo Cluster info (GET /)
 * @param {Object} clusterStats Cluster stats (GET /_cluster/stats)
 * @param {Object} opensearchDashboards The OpenSearchDashboards Usage stats
 */
function handleLocalStats(
// eslint-disable-next-line @typescript-eslint/naming-convention
{
  cluster_name,
  cluster_uuid,
  version
}, {
  _nodes,
  cluster_name: clusterName,
  ...clusterStats
}, opensearchDashboards, dataTelemetry, context) {
  return {
    timestamp: new Date().toISOString(),
    cluster_uuid,
    cluster_name,
    version: version.number,
    cluster_stats: clusterStats,
    collection: 'local',
    stack_stats: {
      [_get_data_telemetry.DATA_TELEMETRY_ID]: dataTelemetry,
      opensearch_dashboards: (0, _get_opensearch_dashboards.handleOpenSearchDashboardsStats)(context, opensearchDashboards)
    }
  };
}
/**
 * Get statistics for all products joined by OpenSearch cluster.
 * @param {Array} cluster uuids
 * @param {Object} config contains the new opensearchClient already scoped contains usageCollection, callCluster, opensearchClient, start, end
 * @param {Object} StatsCollectionContext contains logger and version (string)
 */
const getLocalStats = async (clustersDetails,
// array of cluster uuid's
config,
// contains the new opensearchClient already scoped contains usageCollection, callCluster, opensearchClient, start, end
context // StatsCollectionContext contains logger and version (string)
) => {
  const {
    callCluster,
    usageCollection,
    opensearchClient
  } = config;
  return await Promise.all(clustersDetails.map(async clustersDetail => {
    const [clusterInfo, clusterStats, nodesUsage, opensearchDashboards, dataTelemetry] = await Promise.all([(0, _get_cluster_info.getClusterInfo)(opensearchClient),
    // cluster info
    (0, _get_cluster_stats.getClusterStats)(opensearchClient),
    // cluster stats (not to be confused with cluster _state_)
    (0, _get_nodes_usage.getNodesUsage)(opensearchClient),
    // nodes_usage info
    (0, _get_opensearch_dashboards.getOpenSearchDashboards)(usageCollection, callCluster, opensearchClient), (0, _get_data_telemetry.getDataTelemetry)(opensearchClient)]);
    return handleLocalStats(clusterInfo, {
      ...clusterStats,
      nodes: {
        ...clusterStats.nodes,
        usage: nodesUsage
      }
    }, opensearchDashboards, dataTelemetry, context);
  }));
};
exports.getLocalStats = getLocalStats;