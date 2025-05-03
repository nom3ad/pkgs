"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runRoute = runRoute;
var _configSchema = require("@osd/config-schema");
var _bluebird = _interopRequireDefault(require("bluebird"));
var _lodash = _interopRequireDefault(require("lodash"));
var _chain_runner = _interopRequireDefault(require("../handlers/chain_runner.js"));
var _get_namespaced_settings = _interopRequireDefault(require("../lib/get_namespaced_settings"));
var _tl_config = _interopRequireDefault(require("../handlers/lib/tl_config"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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

// @ts-ignore

// @ts-ignore

// @ts-ignore

const timelineDefaults = (0, _get_namespaced_settings.default)();
function runRoute(router, {
  logger,
  getFunction,
  configManager,
  core
}) {
  router.post({
    path: '/api/timeline/run',
    validate: {
      body: _configSchema.schema.object({
        sheet: _configSchema.schema.arrayOf(_configSchema.schema.string()),
        extended: _configSchema.schema.maybe(_configSchema.schema.object({
          es: _configSchema.schema.object({
            filter: _configSchema.schema.object({
              bool: _configSchema.schema.object({
                filter: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.object({}, {
                  unknowns: 'allow'
                }))),
                must: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.object({}, {
                  unknowns: 'allow'
                }))),
                should: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.object({}, {
                  unknowns: 'allow'
                }))),
                must_not: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.object({}, {
                  unknowns: 'allow'
                })))
              })
            })
          })
        })),
        time: _configSchema.schema.maybe(_configSchema.schema.object({
          from: _configSchema.schema.maybe(_configSchema.schema.string()),
          interval: _configSchema.schema.string(),
          timezone: _configSchema.schema.string(),
          to: _configSchema.schema.maybe(_configSchema.schema.string())
        }))
      })
    }
  }, router.handleLegacyErrors(async (context, request, response) => {
    try {
      const uiSettings = await context.core.uiSettings.client.getAll();
      const tlConfig = (0, _tl_config.default)({
        context,
        request,
        settings: _lodash.default.defaults(uiSettings, timelineDefaults),
        // Just in case they delete some setting.
        getFunction,
        getStartServices: core.getStartServices,
        allowedGraphiteUrls: configManager.getGraphiteAllowedUrls(),
        blockedGraphiteIPs: configManager.getGraphiteBlockedIPs(),
        opensearchShardTimeout: configManager.getOpenSearchShardTimeout(),
        savedObjectsClient: context.core.savedObjects.client
      });
      const chainRunner = (0, _chain_runner.default)(tlConfig);
      const sheet = await _bluebird.default.all(chainRunner.processRequest(request.body));
      return response.ok({
        body: {
          sheet,
          stats: chainRunner.getStats()
        }
      });
    } catch (err) {
      logger.error(`${err.toString()}: ${err.stack}`);
      // TODO Maybe we should just replace everywhere we throw with Boom? Probably.
      if (err.isBoom) {
        throw err;
      } else {
        return response.internalError({
          body: {
            attributes: {
              title: err.name
            },
            message: err.message
          }
        });
      }
    }
  }));
}