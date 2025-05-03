"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerFindRoute = void 0;
var _configSchema = require("@osd/config-schema");
var _utils = require("../../../data/common/index_patterns/utils");
var _lib = require("../lib");
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

const registerFindRoute = (router, managementServicePromise) => {
  router.get({
    path: '/api/opensearch-dashboards/management/saved_objects/_find',
    validate: {
      query: _configSchema.schema.object({
        perPage: _configSchema.schema.number({
          min: 0,
          defaultValue: 20
        }),
        page: _configSchema.schema.number({
          min: 0,
          defaultValue: 1
        }),
        type: _configSchema.schema.oneOf([_configSchema.schema.string(), _configSchema.schema.arrayOf(_configSchema.schema.string())]),
        namespaces: _configSchema.schema.maybe(_configSchema.schema.oneOf([_configSchema.schema.string(), _configSchema.schema.arrayOf(_configSchema.schema.string())])),
        search: _configSchema.schema.maybe(_configSchema.schema.string()),
        defaultSearchOperator: _configSchema.schema.oneOf([_configSchema.schema.literal('OR'), _configSchema.schema.literal('AND')], {
          defaultValue: 'OR'
        }),
        sortField: _configSchema.schema.maybe(_configSchema.schema.string()),
        hasReference: _configSchema.schema.maybe(_configSchema.schema.object({
          type: _configSchema.schema.string(),
          id: _configSchema.schema.string()
        })),
        fields: _configSchema.schema.oneOf([_configSchema.schema.string(), _configSchema.schema.arrayOf(_configSchema.schema.string())], {
          defaultValue: []
        }),
        workspaces: _configSchema.schema.maybe(_configSchema.schema.oneOf([_configSchema.schema.string(), _configSchema.schema.arrayOf(_configSchema.schema.string())]))
      })
    }
  }, router.handleLegacyErrors(async (context, req, res) => {
    const managementService = await managementServicePromise;
    const {
      client
    } = context.core.savedObjects;
    const searchTypes = Array.isArray(req.query.type) ? req.query.type : [req.query.type];
    const includedFields = Array.isArray(req.query.fields) ? req.query.fields : [req.query.fields];
    const importAndExportableTypes = searchTypes.filter(type => managementService.isImportAndExportable(type));
    const searchFields = new Set();
    importAndExportableTypes.forEach(type => {
      const searchField = managementService.getDefaultSearchField(type);
      if (searchField) {
        searchFields.add(searchField);
      }
    });
    const getDataSource = async id => {
      return await client.get('data-source', id);
    };
    const findOptions = {
      ...req.query,
      fields: undefined,
      searchFields: [...searchFields],
      workspaces: req.query.workspaces ? Array().concat(req.query.workspaces) : undefined
    };
    const findResponse = await client.find(findOptions);
    const savedObjects = await Promise.all(findResponse.saved_objects.map(async obj => {
      if (obj.type === 'index-pattern') {
        const result = {
          ...obj
        };
        result.attributes.title = await (0, _utils.getIndexPatternTitle)(obj.attributes.title, obj.references, getDataSource);
        return result;
      } else {
        return obj;
      }
    }));
    const enhancedSavedObjects = savedObjects.map(so => (0, _lib.injectMetaAttributes)(so, managementService)).map(obj => {
      const result = {
        ...obj,
        attributes: {}
      };
      for (const field of includedFields) {
        result.attributes[field] = obj.attributes[field];
      }
      return result;
    });
    return res.ok({
      body: {
        ...findResponse,
        saved_objects: enhancedSavedObjects
      }
    });
  }));
};
exports.registerFindRoute = registerFindRoute;