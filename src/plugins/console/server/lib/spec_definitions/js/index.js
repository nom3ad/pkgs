"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsSpecLoaders = void 0;
var _aggregations = require("./aggregations");
var _aliases = require("./aliases");
var _document = require("./document");
var _filter = require("./filter");
var _globals = require("./globals");
var _ingest = require("./ingest");
var _mappings = require("./mappings");
var _settings = require("./settings");
var _query = require("./query");
var _reindex = require("./reindex");
var _search = require("./search");
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

const jsSpecLoaders = exports.jsSpecLoaders = [_aggregations.aggs, _aliases.aliases, _document.document, _filter.filter, _globals.globals, _ingest.ingest, _mappings.mappings, _settings.settings, _query.query, _reindex.reindex, _search.search];