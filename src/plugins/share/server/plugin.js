"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SharePlugin = void 0;
var _i18n = require("@osd/i18n");
var _configSchema = require("@osd/config-schema");
var _create_routes = require("./routes/create_routes");
var _saved_objects = require("./saved_objects");
var _constants = require("../common/constants");
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

class SharePlugin {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;
  }
  async setup(core) {
    (0, _create_routes.createRoutes)(core, this.initializerContext.logger.get());
    core.savedObjects.registerType(_saved_objects.url);
    core.uiSettings.register({
      [_constants.CSV_SEPARATOR_SETTING]: {
        name: _i18n.i18n.translate('share.advancedSettings.csv.separatorTitle', {
          defaultMessage: 'CSV separator'
        }),
        value: ',',
        description: _i18n.i18n.translate('share.advancedSettings.csv.separatorText', {
          defaultMessage: 'Separate exported values with this string'
        }),
        schema: _configSchema.schema.string()
      },
      [_constants.CSV_QUOTE_VALUES_SETTING]: {
        name: _i18n.i18n.translate('share.advancedSettings.csv.quoteValuesTitle', {
          defaultMessage: 'Quote CSV values'
        }),
        value: true,
        description: _i18n.i18n.translate('share.advancedSettings.csv.quoteValuesText', {
          defaultMessage: 'Should values be quoted in csv exports?'
        }),
        schema: _configSchema.schema.boolean()
      }
    });
  }
  start() {
    this.initializerContext.logger.get().debug('Starting plugin');
  }
  stop() {
    this.initializerContext.logger.get().debug('Stopping plugin');
  }
}
exports.SharePlugin = SharePlugin;