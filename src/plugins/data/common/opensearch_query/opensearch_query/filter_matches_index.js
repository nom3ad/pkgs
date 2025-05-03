"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterMatchesIndex = filterMatchesIndex;
var _lodash = require("lodash");
var _lucene = require("lucene");
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

const implicitLuceneField = '<implicit>';
function getLuceneFields(ast) {
  const fields = [];

  // Parse left side of AST (if it exists)
  if ('left' in ast && ast.left) {
    if ('field' in ast.left) {
      if (ast.left.field && ast.left.field !== implicitLuceneField) {
        fields.push(ast.left.field);
      }
    } else {
      fields.push(...getLuceneFields(ast.left));
    }
  }

  // Parse right side of AST (if it exists)
  if ('right' in ast && ast.right) {
    if ('field' in ast.right) {
      if (ast.right.field && ast.right.field !== implicitLuceneField) {
        fields.push(ast.right.field);
      }
    } else {
      fields.push(...getLuceneFields(ast.right));
    }
  }
  return fields;
}
function filterMatchesIndex(filter, indexPattern) {
  var _filter$meta, _filter$meta2, _filter$meta3;
  if (!((_filter$meta = filter.meta) !== null && _filter$meta !== void 0 && _filter$meta.key) || !indexPattern) {
    return true;
  }
  if (((_filter$meta2 = filter.meta) === null || _filter$meta2 === void 0 ? void 0 : _filter$meta2.type) === 'query_string') {
    const qsFilter = filter;
    try {
      const ast = (0, _lucene.parse)(qsFilter.query.query_string.query);
      const filterFields = (0, _lodash.uniq)(getLuceneFields(ast));
      return filterFields.every(filterField => indexPattern.fields.some(field => field.name === filterField));
    } catch {
      return false;
    }
  }
  if (((_filter$meta3 = filter.meta) === null || _filter$meta3 === void 0 ? void 0 : _filter$meta3.type) === 'custom') {
    return filter.meta.index === indexPattern.id;
  }
  return indexPattern.fields.some(field => field.name === filter.meta.key);
}