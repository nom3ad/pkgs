"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerScrollForExportRoute = void 0;
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

const registerScrollForExportRoute = router => {
  router.post({
    path: '/api/opensearch-dashboards/management/saved_objects/scroll/export',
    validate: {
      body: _configSchema.schema.object({
        typesToInclude: _configSchema.schema.arrayOf(_configSchema.schema.string())
      })
    }
  }, router.handleLegacyErrors(async (context, req, res) => {
    const {
      client
    } = context.core.savedObjects;
    const objects = await (0, _lib.findAll)(client, {
      perPage: 1000,
      type: req.body.typesToInclude
    });
    return res.ok({
      body: objects.map(hit => {
        return {
          _id: hit.id,
          _type: hit.type,
          _source: hit.attributes,
          _meta: {
            savedObjectVersion: 2
          },
          _migrationVersion: hit.migrationVersion,
          _references: hit.references || []
        };
      })
    });
  }));
};
exports.registerScrollForExportRoute = registerScrollForExportRoute;