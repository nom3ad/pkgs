"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchMigrations = void 0;
var _lodash = require("lodash");
var _common = require("../../../data/common");
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
 * This migration script is related to:
 *   @link https://github.com/elastic/kibana/pull/62194
 *   @link https://github.com/elastic/kibana/pull/14644
 * This is only a problem when you import an object from 5.x into 6.x but to be sure that all saved objects migrated we should execute it twice in 6.7.2 and 7.9.3
 */
const migrateMatchAllQuery = doc => {
  const searchSourceJSON = (0, _lodash.get)(doc, 'attributes.kibanaSavedObjectMeta.searchSourceJSON');
  if (searchSourceJSON) {
    var _searchSource$query;
    let searchSource;
    try {
      searchSource = JSON.parse(searchSourceJSON);
    } catch (e) {
      // Let it go, the data is invalid and we'll leave it as is
      return doc;
    }
    if ((_searchSource$query = searchSource.query) !== null && _searchSource$query !== void 0 && _searchSource$query.match_all) {
      return {
        ...doc,
        attributes: {
          ...doc.attributes,
          kibanaSavedObjectMeta: {
            searchSourceJSON: JSON.stringify({
              ...searchSource,
              query: {
                query: '',
                language: _common.DEFAULT_QUERY_LANGUAGE
              }
            })
          }
        }
      };
    }
  }
  return doc;
};
const migrateIndexPattern = doc => {
  const searchSourceJSON = (0, _lodash.get)(doc, 'attributes.kibanaSavedObjectMeta.searchSourceJSON');
  if (typeof searchSourceJSON !== 'string') {
    return doc;
  }
  let searchSource;
  try {
    searchSource = JSON.parse(searchSourceJSON);
  } catch (e) {
    // Let it go, the data is invalid and we'll leave it as is
    return doc;
  }
  if (searchSource.index && Array.isArray(doc.references)) {
    searchSource.indexRefName = 'kibanaSavedObjectMeta.searchSourceJSON.index';
    doc.references.push({
      name: searchSource.indexRefName,
      type: 'index-pattern',
      id: searchSource.index
    });
    delete searchSource.index;
  }
  if (searchSource.filter) {
    searchSource.filter.forEach((filterRow, i) => {
      if (!filterRow.meta || !filterRow.meta.index || !Array.isArray(doc.references)) {
        return;
      }
      filterRow.meta.indexRefName = `kibanaSavedObjectMeta.searchSourceJSON.filter[${i}].meta.index`;
      doc.references.push({
        name: filterRow.meta.indexRefName,
        type: 'index-pattern',
        id: filterRow.meta.index
      });
      delete filterRow.meta.index;
    });
  }
  doc.attributes.kibanaSavedObjectMeta.searchSourceJSON = JSON.stringify(searchSource);
  return doc;
};
const setNewReferences = (doc, context) => {
  doc.references = doc.references || [];
  // Migrate index pattern
  return migrateIndexPattern(doc, context);
};
const migrateSearchSortToNestedArray = doc => {
  const sort = (0, _lodash.get)(doc, 'attributes.sort');
  if (!sort) return doc;

  // Don't do anything if we already have a two dimensional array
  if (Array.isArray(sort) && sort.length > 0 && Array.isArray(sort[0])) {
    return doc;
  }
  return {
    ...doc,
    attributes: {
      ...doc.attributes,
      sort: [doc.attributes.sort]
    }
  };
};
const searchMigrations = exports.searchMigrations = {
  '6.7.2': (0, _lodash.flow)(migrateMatchAllQuery),
  '7.0.0': (0, _lodash.flow)(setNewReferences),
  '7.4.0': (0, _lodash.flow)(migrateSearchSortToNestedArray),
  '7.9.3': (0, _lodash.flow)(migrateMatchAllQuery)
};