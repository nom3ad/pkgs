"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerImportRoute = void 0;
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

const registerImportRoute = (router, maxImportPayloadBytes) => {
  router.post({
    path: '/api/opensearch-dashboards/dashboards/import',
    validate: {
      body: _configSchema.schema.object({
        objects: _configSchema.schema.arrayOf(_configSchema.schema.recordOf(_configSchema.schema.string(), _configSchema.schema.any())),
        version: _configSchema.schema.maybe(_configSchema.schema.string())
      }),
      query: _configSchema.schema.object({
        force: _configSchema.schema.boolean({
          defaultValue: false
        }),
        exclude: _configSchema.schema.oneOf([_configSchema.schema.string(), _configSchema.schema.arrayOf(_configSchema.schema.string())], {
          defaultValue: []
        })
      })
    },
    options: {
      tags: ['api'],
      body: {
        maxBytes: maxImportPayloadBytes
      }
    }
  }, async (ctx, req, res) => {
    const {
      client
    } = ctx.core.savedObjects;
    const objects = req.body.objects;
    const {
      force,
      exclude
    } = req.query;
    const result = await (0, _lib.importDashboards)(client, objects, {
      overwrite: force,
      exclude: Array.isArray(exclude) ? exclude : [exclude]
    });
    return res.ok({
      body: result
    });
  });
};
exports.registerImportRoute = registerImportRoute;