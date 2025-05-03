"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOpenSearchDashboards = getOpenSearchDashboards;
exports.handleOpenSearchDashboardsStats = handleOpenSearchDashboardsStats;
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

function handleOpenSearchDashboardsStats({
  logger,
  version: serverVersion
}, response) {
  if (!response) {
    logger.warn('No OpenSearchDashboards stats returned from usage collectors');
    return;
  }
  const {
    opensearchDashboards,
    opensearch_dashboards_stats: opensearchDashboardsStats,
    ...plugins
  } = response;
  const os = {
    platform: 'unknown',
    platformRelease: 'unknown',
    ...opensearchDashboardsStats.os
  };
  const formattedOsStats = Object.entries(os).reduce((acc, [key, value]) => {
    if (typeof value !== 'string') {
      // There are new fields reported now from the "os" property like "load", "memory", etc. They are objects.
      return acc;
    }
    return {
      ...acc,
      [`${key}s`]: [{
        [key]: value,
        count: 1
      }]
    };
  }, {});
  const version = serverVersion.replace(/-snapshot/i, ''); // Shouldn't we better maintain the -snapshot so we can differentiate between actual final releases and snapshots?

  // combine core stats (os types, saved objects) with plugin usage stats
  // organize the object into the same format as monitoring-enabled telemetry
  return {
    ...(0, _lodash.omit)(opensearchDashboards, 'index'),
    // discard index
    count: 1,
    indices: 1,
    os: formattedOsStats,
    versions: [{
      version,
      count: 1
    }],
    plugins
  };
}
async function getOpenSearchDashboards(usageCollection, callWithInternalUser, asInternalUser) {
  const usage = await usageCollection.bulkFetch(callWithInternalUser, asInternalUser);
  return usageCollection.toObject(usage);
}