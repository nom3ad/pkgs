"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerRoutes = registerRoutes;
var _get = require("./get");
var _create = require("./create");
var _delete = require("./delete");
var _find = require("./find");
var _update = require("./update");
var _bulk_get = require("./bulk_get");
var _bulk_create = require("./bulk_create");
var _bulk_update = require("./bulk_update");
var _log_legacy_import = require("./log_legacy_import");
var _export = require("./export");
var _import = require("./import");
var _resolve_import_errors = require("./resolve_import_errors");
var _migrate = require("./migrate");
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

function registerRoutes({
  http,
  logger,
  config,
  migratorPromise
}) {
  const router = http.createRouter('/api/saved_objects/');
  (0, _get.registerGetRoute)(router);
  (0, _create.registerCreateRoute)(router);
  (0, _delete.registerDeleteRoute)(router);
  (0, _find.registerFindRoute)(router);
  (0, _update.registerUpdateRoute)(router);
  (0, _bulk_get.registerBulkGetRoute)(router);
  (0, _bulk_create.registerBulkCreateRoute)(router);
  (0, _bulk_update.registerBulkUpdateRoute)(router);
  (0, _log_legacy_import.registerLogLegacyImportRoute)(router, logger);
  (0, _export.registerExportRoute)(router, config);
  (0, _import.registerImportRoute)(router, config);
  (0, _resolve_import_errors.registerResolveImportErrorsRoute)(router, config);
  const internalRouter = http.createRouter('/internal/saved_objects/');
  (0, _migrate.registerMigrateRoute)(internalRouter, migratorPromise);
}