"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildNodeParams = buildNodeParams;
exports.toOpenSearchQuery = toOpenSearchQuery;
var _lodash = _interopRequireDefault(require("lodash"));
var _node_types = require("../node_types");
var ast = _interopRequireWildcard(require("../ast"));
var _filters = require("../../filters");
var _get_fields = require("./utils/get_fields");
var _utils = require("../../utils");
var _get_full_field_name_node = require("./utils/get_full_field_name_node");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
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

function buildNodeParams(fieldName, params) {
  const paramsToMap = _lodash.default.pick(params, 'gt', 'lt', 'gte', 'lte', 'format');
  const fieldNameArg = typeof fieldName === 'string' ? ast.fromLiteralExpression(fieldName) : _node_types.nodeTypes.literal.buildNode(fieldName);
  const args = _lodash.default.map(paramsToMap, (value, key) => {
    return _node_types.nodeTypes.namedArg.buildNode(key, value);
  });
  return {
    arguments: [fieldNameArg, ...args]
  };
}
function toOpenSearchQuery(node, indexPattern, config = {}, context = {}) {
  const [fieldNameArg, ...args] = node.arguments;
  const fullFieldNameArg = (0, _get_full_field_name_node.getFullFieldNameNode)(fieldNameArg, indexPattern, context !== null && context !== void 0 && context.nested ? context.nested.path : undefined);
  const fields = indexPattern ? (0, _get_fields.getFields)(fullFieldNameArg, indexPattern) : [];
  const namedArgs = extractArguments(args);
  const queryParams = _lodash.default.mapValues(namedArgs, arg => {
    return ast.toOpenSearchQuery(arg);
  });

  // If no fields are found in the index pattern we send through the given field name as-is. We do this to preserve
  // the behaviour of lucene on dashboards where there are panels based on different index patterns that have different
  // fields. If a user queries on a field that exists in one pattern but not the other, the index pattern without the
  // field should return no results. It's debatable whether this is desirable, but it's been that way forever, so we'll
  // keep things familiar for now.
  if (fields && fields.length === 0) {
    fields.push({
      name: ast.toOpenSearchQuery(fullFieldNameArg),
      scripted: false,
      type: ''
    });
  }
  const queries = fields.map(field => {
    const wrapWithNestedQuery = query => {
      // Wildcards can easily include nested and non-nested fields. There isn't a good way to let
      // users handle this themselves so we automatically add nested queries in this scenario.
      if (!(fullFieldNameArg.type === 'wildcard') || !_lodash.default.get(field, 'subType.nested') || context.nested) {
        return query;
      } else {
        return {
          nested: {
            path: field.subType.nested.path,
            query,
            score_mode: 'none'
          }
        };
      }
    };
    if (field.scripted) {
      return {
        script: (0, _filters.getRangeScript)(field, queryParams)
      };
    } else if (field.type === 'date') {
      const timeZoneParam = config.dateFormatTZ ? {
        time_zone: (0, _utils.getTimeZoneFromSettings)(config.dateFormatTZ)
      } : {};
      return wrapWithNestedQuery({
        range: {
          [field.name]: {
            ...queryParams,
            ...timeZoneParam
          }
        }
      });
    }
    return wrapWithNestedQuery({
      range: {
        [field.name]: queryParams
      }
    });
  });
  return {
    bool: {
      should: queries,
      minimum_should_match: 1
    }
  };
}
function extractArguments(args) {
  if (args.gt && args.gte || args.lt && args.lte) {
    throw new Error('range ends cannot be both inclusive and exclusive');
  }
  const unnamedArgOrder = ['gte', 'lte', 'format'];
  return args.reduce((acc, arg, index) => {
    if (arg.type === 'namedArg') {
      acc[arg.name] = arg.value;
    } else {
      acc[unnamedArgOrder[index]] = arg;
    }
    return acc;
  }, {});
}