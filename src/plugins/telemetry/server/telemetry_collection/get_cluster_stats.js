"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getClusterStats = getClusterStats;
exports.getClusterUuids = void 0;
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

/**
 * Get the cluster stats from the connected cluster.
 *
 * This is the equivalent to GET /_cluster/stats?timeout=30s.
 */
async function getClusterStats(opensearchClient) {
  const {
    body
  } = await opensearchClient.cluster.stats({
    timeout: _constants.TIMEOUT
  });
  return body;
}

/**
 * Get the cluster uuids from the connected cluster.
 */
const getClusterUuids = async ({
  opensearchClient
}) => {
  const {
    body
  } = await opensearchClient.cluster.stats({
    timeout: _constants.TIMEOUT
  });
  return [{
    clusterUuid: body.cluster_uuid
  }];
};
exports.getClusterUuids = getClusterUuids;