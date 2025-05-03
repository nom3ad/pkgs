"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildExpression = buildExpression;
exports.isExpressionAst = isExpressionAst;
exports.isExpressionAstBuilder = isExpressionAstBuilder;
var _build_function = require("./build_function");
var _format = require("./format");
var _parse = require("./parse");
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
 * Type guard that checks whether a given value is an
 * `ExpressionAstExpressionBuilder`. This is useful when working
 * with subexpressions, where you might be retrieving a function
 * argument, and need to know whether it is an expression builder
 * instance which you can perform operations on.
 *
 * @example
 * const arg = myFunction.getArgument('foo');
 * if (isExpressionAstBuilder(foo)) {
 *   foo.toAst();
 * }
 *
 * @param val Value you want to check.
 * @return boolean
 */
function isExpressionAstBuilder(val) {
  return (val === null || val === void 0 ? void 0 : val.type) === 'expression_builder';
}

/** @internal */
function isExpressionAst(val) {
  return (val === null || val === void 0 ? void 0 : val.type) === 'expression';
}
const generateExpressionAst = fns => ({
  type: 'expression',
  chain: fns.map(fn => fn.toAst())
});

/**
 * Makes it easy to progressively build, update, and traverse an
 * expression AST. You can either start with an empty AST, or
 * provide an expression string, AST, or array of expression
 * function builders to use as initial state.
 *
 * @param initialState Optional. An expression string, AST, or array of `ExpressionAstFunctionBuilder[]`.
 * @return `this`
 */
function buildExpression(initialState) {
  const chainToFunctionBuilder = chain => chain.map(fn => (0, _build_function.buildExpressionFunction)(fn.function, fn.arguments));

  // Takes `initialState` and converts it to an array of `ExpressionAstFunctionBuilder`
  const extractFunctionsFromState = state => {
    if (typeof state === 'string') {
      return chainToFunctionBuilder((0, _parse.parse)(state, 'expression').chain);
    } else if (!Array.isArray(state)) {
      // If it isn't an array, it is an `ExpressionAstExpression`
      return chainToFunctionBuilder(state.chain);
    }
    return state;
  };
  const fns = initialState ? extractFunctionsFromState(initialState) : [];
  return {
    type: 'expression_builder',
    functions: fns,
    findFunction(fnName) {
      const foundFns = [];
      return fns.reduce((found, currFn) => {
        Object.values(currFn.arguments).forEach(values => {
          values.forEach(value => {
            if (isExpressionAstBuilder(value)) {
              // `value` is a subexpression, recurse and continue searching
              found = found.concat(value.findFunction(fnName));
            }
          });
        });
        if (currFn.name === fnName) {
          found.push(currFn);
        }
        return found;
      }, foundFns);
    },
    toAst() {
      if (fns.length < 1) {
        throw new Error('Functions have not been added to the expression builder');
      }
      return generateExpressionAst(fns);
    },
    toString() {
      if (fns.length < 1) {
        throw new Error('Functions have not been added to the expression builder');
      }
      return (0, _format.format)(generateExpressionAst(fns), 'expression');
    }
  };
}