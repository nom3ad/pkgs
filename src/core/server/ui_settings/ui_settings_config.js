"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = exports.DEFAULT_THEME_VERSION = void 0;
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

const deprecations = ({
  unused,
  renameFromRoot
}) => [unused('enabled'), renameFromRoot('server.defaultRoute', 'uiSettings.overrides.defaultRoute')];
const DEFAULT_THEME_VERSION = exports.DEFAULT_THEME_VERSION = 'v8';

/* There are 4 levels of uiSettings:
 *   1) defaults hardcoded in code
 *   2) defaults provided in the opensearch_dashboards.yml
 *   3) values selected by the user and received from savedObjects
 *   4) overrides provided in the opensearch_dashboards.yml
 *
 * Each of these levels override the one above them.
 *
 * The schema below exposes only a limited set of settings to be set in the config file.
 *
 * ToDo: Remove overrides; these were added to force the lock down the theme version.
 * The schema is temporarily relaxed to allow overriding the `darkMode` and setting
 * `defaults`. An upcoming change would relax them further to allow setting them.
 */

const configSchema = _configSchema.schema.object({
  overrides: _configSchema.schema.object({}, {
    unknowns: 'allow'
  }),
  defaults: _configSchema.schema.object({
    'theme:darkMode': _configSchema.schema.maybe(_configSchema.schema.boolean({
      defaultValue: false
    })),
    'theme:version': _configSchema.schema.maybe(_configSchema.schema.string({
      defaultValue: DEFAULT_THEME_VERSION
    }))
  })
});
const config = exports.config = {
  path: 'uiSettings',
  schema: configSchema,
  deprecations
};