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
  enhancements: _configSchema.schema.object({
    supportedAppNames: _configSchema.schema.arrayOf(_configSchema.schema.string(), {
      defaultValue: ['discover']
    })
  }),
  autocomplete: _configSchema.schema.object({
    querySuggestions: _configSchema.schema.object({
      enabled: _configSchema.schema.boolean({
        defaultValue: true
      })
    }),
    valueSuggestions: _configSchema.schema.object({
      enabled: _configSchema.schema.boolean({
        defaultValue: true
      })
    })
  }),
  search: _configSchema.schema.object({
    aggs: _configSchema.schema.object({
      shardDelay: _configSchema.schema.object({
        // Whether or not to register the shard_delay (which is only available in snapshot versions
        // of OpenSearch) agg type/expression function to make it available in the UI for either
        // functional or manual testing
        enabled: _configSchema.schema.boolean({
          defaultValue: false
        })
      })
    }),
    usageTelemetry: _configSchema.schema.object({
      enabled: _configSchema.schema.boolean({
        defaultValue: false
      })
    })
  })
});