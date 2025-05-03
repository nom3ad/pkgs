"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSearchDsl = getSearchDsl;
var _boom = _interopRequireDefault(require("@hapi/boom"));
var _query_params = require("./query_params");
var _sorting_params = require("./sorting_params");
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

function getSearchDsl(mappings, registry, options) {
  const {
    type,
    search,
    defaultSearchOperator,
    searchFields,
    rootSearchFields,
    sortField,
    sortOrder,
    namespaces,
    typeToNamespacesMap,
    hasReference,
    kueryNode,
    workspaces,
    workspacesSearchOperator,
    ACLSearchParams
  } = options;
  if (!type) {
    throw _boom.default.notAcceptable('type must be specified');
  }
  if (sortOrder && !sortField) {
    throw _boom.default.notAcceptable('sortOrder requires a sortField');
  }
  return {
    ...(0, _query_params.getQueryParams)({
      registry,
      namespaces,
      type,
      typeToNamespacesMap,
      search,
      searchFields,
      rootSearchFields,
      defaultSearchOperator,
      hasReference,
      kueryNode,
      workspaces,
      workspacesSearchOperator,
      ACLSearchParams
    }),
    ...(0, _sorting_params.getSortingParams)(mappings, type, sortField, sortOrder)
  };
}