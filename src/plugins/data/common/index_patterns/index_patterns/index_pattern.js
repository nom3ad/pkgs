"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IndexPattern = void 0;
var _lodash = _interopRequireWildcard(require("lodash"));
var _common = require("../../../../opensearch_dashboards_utils/common");
var _common2 = require("../../../common");
var _fields = require("../fields");
var _flatten_hit = require("./flatten_hit");
var _format_hit = require("./format_hit");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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
const DATA_SOURCE_REFERNECE_NAME = 'dataSource';
class IndexPattern {
  constructor({
    spec = {},
    fieldFormats,
    shortDotsEnable = false,
    metaFields = []
  }) {
    _defineProperty(this, "id", void 0);
    _defineProperty(this, "title", '');
    _defineProperty(this, "fieldFormatMap", void 0);
    _defineProperty(this, "typeMeta", void 0);
    _defineProperty(this, "fields", void 0);
    _defineProperty(this, "timeFieldName", void 0);
    _defineProperty(this, "intervalName", void 0);
    _defineProperty(this, "type", void 0);
    _defineProperty(this, "formatHit", void 0);
    _defineProperty(this, "formatField", void 0);
    _defineProperty(this, "flattenHit", void 0);
    _defineProperty(this, "metaFields", void 0);
    // savedObject version
    _defineProperty(this, "version", void 0);
    _defineProperty(this, "sourceFilters", void 0);
    _defineProperty(this, "dataSourceRef", void 0);
    _defineProperty(this, "fieldsLoading", void 0);
    _defineProperty(this, "originalSavedObjectBody", {});
    _defineProperty(this, "shortDotsEnable", false);
    _defineProperty(this, "fieldFormats", void 0);
    /**
     * Get last saved saved object fields
     */
    _defineProperty(this, "getOriginalSavedObjectBody", () => ({
      ...this.originalSavedObjectBody
    }));
    /**
     * Reset last saved saved object fields. used after saving
     */
    _defineProperty(this, "resetOriginalSavedObjectBody", () => {
      this.originalSavedObjectBody = this.getAsSavedObjectBody();
    });
    /**
     * Extracts FieldFormatMap from FieldSpec map
     * @param fldList FieldSpec map
     */
    _defineProperty(this, "fieldSpecsToFieldFormatMap", (fldList = {}) => Object.values(fldList).reduce((col, fieldSpec) => {
      if (fieldSpec.format) {
        col[fieldSpec.name] = {
          ...fieldSpec.format
        };
      }
      return col;
    }, {}));
    _defineProperty(this, "getSaveObjectReference", () => {
      return this.dataSourceRef ? [{
        id: this.dataSourceRef.id,
        type: this.dataSourceRef.type,
        name: DATA_SOURCE_REFERNECE_NAME
      }] : [];
    });
    _defineProperty(this, "setFieldsLoading", status => {
      return this.fieldsLoading = status;
    });
    // set dependencies
    this.fieldFormats = fieldFormats;
    // set config
    this.shortDotsEnable = shortDotsEnable;
    this.metaFields = metaFields;
    // initialize functionality
    this.fields = (0, _fields.fieldList)([], this.shortDotsEnable);
    this.flattenHit = (0, _flatten_hit.flattenHitWrapper)(this, metaFields);
    this.formatHit = (0, _format_hit.formatHitProvider)(this, fieldFormats.getDefaultInstance(_common2.OSD_FIELD_TYPES.STRING));
    this.formatField = this.formatHit.formatField;

    // set values
    this.id = spec.id;
    const fieldFormatMap = this.fieldSpecsToFieldFormatMap(spec.fields);
    this.version = spec.version;
    this.title = spec.title || '';
    this.timeFieldName = spec.timeFieldName;
    this.sourceFilters = spec.sourceFilters;
    this.fields.replaceAll(Object.values(spec.fields || {}));
    this.type = spec.type;
    this.typeMeta = spec.typeMeta;
    this.fieldFormatMap = _lodash.default.mapValues(fieldFormatMap, mapping => {
      return this.deserializeFieldFormatMap(mapping);
    });
    this.dataSourceRef = spec.dataSourceRef;
    this.fieldsLoading = spec.fieldsLoading;
  }
  /**
   * Converts field format spec to field format instance
   * @param mapping
   */
  deserializeFieldFormatMap(mapping) {
    try {
      return this.fieldFormats.getInstance(mapping.id, mapping.params);
    } catch (err) {
      if (err instanceof _common2.FieldFormatNotFoundError) {
        return undefined;
      } else {
        throw err;
      }
    }
  }
  getComputedFields() {
    const scriptFields = {};
    if (!this.fields) {
      return {
        storedFields: ['*'],
        scriptFields,
        docvalueFields: []
      };
    }

    // Date value returned in "_source" could be in any number of formats
    // Use a docvalue for each date field to ensure standardized formats when working with date fields
    // indexPattern.flattenHit will override "_source" values when the same field is also defined in "fields"
    const docvalueFields = (0, _lodash.reject)(this.fields.getByType('date'), 'scripted').map(dateField => {
      return {
        field: dateField.name,
        format: dateField.esTypes && dateField.esTypes.indexOf('date_nanos') !== -1 ? 'strict_date_time' : 'date_time'
      };
    });
    (0, _lodash.each)(this.getScriptedFields(), function (field) {
      scriptFields[field.name] = {
        script: {
          source: field.script,
          lang: field.lang
        }
      };
    });
    return {
      storedFields: ['*'],
      scriptFields,
      docvalueFields
    };
  }
  toSpec() {
    return {
      id: this.id,
      version: this.version,
      title: this.title,
      timeFieldName: this.timeFieldName,
      sourceFilters: this.sourceFilters,
      fields: this.fields.toSpec({
        getFormatterForField: this.getFormatterForField.bind(this)
      }),
      typeMeta: this.typeMeta,
      type: this.type,
      dataSourceRef: this.dataSourceRef
    };
  }

