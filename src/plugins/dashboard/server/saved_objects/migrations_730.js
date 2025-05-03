"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.migrations730 = void 0;
var _util = require("util");
var _is_dashboard_doc = require("./is_dashboard_doc");
var _move_filters_to_query = require("./move_filters_to_query");
var _common = require("../../common");
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

const migrations730 = (doc, {
  log
}) => {
  if (!(0, _is_dashboard_doc.isDashboardDoc)(doc)) {
    // NOTE: we should probably throw an error here... but for now following suit and in the
    // case of errors, just returning the same document.
    return doc;
  }
  try {
    const searchSource = JSON.parse(doc.attributes.kibanaSavedObjectMeta.searchSourceJSON);
    doc.attributes.kibanaSavedObjectMeta.searchSourceJSON = JSON.stringify((0, _move_filters_to_query.moveFiltersToQuery)(searchSource));
  } catch (e) {
    log.warning(`Exception @ migrations730 while trying to migrate dashboard query filters!\n` + `${e.stack}\n` + `dashboard: ${(0, _util.inspect)(doc, false, null)}`);
    return doc;
  }
  let uiState = {};
  // Ignore errors, at some point uiStateJSON stopped being used, so it may not exist.
  if (doc.attributes.uiStateJSON && doc.attributes.uiStateJSON !== '') {
    uiState = JSON.parse(doc.attributes.uiStateJSON);
  }
  try {
    const panels = JSON.parse(doc.attributes.panelsJSON);
    doc.attributes.panelsJSON = JSON.stringify((0, _common.migratePanelsTo730)(panels, '7.3.0', doc.attributes.useMargins === undefined ? true : doc.attributes.useMargins, uiState));
    delete doc.attributes.uiStateJSON;
  } catch (e) {
    log.warning(`Exception @ migrations730 while trying to migrate dashboard panels!\n` + `Error: ${e.stack}\n` + `dashboard: ${(0, _util.inspect)(doc, false, null)}`);
    return doc;
  }
  return doc;
};
exports.migrations730 = migrations730;