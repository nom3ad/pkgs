"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExpressionType = void 0;
var _get_type = require("./get_type");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */ /*
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
class ExpressionType {
  constructor(definition) {
    this.definition = definition;
    _defineProperty(this, "name", void 0);
    /**
     * A short help text.
     */
    _defineProperty(this, "help", void 0);
    /**
     * Type validation, useful for checking function output.
     */
    _defineProperty(this, "validate", void 0);
    _defineProperty(this, "create", void 0);
    /**
     * Optional serialization (used when passing context around client/server).
     */
    _defineProperty(this, "serialize", void 0);
    _defineProperty(this, "deserialize", void 0);
    _defineProperty(this, "getToFn", typeName => !this.definition.to ? undefined : this.definition.to[typeName] || this.definition.to['*']);
    _defineProperty(this, "getFromFn", typeName => !this.definition.from ? undefined : this.definition.from[typeName] || this.definition.from['*']);
    _defineProperty(this, "castsTo", value => typeof this.getToFn(value) === 'function');
    _defineProperty(this, "castsFrom", value => typeof this.getFromFn(value) === 'function');
    _defineProperty(this, "to", (value, toTypeName, types) => {
      const typeName = (0, _get_type.getType)(value);
      if (typeName !== this.name) {
        throw new Error(`Can not cast object of type '${typeName}' using '${this.name}'`);
      } else if (!this.castsTo(toTypeName)) {
        throw new Error(`Can not cast '${typeName}' to '${toTypeName}'`);
      }
      return this.getToFn(toTypeName)(value, types);
    });
    _defineProperty(this, "from", (value, types) => {
      const typeName = (0, _get_type.getType)(value);
      if (!this.castsFrom(typeName)) {
        throw new Error(`Can not cast '${this.name}' from ${typeName}`);
      }
      return this.getFromFn(typeName)(value, types);
    });
    const {
      name,
      help,
      deserialize,
      serialize,
      validate
    } = definition;
    this.name = name;
    this.help = help || '';
    this.validate = validate || (() => {});

    // Optional
    this.create = definition.create;
    this.serialize = serialize;
    this.deserialize = deserialize;
  }
}
exports.ExpressionType = ExpressionType;