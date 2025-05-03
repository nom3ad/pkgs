"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerSetManyRoute = registerSetManyRoute;
var _configSchema = require("@osd/config-schema");
var _saved_objects = require("../../saved_objects");
var _ui_settings_errors = require("../ui_settings_errors");
var _types = require("../types");
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

const validate = {
  body: _configSchema.schema.object({
    changes: _configSchema.schema.object({}, {
      unknowns: 'allow'
    })
  }),
  query: _configSchema.schema.object({
    scope: _configSchema.schema.maybe(_configSchema.schema.oneOf([_configSchema.schema.literal(_types.UiSettingScope.GLOBAL), _configSchema.schema.literal(_types.UiSettingScope.USER)]))
  }, {
    unknowns: 'allow'
  })
};
function registerSetManyRoute(router) {
  router.post({
    path: '/api/opensearch-dashboards/settings',
    validate
  }, async (context, request, response) => {
    try {
      const uiSettingsClient = context.core.uiSettings.client;
      const {
        changes
      } = request.body;
      const {
        scope
      } = request.query;
      await uiSettingsClient.setMany(changes, scope);
      return response.ok({
        body: {
          settings: await uiSettingsClient.getUserProvided(scope)
        }
      });
    } catch (error) {
      if (_saved_objects.SavedObjectsErrorHelpers.isSavedObjectsClientError(error)) {
        return response.customError({
          body: error,
          statusCode: error.output.statusCode
        });
      }
      if (error instanceof _ui_settings_errors.CannotOverrideError || error instanceof _configSchema.ValidationError) {
        return response.badRequest({
          body: error
        });
      }
      throw error;
    }
  });
}