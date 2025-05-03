"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSearchSource = void 0;
var _migrate_legacy_query = require("./migrate_legacy_query");
var _search_source = require("./search_source");
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

/**
 * Deserializes a json string and a set of referenced objects to a `SearchSource` instance.
 * Use this method to re-create the search source serialized using `searchSource.serialize`.
 *
 * This function is a factory function that returns the actual utility when calling it with the
 * required service dependency (index patterns contract). A pre-wired version is also exposed in
 * the start contract of the data plugin as part of the search service
 *
 * @param indexPatterns The index patterns contract of the data plugin
 * @param searchSourceDependencies
 *
 * @return Wired utility function taking two parameters `searchSourceJson`, the json string
 * returned by `serializeSearchSource` and `references`, a list of references including the ones
 * returned by `serializeSearchSource`.
 *
 *
 * @public */
const createSearchSource = (indexPatterns, searchSourceDependencies) => async (searchSourceFields = {}) => {
  const fields = {
    ...searchSourceFields
  };

  // hydrating index pattern
  if (fields.index && typeof fields.index === 'string') {
    fields.index = await indexPatterns.get(searchSourceFields.index);
  }
  const searchSource = new _search_source.SearchSource(fields, searchSourceDependencies);

  // todo: move to migration script .. create issue
  const query = searchSource.getOwnField('query');
  if (typeof query !== 'undefined') {
    searchSource.setField('query', (0, _migrate_legacy_query.migrateLegacyQuery)(query));
  }
  return searchSource;
};
exports.createSearchSource = createSearchSource;