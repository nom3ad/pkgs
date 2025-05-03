"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IndexPatternsService = void 0;
var _routes = require("./routes");
var _saved_objects = require("../saved_objects");
var _capabilities_provider = require("./capabilities_provider");
var _index_patterns = require("../../common/index_patterns");
var _ui_settings_wrapper = require("./ui_settings_wrapper");
var _index_patterns_api_client = require("./index_patterns_api_client");
var _saved_objects_client_wrapper = require("./saved_objects_client_wrapper");
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

class IndexPatternsService {
  setup(core) {
    core.savedObjects.registerType(_saved_objects.indexPatternSavedObjectType);
    core.capabilities.registerProvider(_capabilities_provider.capabilitiesProvider);
    core.capabilities.registerSwitcher(async (request, capabilites) => {
      return await core.security.readonlyService().hideForReadonly(request, capabilites, {
        indexPatterns: {
          save: false
        }
      });
    });
    (0, _routes.registerRoutes)(core.http);
  }
  start(core, {
    fieldFormats,
    logger
  }) {
    const {
      uiSettings,
      savedObjects
    } = core;
    return {
      indexPatternsServiceFactory: async opensearchDashboardsRequest => {
        const savedObjectsClient = savedObjects.getScopedClient(opensearchDashboardsRequest);
        const uiSettingsClient = uiSettings.asScopedToClient(savedObjectsClient);
        const formats = await fieldFormats.fieldFormatServiceFactory(uiSettingsClient);
        return new _index_patterns.IndexPatternsService({
          uiSettings: new _ui_settings_wrapper.UiSettingsServerToCommon(uiSettingsClient),
          savedObjectsClient: new _saved_objects_client_wrapper.SavedObjectsClientServerToCommon(savedObjectsClient),
          apiClient: new _index_patterns_api_client.IndexPatternsApiServer(),
          fieldFormats: formats,
          onError: error => {
            logger.error(error);
          },
          onNotification: ({
            title,
            text
          }) => {
            logger.warn(`${title} : ${text}`);
          },
          onUnsupportedTimePattern: ({
            index,
            title
          }) => {
            logger.warn(`Currently querying all indices matching ${index}. ${title} should be migrated to a wildcard-based index pattern.`);
          }
        });
      }
    };
  }
}
exports.IndexPatternsService = IndexPatternsService;