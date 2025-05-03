"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configSchema = void 0;
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

const configSchema = exports.configSchema = _configSchema.schema.object({
  url: _configSchema.schema.maybe(_configSchema.schema.string()),
  options: _configSchema.schema.object({
    attribution: _configSchema.schema.string({
      defaultValue: ''
    }),
    minZoom: _configSchema.schema.number({
      defaultValue: 0,
      min: 0
    }),
    maxZoom: _configSchema.schema.number({
      defaultValue: 10
    }),
    tileSize: _configSchema.schema.maybe(_configSchema.schema.number()),
    subdomains: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.string())),
    errorTileUrl: _configSchema.schema.maybe(_configSchema.schema.string()),
    tms: _configSchema.schema.maybe(_configSchema.schema.boolean()),
    reuseTiles: _configSchema.schema.maybe(_configSchema.schema.boolean()),
    bounds: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.number({
      min: 2
    }))),
    default: _configSchema.schema.maybe(_configSchema.schema.boolean())
  })
});