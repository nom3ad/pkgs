"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FieldParamType = void 0;
var _i18n = require("@osd/i18n");
var _common = require("../../../../../opensearch_dashboards_utils/common");
var _base = require("./base");
var _utils = require("../utils");
var _fields = require("../../../index_patterns/fields");
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
const filterByType = (0, _utils.propFilter)('type');

// TODO need to make a more explicit interface for this

class FieldParamType extends _base.BaseParamType {
  constructor(config) {
    super(config);
    _defineProperty(this, "required", true);
    _defineProperty(this, "scriptable", true);
    _defineProperty(this, "filterFieldTypes", void 0);
    _defineProperty(this, "onlyAggregatable", void 0);
    /**
     * filter the fields to the available ones
     */
    _defineProperty(this, "getAvailableFields", aggConfig => {
      const fields = aggConfig.getIndexPattern().fields;
      const filteredFields = fields.filter(field => {
        const {
          onlyAggregatable,
          scriptable,
          filterFieldTypes
        } = this;
        if (onlyAggregatable && (!field.aggregatable || (0, _fields.isNestedField)(field)) || !scriptable && field.scripted) {
          return false;
        }
        return filterByType([field], filterFieldTypes).length !== 0;
      });
      return filteredFields;
    });
    this.filterFieldTypes = config.filterFieldTypes || '*';
    this.onlyAggregatable = config.onlyAggregatable !== false;
    if (!config.write) {
      this.write = (aggConfig, output) => {
        const field = aggConfig.getField();
        if (!field) {
          throw new TypeError(_i18n.i18n.translate('data.search.aggs.paramTypes.field.requiredFieldParameterErrorMessage', {
            defaultMessage: '{fieldParameter} is a required parameter',
            values: {
              fieldParameter: '"field"'
            }
          }));
        }
        if (field.scripted) {
          output.params.script = {
            source: field.script,
            lang: field.lang
          };
        } else {
          output.params.field = field.name;
        }
      };
    }
    this.serialize = field => {
      return field.name;
    };
    this.deserialize = (fieldName, aggConfig) => {
      if (!aggConfig) {
        throw new Error('aggConfig was not provided to FieldParamType deserialize function');
      }
      const field = aggConfig.getIndexPattern().fields.getByName(fieldName);
      if (!field) {
        throw new _common.SavedObjectNotFound('index-pattern-field', fieldName);
      }
      const validField = this.getAvailableFields(aggConfig).find(f => f.name === fieldName);
      if (!validField) {
        var _aggConfig$type;
        throw new Error(_i18n.i18n.translate('data.search.aggs.paramTypes.field.invalidSavedFieldParameterErrorMessage', {
          defaultMessage: 'Saved field "{fieldParameter}" is invalid for use with the "{aggType}" aggregation. Please select a new field.',
          values: {
            fieldParameter: fieldName,
            aggType: aggConfig === null || aggConfig === void 0 || (_aggConfig$type = aggConfig.type) === null || _aggConfig$type === void 0 ? void 0 : _aggConfig$type.title
          }
        }));
      }
      return validField;
    };
  }
}
exports.FieldParamType = FieldParamType;