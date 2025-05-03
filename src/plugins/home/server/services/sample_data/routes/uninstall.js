"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createUninstallRoute = createUninstallRoute;
var _configSchema = require("@osd/config-schema");
var _lodash = _interopRequireDefault(require("lodash"));
var _utils = require("../../../../../../core/server/utils");
var _util = require("../data_sets/util");
var _create_index_name = require("../lib/create_index_name");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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

function createUninstallRoute(router, sampleDatasets, usageTracker) {
  router.delete({
    path: '/api/sample_data/{id}',
    validate: {
      params: _configSchema.schema.object({
        id: _configSchema.schema.string()
      }),
      query: _configSchema.schema.object({
        data_source_id: _configSchema.schema.maybe(_configSchema.schema.string())
      })
    }
  }, async (context, request, response) => {
    const sampleDataset = sampleDatasets.find(({
      id
    }) => id === request.params.id);
    const dataSourceId = request.query.data_source_id;
    const workspaceState = (0, _utils.getWorkspaceState)(request);
    const workspaceId = workspaceState === null || workspaceState === void 0 ? void 0 : workspaceState.requestWorkspaceId;
    if (!sampleDataset) {
      return response.notFound();
    }

    /**
     * Delete saved objects before removing the data index to avoid partial deletion
     * of sample data when a read-only workspace user attempts to remove sample data.
     */
    const savedObjectsList = (0, _util.getFinalSavedObjects)({
      dataset: sampleDataset,
      workspaceId,
      dataSourceId
    });
    const deletePromises = savedObjectsList.map(({
      type,
      id
    }) => context.core.savedObjects.client.delete(type, id));
    try {
      await Promise.all(deletePromises);
    } catch (err) {
      // ignore 404s since users could have deleted some of the saved objects via the UI
      if (_lodash.default.get(err, 'output.statusCode') !== 404) {
        return response.customError({
          statusCode: err.status || _lodash.default.get(err, 'output.statusCode'),
          body: {
            message: `Unable to delete sample dataset saved objects, error: ${err.message}`
          }
        });
      }
    }
    const caller = dataSourceId ? context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI : context.core.opensearch.legacy.client.callAsCurrentUser;
    for (let i = 0; i < sampleDataset.dataIndices.length; i++) {
      var _dataIndexConfig$inde;
      const dataIndexConfig = sampleDataset.dataIndices[i];
      const index = (_dataIndexConfig$inde = dataIndexConfig.indexName) !== null && _dataIndexConfig$inde !== void 0 ? _dataIndexConfig$inde : (0, _create_index_name.createIndexName)(sampleDataset.id, dataIndexConfig.id);
      try {
        await caller('indices.delete', {
          index
        });
      } catch (err) {
        return response.customError({
          statusCode: err.status,
          body: {
            message: `Unable to delete sample data index "${index}", error: ${err.message}`
          }
        });
      }
    }

    // track the usage operation in a non-blocking way
    usageTracker.addUninstall(request.params.id);
    return response.noContent();
  });
}