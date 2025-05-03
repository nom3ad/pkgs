"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExpressionFunctionParameter = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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