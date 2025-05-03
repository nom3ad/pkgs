"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildNode = buildNode;
exports.buildNodeWithArgumentNodes = buildNodeWithArgumentNodes;
exports.toOpenSearchQuery = toOpenSearchQuery;
var _lodash = _interopRequireDefault(require("lodash"));
var _functions = require("../functions");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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

function buildNode(functionName, ...args) {
  const kueryFunction = _functions.functions[functionName];
  if (_lodash.default.isUndefined(kueryFunction)) {
    throw new Error(`Unknown function "${functionName}"`);
  }
  return {
    type: 'function',
    function: functionName,
    // This requires better typing of the different typings and their return types.
    // @ts-ignore
    ...kueryFunction.buildNodeParams(...args)
  };
}

// Mainly only useful in the grammar where we'll already have real argument nodes in hand
function buildNodeWithArgumentNodes(functionName, args) {
  if (_lodash.default.isUndefined(_functions.functions[functionName])) {
    throw new Error(`Unknown function "${functionName}"`);
  }
  return {
    type: 'function',
    function: functionName,
    arguments: args
  };
}
function toOpenSearchQuery(node, indexPattern, config, context) {
  const kueryFunction = _functions.functions[node.function];
  return kueryFunction.toOpenSearchQuery(node, indexPattern, config, context);
}