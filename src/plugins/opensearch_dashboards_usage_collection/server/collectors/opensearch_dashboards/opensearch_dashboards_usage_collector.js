"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOpenSearchDashboardsUsageCollector = getOpenSearchDashboardsUsageCollector;
exports.registerOpenSearchDashboardsUsageCollector = registerOpenSearchDashboardsUsageCollector;
var _operators = require("rxjs/operators");
var _constants = require("../../../common/constants");
var _get_saved_object_counts = require("./get_saved_object_counts");
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

function getOpenSearchDashboardsUsageCollector(usageCollection, legacyConfig$) {
  return usageCollection.makeUsageCollector({
    type: 'opensearchDashboards',
    isReady: () => true,
    schema: {
      index: {
        type: 'keyword'
      },
      dashboard: {
        total: {
          type: 'long'
        }
      },
      visualization: {
        total: {
          type: 'long'
        }
      },
      search: {
        total: {
          type: 'long'
        }
      },
      index_pattern: {
        total: {
          type: 'long'
        }
      },
      graph_workspace: {
        total: {
          type: 'long'
        }
      },
      timelion_sheet: {
        total: {
          type: 'long'
        }
      }
    },
    async fetch(callCluster) {
      const {
        opensearchDashboards: {
          index
        }
      } = await legacyConfig$.pipe((0, _operators.take)(1)).toPromise();
      return {
        index,
        ...(await (0, _get_saved_object_counts.getSavedObjectsCounts)(callCluster, index))
      };
    },
    /*
     * Format the response data into a model for internal upload
     * 1. Make this data part of the "opensearch_dashboards_stats" type
     * 2. Organize the payload in the usage namespace of the data payload (usage.index, etc)
     */
    formatForBulkUpload: result => {
      return {
        type: _constants.OPENSEARCH_DASHBOARDS_STATS_TYPE,
        payload: {
          usage: result
        }
      };
    }
  });
}
function registerOpenSearchDashboardsUsageCollector(usageCollection, legacyConfig$) {
  usageCollection.registerCollector(getOpenSearchDashboardsUsageCollector(usageCollection, legacyConfig$));
}