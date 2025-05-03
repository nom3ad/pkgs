"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRepositoryOpenSearchClient = createRepositoryOpenSearchClient;
var _retry_call_cluster = require("../../../opensearch/client/retry_call_cluster");
var _decorate_opensearch_error = require("./decorate_opensearch_error");
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

const methods = ['bulk', 'create', 'delete', 'get', 'index', 'mget', 'search', 'update', 'updateByQuery'];
function createRepositoryOpenSearchClient(client) {
  return methods.reduce((acc, key) => {
    Object.defineProperty(acc, key, {
      value: async (params, options) => {
        try {
          return await (0, _retry_call_cluster.retryCallCluster)(() => client[key](params, {
            maxRetries: 0,
            ...options
          }));
        } catch (e) {
          throw (0, _decorate_opensearch_error.decorateOpenSearchError)(e);
        }
      }
    });
    return acc;
  }, {});
}