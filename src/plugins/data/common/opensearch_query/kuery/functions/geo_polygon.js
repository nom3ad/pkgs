"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildNodeParams = buildNodeParams;
exports.toOpenSearchQuery = toOpenSearchQuery;
var _node_types = require("../node_types");
var ast = _interopRequireWildcard(require("../ast"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
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

function buildNodeParams(fieldName, points) {
  const fieldNameArg = _node_types.nodeTypes.literal.buildNode(fieldName);
  const args = points.map(point => {
    const latLon = `${point.lat}, ${point.lon}`;
    return _node_types.nodeTypes.literal.buildNode(latLon);
  });
  return {
    arguments: [fieldNameArg, ...args]
  };
}
function toOpenSearchQuery(node, indexPattern, config = {}, context = {}) {
  var _indexPattern$fields;
  const [fieldNameArg, ...points] = node.arguments;
  const fullFieldNameArg = {
    ...fieldNameArg,
    value: context !== null && context !== void 0 && context.nested ? `${context.nested.path}.${fieldNameArg.value}` : fieldNameArg.value
  };
  const fieldName = _node_types.nodeTypes.literal.toOpenSearchQuery(fullFieldNameArg);
  const fieldList = (_indexPattern$fields = indexPattern === null || indexPattern === void 0 ? void 0 : indexPattern.fields) !== null && _indexPattern$fields !== void 0 ? _indexPattern$fields : [];
  const field = fieldList.find(fld => fld.name === fieldName);
  const queryParams = {
    points: points.map(point => {
      return ast.toOpenSearchQuery(point, indexPattern, config, context);
    })
  };
  if (field !== null && field !== void 0 && field.scripted) {
    throw new Error(`Geo polygon query does not support scripted fields`);
  }
  return {
    geo_polygon: {
      [fieldName]: queryParams,
      ignore_unmapped: true
    }
  };
}