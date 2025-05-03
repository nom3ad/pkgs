"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createInstallRoute = createInstallRoute;
var _configSchema = require("@osd/config-schema");
var _server = require("../../../../../../core/server");
var _utils = require("../../../../../../core/server/utils");
var _util = require("../data_sets/util");
var _create_index_name = require("../lib/create_index_name");
var _load_data = require("../lib/load_data");
var _translate_timestamp = require("../lib/translate_timestamp");
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

const insertDataIntoIndex = (dataIndexConfig, index, nowReference, caller, logger) => {
  // Function to update timestamps
  function updateTimestamps(doc) {
    dataIndexConfig.timeFields.filter(timeFieldName => (0, _util.getNestedField)(doc, timeFieldName)).forEach(timeFieldName => {
      const timeValue = (0, _util.getNestedField)(doc, timeFieldName);
      const updatedTime = dataIndexConfig.preserveDayOfWeekTimeOfDay ? (0, _translate_timestamp.translateTimeRelativeToWeek)(timeValue, dataIndexConfig.currentTimeMarker, nowReference) : (0, _translate_timestamp.translateTimeRelativeToDifference)(timeValue, dataIndexConfig.currentTimeMarker, nowReference);
      (0, _util.setNestedField)(doc, timeFieldName, updatedTime);
    });
    return doc;
  }
  const bulkInsert = async docs => {
    const insertCmd = {
      index: {
        _index: index
      }
    };
    const bulk = [];
    docs.forEach(doc => {
      bulk.push(insertCmd);
      bulk.push(updateTimestamps(doc));
    });
    const resp = await caller('bulk', {
      body: bulk
    });
    if (resp.errors) {
      const errMsg = `sample_data install errors while bulk inserting. OpenSearch response: ${JSON.stringify(resp, null, '')}`;
      logger.warn(errMsg);
      return Promise.reject(new Error(`Unable to load sample data into index "${index}", see OpenSearch Dashboards logs for details`));
    }
  };
  return (0, _load_data.loadData)(dataIndexConfig.dataPath, bulkInsert); // this returns a Promise
};

function createInstallRoute(router, sampleDatasets, logger, usageTracker) {
  router.post({
    path: '/api/sample_data/{id}',
    validate: {
      params: _configSchema.schema.object({
        id: _configSchema.schema.string()
      }),
      // TODO validate now as date
      query: _configSchema.schema.object({
        now: _configSchema.schema.maybe(_configSchema.schema.string()),
        data_source_id: _configSchema.schema.maybe(_configSchema.schema.string())
      })
    }
  }, async (context, req, res) => {
    const {
      params,
      query
    } = req;
    const dataSourceId = query.data_source_id;
    const workspaceState = (0, _utils.getWorkspaceState)(req);
    const workspaceId = workspaceState === null || workspaceState === void 0 ? void 0 : workspaceState.requestWorkspaceId;
    const sampleDataset = sampleDatasets.find(({
      id
    }) => id === params.id);
    if (!sampleDataset) {
      return res.notFound();
    }
    //  @ts-ignore Custom query validation used
    const now = query.now ? new Date(query.now) : new Date();
    const nowReference = (0, _translate_timestamp.dateToIso8601IgnoringTime)(now);
    const counts = {};
    const caller = dataSourceId ? context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI : context.core.opensearch.legacy.client.callAsCurrentUser;
    let dataSourceTitle;
    try {
      if (dataSourceId) {
        const dataSource = await context.core.savedObjects.client.get('data-source', dataSourceId).then(response => {
          const attributes = (response === null || response === void 0 ? void 0 : response.attributes) || {};
          return {
            id: response.id,
            title: attributes.title
          };
        });
        dataSourceTitle = dataSource.title;
      }
    } catch (err) {
      return res.internalError({
        body: err
      });
    }
    for (let i = 0; i < sampleDataset.dataIndices.length; i++) {
      var _dataIndexConfig$inde;
      const dataIndexConfig = sampleDataset.dataIndices[i];
      const index = (_dataIndexConfig$inde = dataIndexConfig.indexName) !== null && _dataIndexConfig$inde !== void 0 ? _dataIndexConfig$inde : (0, _create_index_name.createIndexName)(sampleDataset.id, dataIndexConfig.id);

      // clean up any old installation of dataset
      try {
        await caller('indices.delete', {
          index
        });
      } catch (err) {
        // ignore delete errors
      }
      try {
        const createIndexParams = {
          index,
          body: {
            settings: dataSourceId ? {
              index: {
                number_of_shards: 1
              }
            } : {
              index: {
                number_of_shards: 1,
                auto_expand_replicas: '0-1'
              }
            },
            mappings: {
              properties: dataIndexConfig.fields
            }
          }
        };
        await caller('indices.create', createIndexParams);
      } catch (err) {
        const errMsg = `Unable to create sample data index "${index}", error: ${err.message}`;
        logger.warn(errMsg);
        return res.customError({
          body: errMsg,
          statusCode: err.status
        });
      }
      try {
        const count = await insertDataIntoIndex(dataIndexConfig, index, nowReference, caller, logger);
        counts[index] = count;
      } catch (err) {
        const errMsg = `sample_data install errors while loading data. Error: ${err}`;
        logger.warn(errMsg);
        return res.internalError({
          body: errMsg
        });
      }
    }
    let createResults;
    const savedObjectsList = (0, _util.getFinalSavedObjects)({
      dataset: sampleDataset,
      workspaceId,
      dataSourceId,
      dataSourceTitle
    });
    try {
      createResults = await context.core.savedObjects.client.bulkCreate(savedObjectsList.map(({
        version,
        ...savedObject
      }) => savedObject), {
        overwrite: true
      });
    } catch (err) {
      const errMsg = `bulkCreate failed, error: ${err.message}`;
      logger.warn(errMsg);
      if (workspaceId && _server.SavedObjectsErrorHelpers.isForbiddenError(err)) {
        return res.forbidden({
          body: errMsg
        });
      }
      return res.internalError({
        body: errMsg
      });
    }
    const errors = createResults.saved_objects.filter(savedObjectCreateResult => {
      return Boolean(savedObjectCreateResult.error);
    });
    if (errors.length > 0) {
      const errMsg = `sample_data install errors while loading saved objects. Errors: ${errors.join(',')}`;
      logger.warn(errMsg);
      return res.customError({
        body: errMsg,
        statusCode: 403
      });
    }
    usageTracker.addInstall(params.id);

    // FINALLY
    return res.ok({
      body: {
        opensearchIndicesCreated: counts,
        opensearchDashboardsSavedObjectsLoaded: savedObjectsList.length
      }
    });
  });
}