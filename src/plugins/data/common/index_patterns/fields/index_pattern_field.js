"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IndexPatternField = void 0;
var _osd_field_types = require("../../osd_field_types");
var _types = require("../../osd_field_types/types");
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
class IndexPatternField {
  constructor(spec, displayName) {
    _defineProperty(this, "spec", void 0);
    // not writable or serialized
    _defineProperty(this, "displayName", void 0);
    _defineProperty(this, "osdFieldType", void 0);
    this.spec = {
      ...spec,
      type: spec.name === '_source' ? '_source' : spec.type
    };
    this.displayName = displayName;
    this.osdFieldType = (0, _osd_field_types.getOsdFieldType)(spec.type);
  }

  // writable attrs
  /**
   * Count is used for field popularity
   */
  get count() {
    return this.spec.count || 0;
  }
  set count(count) {
    this.spec.count = count;
  }

  /**
   * Script field code
   */
  get script() {
    return this.spec.script;
  }
  set script(script) {
    this.spec.script = script;
  }

  /**
   * Script field language
   */
  get lang() {
    return this.spec.lang;
  }
  set lang(lang) {
    this.spec.lang = lang;
  }

  /**
   * Description of field type conflicts across different indices in the same index pattern
   */
  get conflictDescriptions() {
    return this.spec.conflictDescriptions;
  }
  set conflictDescriptions(conflictDescriptions) {
    this.spec.conflictDescriptions = conflictDescriptions;
  }

  // read only attrs
  get name() {
    return this.spec.name;
  }
  get type() {
    return this.spec.type;
  }
  get esTypes() {
    return this.spec.esTypes;
  }
  get scripted() {
    return !!this.spec.scripted;
  }
  get searchable() {
    return !!(this.spec.searchable || this.scripted);
  }
  get aggregatable() {
    return !!(this.spec.aggregatable || this.scripted);
  }
  get readFromDocValues() {
    return !!(this.spec.readFromDocValues && !this.scripted);
  }
  get subType() {
    return this.spec.subType;
  }

  // not writable, not serialized
  get sortable() {
    return this.name === '_score' || (this.spec.indexed || this.aggregatable) && this.osdFieldType.sortable;
  }
  get filterable() {
    if ((0, _osd_field_types.getOsdFieldOverrides)().filterable !== undefined) return !!(0, _osd_field_types.getOsdFieldOverrides)().filterable;
    return this.name === '_id' || this.scripted || (this.spec.indexed || this.searchable) && this.osdFieldType.filterable;
  }
  get visualizable() {
    if ((0, _osd_field_types.getOsdFieldOverrides)().visualizable !== undefined) return !!(0, _osd_field_types.getOsdFieldOverrides)().visualizable;
    const notVisualizableFieldTypes = [_types.OSD_FIELD_TYPES.UNKNOWN, _types.OSD_FIELD_TYPES.CONFLICT];
    return this.aggregatable && !notVisualizableFieldTypes.includes(this.spec.type);
  }
  toJSON() {
    return {
      count: this.count,
      script: this.script,
      lang: this.lang,
      conflictDescriptions: this.conflictDescriptions,
      name: this.name,
      type: this.type,
      esTypes: this.esTypes,
      scripted: this.scripted,
      searchable: this.searchable,
      aggregatable: this.aggregatable,
      readFromDocValues: this.readFromDocValues,
      subType: this.subType
    };
  }
  toSpec({
    getFormatterForField
  } = {}) {
    return {
      count: this.count,
      script: this.script,
      lang: this.lang,
      conflictDescriptions: this.conflictDescriptions,
      name: this.name,
      type: this.type,
      esTypes: this.esTypes,
      scripted: this.scripted,
      searchable: this.searchable,
      aggregatable: this.aggregatable,
      readFromDocValues: this.readFromDocValues,
      subType: this.subType,
      format: getFormatterForField ? getFormatterForField(this).toJSON() : undefined
    };
  }
}
exports.IndexPatternField = IndexPatternField;