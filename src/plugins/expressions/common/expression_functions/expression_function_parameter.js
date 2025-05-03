"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExpressionFunctionParameter = void 0;
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
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

class ExpressionFunctionParameter {
  constructor(name, arg) {
    _defineProperty(this, "name", void 0);
    _defineProperty(this, "required", void 0);
    _defineProperty(this, "help", void 0);
    _defineProperty(this, "types", void 0);
    _defineProperty(this, "default", void 0);
    _defineProperty(this, "aliases", void 0);
    _defineProperty(this, "multi", void 0);
    _defineProperty(this, "resolve", void 0);
    _defineProperty(this, "options", void 0);
    const {
      required,
      help,
      types,
      aliases,
      multi,
      resolve,
      options
    } = arg;
    if (name === '_') {
      throw Error('Arg names must not be _. Use it in aliases instead.');
    }
    this.name = name;
    this.required = !!required;
    this.help = help || '';
    this.types = types || [];
    this.default = arg.default;
    this.aliases = aliases || [];
    this.multi = !!multi;
    this.resolve = resolve == null ? true : resolve;
    this.options = options || [];
  }
  accepts(type) {
    if (!this.types.length) return true;
    return this.types.indexOf(type) > -1;
  }
}
exports.ExpressionFunctionParameter = ExpressionFunctionParameter;