  /**
   * Get the source filtering configuration for that index.
   */
  getSourceFiltering() {
    return {
      excludes: this.sourceFilters && this.sourceFilters.map(filter => filter.value) || []
    };
  }

  /**
   * Add scripted field to field list
   *
   * @param name field name
   * @param script script code
   * @param fieldType
   * @param lang
   */
  async addScriptedField(name, script, fieldType = 'string') {
    const scriptedFields = this.getScriptedFields();
    const names = _lodash.default.map(scriptedFields, 'name');
    if (_lodash.default.includes(names, name)) {
      throw new _common.DuplicateField(name);
    }
    this.fields.add({
      name,
      script,
      type: fieldType,
      scripted: true,
      lang: 'painless',
      aggregatable: true,
      searchable: true,
      count: 0,
      readFromDocValues: false
    });
  }

  /**
   * Remove scripted field from field list
   * @param fieldName
   */

  removeScriptedField(fieldName) {
    const field = this.fields.getByName(fieldName);
    if (field) {
      this.fields.remove(field);
    }
  }
  getNonScriptedFields() {
    return [...this.fields.getAll().filter(field => !field.scripted)];
  }
  getScriptedFields() {
    return [...this.fields.getAll().filter(field => field.scripted)];
  }
  getIndex() {
    if (!this.isUnsupportedTimePattern()) {
      return this.title;
    }

    // Take a time-based interval index pattern title (like [foo-]YYYY.MM.DD[-bar]) and turn it
    // into the actual index (like foo-*-bar) by replacing anything not inside square brackets
    // with a *.
    const regex = /\[[^\]]*]/g; // Matches text inside brackets
    const splits = this.title.split(regex); // e.g. ['', 'YYYY.MM.DD', ''] from the above example
    const matches = this.title.match(regex) || []; // e.g. ['[foo-]', '[-bar]'] from the above example
    return splits.map((split, i) => {
      const match = i >= matches.length ? '' : matches[i].replace(/[\[\]]/g, '');
      return `${split.length ? '*' : ''}${match}`;
    }).join('');
  }
  isUnsupportedTimePattern() {
    return !!this.intervalName;
  }
  isTimeBased() {
    return !!this.timeFieldName && (!this.fields || !!this.getTimeField());
  }
  isTimeNanosBased() {
    const timeField = this.getTimeField();
    return timeField && timeField.esTypes && timeField.esTypes.indexOf('date_nanos') !== -1;
  }
  getTimeField() {
    if (!this.timeFieldName || !this.fields || !this.fields.getByName) return undefined;
    return this.fields.getByName(this.timeFieldName);
  }
  getFieldByName(name) {
    if (!this.fields || !this.fields.getByName) return undefined;
    return this.fields.getByName(name);
  }
  getAggregationRestrictions() {
    var _this$typeMeta;
    return (_this$typeMeta = this.typeMeta) === null || _this$typeMeta === void 0 ? void 0 : _this$typeMeta.aggs;
  }

  /**
   * Returns index pattern as saved object body for saving
   */
  getAsSavedObjectBody() {
    const serializeFieldFormatMap = (flat, format, field) => {
      if (format && field) {
        flat[field] = format;
      }
    };
    const serialized = _lodash.default.transform(this.fieldFormatMap, serializeFieldFormatMap);
    const fieldFormatMap = _lodash.default.isEmpty(serialized) ? undefined : JSON.stringify(serialized);
    return {
      title: this.title,
      timeFieldName: this.timeFieldName,
      intervalName: this.intervalName,
      sourceFilters: this.sourceFilters ? JSON.stringify(this.sourceFilters) : undefined,
      fields: this.fields ? JSON.stringify(this.fields) : undefined,
      fieldFormatMap,
      type: this.type,
      typeMeta: this.typeMeta ? JSON.stringify(this.typeMeta) : undefined
    };
  }
  /**
   * Provide a field, get its formatter
   * @param field
   */
  getFormatterForField(field) {
    return this.fieldFormatMap[field.name] || this.fieldFormats.getDefaultInstance(field.type, field.esTypes);
  }
}
exports.IndexPattern = IndexPattern;