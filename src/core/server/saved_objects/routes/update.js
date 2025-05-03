"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerUpdateRoute = void 0;
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

const registerUpdateRoute = router => {
  router.put({
    path: '/{type}/{id}',
    validate: {
      params: _configSchema.schema.object({
        type: _configSchema.schema.string(),
        id: _configSchema.schema.string()
      }),
      body: _configSchema.schema.object({
        attributes: _configSchema.schema.recordOf(_configSchema.schema.string(), _configSchema.schema.any()),
        version: _configSchema.schema.maybe(_configSchema.schema.string()),
        references: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.object({
          name: _configSchema.schema.string(),
          type: _configSchema.schema.string(),
          id: _configSchema.schema.string()
        })))
      })
    }
  }, router.handleLegacyErrors(async (context, req, res) => {
    const {
      type,
      id
    } = req.params;
    const {
      attributes,
      version,
      references
    } = req.body;
    const options = {
      version,
      references
    };
    const result = await context.core.savedObjects.client.update(type, id, attributes, options);
    return res.ok({
      body: result
    });
  }));
};
exports.registerUpdateRoute = registerUpdateRoute;