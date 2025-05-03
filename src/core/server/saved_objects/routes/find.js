"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerFindRoute = void 0;
var _configSchema = require("@osd/config-schema");
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

const registerFindRoute = router => {
  router.get({
    path: '/_find',
    validate: {
      query: _configSchema.schema.object({
        per_page: _configSchema.schema.number({
          min: 0,
          defaultValue: 20
        }),
        page: _configSchema.schema.number({
          min: 0,
          defaultValue: 1
        }),
        type: _configSchema.schema.oneOf([_configSchema.schema.string(), _configSchema.schema.arrayOf(_configSchema.schema.string())]),
        search: _configSchema.schema.maybe(_configSchema.schema.string()),
        default_search_operator: _configSchema.schema.oneOf([_configSchema.schema.literal('OR'), _configSchema.schema.literal('AND')], {
          defaultValue: 'OR'
        }),
        search_fields: _configSchema.schema.maybe(_configSchema.schema.oneOf([_configSchema.schema.string(), _configSchema.schema.arrayOf(_configSchema.schema.string())])),
        sort_field: _configSchema.schema.maybe(_configSchema.schema.string()),
        has_reference: _configSchema.schema.maybe(_configSchema.schema.object({
          type: _configSchema.schema.string(),
          id: _configSchema.schema.string()
        })),
        fields: _configSchema.schema.maybe(_configSchema.schema.oneOf([_configSchema.schema.string(), _configSchema.schema.arrayOf(_configSchema.schema.string())])),
        filter: _configSchema.schema.maybe(_configSchema.schema.string()),
        namespaces: _configSchema.schema.maybe(_configSchema.schema.oneOf([_configSchema.schema.string(), _configSchema.schema.arrayOf(_configSchema.schema.string())])),
        workspaces: _configSchema.schema.maybe(_configSchema.schema.oneOf([_configSchema.schema.string(), _configSchema.schema.arrayOf(_configSchema.schema.string())]))
      })
    }
  }, router.handleLegacyErrors(async (context, req, res) => {
    const query = req.query;
    const namespaces = typeof req.query.namespaces === 'string' ? [req.query.namespaces] : req.query.namespaces;
    const workspaces = query.workspaces ? Array().concat(query.workspaces) : undefined;
    const result = await context.core.savedObjects.client.find({
      perPage: query.per_page,
      page: query.page,
      type: Array.isArray(query.type) ? query.type : [query.type],
      search: query.search,
      defaultSearchOperator: query.default_search_operator,
      searchFields: typeof query.search_fields === 'string' ? [query.search_fields] : query.search_fields,
      sortField: query.sort_field,
      hasReference: query.has_reference,
      fields: typeof query.fields === 'string' ? [query.fields] : query.fields,
      filter: query.filter,
      namespaces,
      ...(workspaces ? {
        workspaces
      } : {})
    });
    return res.ok({
      body: result
    });
  }));
};
exports.registerFindRoute = registerFindRoute;