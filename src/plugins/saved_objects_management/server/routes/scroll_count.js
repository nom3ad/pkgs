"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerScrollForCountRoute = void 0;
var _configSchema = require("@osd/config-schema");
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

const registerScrollForCountRoute = router => {
  router.post({
    path: '/api/opensearch-dashboards/management/saved_objects/scroll/counts',
    validate: {
      body: _configSchema.schema.object({
        typesToInclude: _configSchema.schema.arrayOf(_configSchema.schema.string()),
        namespacesToInclude: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.string())),
        searchString: _configSchema.schema.maybe(_configSchema.schema.string()),
        workspaces: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.string())),
        availableWorkspaces: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.string()))
      })
    }
  }, router.handleLegacyErrors(async (context, req, res) => {
    const {
      client
    } = context.core.savedObjects;
    const counts = {
      type: {}
    };
    const findOptions = {
      type: req.body.typesToInclude,
      perPage: 1000
    };
    const requestHasNamespaces = Array.isArray(req.body.namespacesToInclude) && req.body.namespacesToInclude.length;
    const requestHasWorkspaces = Array.isArray(req.body.workspaces) && req.body.workspaces.length || Array.isArray(req.body.availableWorkspaces) && req.body.availableWorkspaces.length;
    if (requestHasNamespaces) {
      counts.namespaces = {};
      findOptions.namespaces = req.body.namespacesToInclude;
    }
    if (requestHasWorkspaces) {
      counts.workspaces = {};
      findOptions.workspaces = req.body.workspaces;
    }
    if (req.body.searchString) {
      findOptions.search = `${req.body.searchString}*`;
      findOptions.searchFields = ['title'];
    }
    const objects = await (0, _lib.findAll)(client, findOptions);
    objects.forEach(result => {
      const type = result.type;
      if (requestHasNamespaces) {
        const resultNamespaces = (result.namespaces || []).flat();
        resultNamespaces.forEach(ns => {
          if (ns === null) {
            ns = 'default';
          }
          counts.namespaces[ns] = counts.namespaces[ns] || 0;
          counts.namespaces[ns]++;
        });
      }
      if (requestHasWorkspaces) {
        const resultWorkspaces = result.workspaces || [];
        resultWorkspaces.forEach(ws => {
          counts.workspaces[ws] = counts.workspaces[ws] || 0;
          counts.workspaces[ws]++;
        });
      }
      counts.type[type] = counts.type[type] || 0;
      counts.type[type]++;
    });
    for (const type of req.body.typesToInclude) {
      if (!counts.type[type]) {
        counts.type[type] = 0;
      }
    }
    const namespacesToInclude = req.body.namespacesToInclude || [];
    for (const ns of namespacesToInclude) {
      if (!counts.namespaces[ns]) {
        counts.namespaces[ns] = 0;
      }
    }
    const workspacesToInclude = req.body.workspaces || req.body.availableWorkspaces || [];
    for (const ws of workspacesToInclude) {
      if (!counts.workspaces[ws]) {
        counts.workspaces[ws] = 0;
      }
    }
    return res.ok({
      body: counts
    });
  }));
};
exports.registerScrollForCountRoute = registerScrollForCountRoute;