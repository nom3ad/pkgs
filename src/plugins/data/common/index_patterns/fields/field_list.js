"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fieldList = void 0;
var _lodash = require("lodash");
var _index_pattern_field = require("./index_pattern_field");
var _utils = require("../../utils");
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
// extending the array class and using a constructor doesn't work well
// when calling filter and similar so wrapping in a callback.
// to be removed in the future
const fieldList = (specs = [], shortDotsEnable = false) => {
  class FldList extends Array {
    constructor() {
      super();
      _defineProperty(this, "byName", new Map());
      _defineProperty(this, "groups", new Map());
      _defineProperty(this, "setByName", field => this.byName.set(field.name, field));
      _defineProperty(this, "setByGroup", field => {
        if (typeof this.groups.get(field.type) === 'undefined') {
          this.groups.set(field.type, new Map());
        }
        this.groups.get(field.type).set(field.name, field);
      });
      _defineProperty(this, "removeByGroup", field => this.groups.get(field.type).delete(field.name));
      _defineProperty(this, "calcDisplayName", name => shortDotsEnable ? (0, _utils.shortenDottedString)(name) : name);
      _defineProperty(this, "getAll", () => [...this.byName.values()]);
      _defineProperty(this, "getByName", name => this.byName.get(name));
      _defineProperty(this, "getByType", type => [...(this.groups.get(type) || new Map()).values()]);
      _defineProperty(this, "add", field => {
        const newField = new _index_pattern_field.IndexPatternField(field, this.calcDisplayName(field.name));
        this.push(newField);
        this.setByName(newField);
        this.setByGroup(newField);
      });
      _defineProperty(this, "remove", field => {
        this.removeByGroup(field);
        this.byName.delete(field.name);
        const fieldIndex = (0, _lodash.findIndex)(this, {
          name: field.name
        });
        this.splice(fieldIndex, 1);
      });
      _defineProperty(this, "update", field => {
        const newField = new _index_pattern_field.IndexPatternField(field, this.calcDisplayName(field.name));
        const index = this.findIndex(f => f.name === newField.name);
        this.splice(index, 1, newField);
        this.setByName(newField);
        this.removeByGroup(newField);
        this.setByGroup(newField);
      });
      _defineProperty(this, "removeAll", () => {
        this.length = 0;
        this.byName.clear();
        this.groups.clear();
      });
      _defineProperty(this, "replaceAll", (spcs = []) => {
        this.removeAll();
        spcs.forEach(this.add);
      });
      specs.map(field => this.add(field));
    }
    toSpec({
      getFormatterForField
    } = {}) {
      return {
        ...this.reduce((collector, field) => {
          collector[field.name] = field.toSpec({
            getFormatterForField
          });
          return collector;
        }, {})
      };
    }
  }
  return new FldList();
};
exports.fieldList = fieldList;