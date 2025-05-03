"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Plugin = exports.DataServerPlugin = void 0;
var _index_patterns = require("./index_patterns");
var _search_service = require("./search/search_service");
var _query_service = require("./query/query_service");
var _scripts = require("./scripts");
var _dql_telemetry = require("./dql_telemetry");
var _autocomplete = require("./autocomplete");
var _field_formats = require("./field_formats");
var _ui_settings = require("./ui_settings");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */ /*
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
// eslint-disable-next-line @typescript-eslint/no-empty-interface

class DataServerPlugin {
  constructor(initializerContext) {
    _defineProperty(this, "searchService", void 0);
    _defineProperty(this, "scriptsService", void 0);
    _defineProperty(this, "dqlTelemetryService", void 0);
    _defineProperty(this, "autocompleteService", void 0);
    _defineProperty(this, "indexPatterns", new _index_patterns.IndexPatternsService());
    _defineProperty(this, "fieldFormats", new _field_formats.FieldFormatsService());
    _defineProperty(this, "queryService", new _query_service.QueryService());
    _defineProperty(this, "logger", void 0);
    this.logger = initializerContext.logger.get('data');
    this.searchService = new _search_service.SearchService(initializerContext, this.logger);
    this.scriptsService = new _scripts.ScriptsService();
    this.dqlTelemetryService = new _dql_telemetry.DqlTelemetryService(initializerContext);
    this.autocompleteService = new _autocomplete.AutocompleteService(initializerContext);
  }
  async setup(core, {
    expressions,
    usageCollection,
    dataSource
  }) {
    this.indexPatterns.setup(core);
    this.scriptsService.setup(core);
    this.queryService.setup(core);
    this.autocompleteService.setup(core);
    this.dqlTelemetryService.setup(core, {
      usageCollection
    });
    core.uiSettings.register((0, _ui_settings.getUiSettings)());
    const searchSetup = await this.searchService.setup(core, {
      registerFunction: expressions.registerFunction,
      usageCollection,
      dataSource
    });
    return {
      __enhance: enhancements => {
        searchSetup.__enhance(enhancements.search);
      },
      search: searchSetup,
      fieldFormats: this.fieldFormats.setup()
    };
  }
  start(core) {
    const fieldFormats = this.fieldFormats.start();
    const indexPatterns = this.indexPatterns.start(core, {
      fieldFormats,
      logger: this.logger.get('indexPatterns')
    });
    return {
      fieldFormats,
      indexPatterns,
      search: this.searchService.start(core, {
        fieldFormats,
        indexPatterns
      })
    };
  }
  stop() {
    this.searchService.stop();
  }
}
exports.Plugin = exports.DataServerPlugin = DataServerPlugin;