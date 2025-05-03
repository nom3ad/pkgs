"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerExportRoute = void 0;
var _configSchema = require("@osd/config-schema");
var _jsonStableStringify = _interopRequireDefault(require("json-stable-stringify"));
var _streams = require("../../utils/streams");
var _export = require("../export");
var _utils = require("./utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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

const registerExportRoute = (router, config) => {
  const {
    maxImportExportSize
  } = config;
  router.post({
    path: '/_export',
    validate: {
      body: _configSchema.schema.object({
        type: _configSchema.schema.maybe(_configSchema.schema.oneOf([_configSchema.schema.string(), _configSchema.schema.arrayOf(_configSchema.schema.string())])),
        objects: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.object({
          type: _configSchema.schema.string(),
          id: _configSchema.schema.string()
        }), {
          maxSize: maxImportExportSize
        })),
        search: _configSchema.schema.maybe(_configSchema.schema.string()),
        includeReferencesDeep: _configSchema.schema.boolean({
          defaultValue: false
        }),
        excludeExportDetails: _configSchema.schema.boolean({
          defaultValue: false
        }),
        workspaces: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.string()))
      })
    }
  }, router.handleLegacyErrors(async (context, req, res) => {
    const savedObjectsClient = context.core.savedObjects.client;
    const {
      type,
      objects,
      search,
      excludeExportDetails,
      includeReferencesDeep,
      workspaces
    } = req.body;
    const types = typeof type === 'string' ? [type] : type;

    // need to access the registry for type validation, can't use the schema for this
    const supportedTypes = context.core.savedObjects.typeRegistry.getImportableAndExportableTypes().map(t => t.name);
    if (types) {
      const validationError = (0, _utils.validateTypes)(types, supportedTypes);
      if (validationError) {
        return res.badRequest({
          body: {
            message: validationError
          }
        });
      }
    }
    if (objects) {
      const validationError = (0, _utils.validateObjects)(objects, supportedTypes);
      if (validationError) {
        return res.badRequest({
          body: {
            message: validationError
          }
        });
      }
    }
    const exportStream = await (0, _export.exportSavedObjectsToStream)({
      savedObjectsClient,
      types,
      search,
      objects,
      exportSizeLimit: maxImportExportSize,
      includeReferencesDeep,
      excludeExportDetails,
      ...(workspaces ? {
        workspaces
      } : {})
    });
    const docsToExport = await (0, _streams.createPromiseFromStreams)([exportStream, (0, _streams.createMapStream)(obj => {
      return (0, _jsonStableStringify.default)(obj);
    }), (0, _streams.createConcatStream)([])]);
    return res.ok({
      body: docsToExport.join('\n'),
      headers: {
        'Content-Disposition': `attachment; filename="export.ndjson"`,
        'Content-Type': 'application/ndjson'
      }
    });
  }));
};
exports.registerExportRoute = registerExportRoute;