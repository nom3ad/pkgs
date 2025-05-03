"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FieldFormatsRegistry = void 0;
var _lodash = require("lodash");
var _types = require("./types");
var _base_formatters = require("./constants/base_formatters");
var _field_format = require("./field_format");
var _constants = require("../constants");
var _field_formats = require("../field_formats");
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
 */ // eslint-disable-next-line max-classes-per-file
class FieldFormatsRegistry {
  constructor() {
    _defineProperty(this, "fieldFormats", new Map());
    _defineProperty(this, "defaultMap", {});
    _defineProperty(this, "metaParamsOptions", {});
    _defineProperty(this, "getConfig", void 0);
    // overriden on the public contract
    _defineProperty(this, "deserialize", () => {
      return new (_field_format.FieldFormat.from(_lodash.identity))();
    });
    /**
     * Get the id of the default type for this field type
     * using the format:defaultTypeMap config map
     *
     * @param  {OSD_FIELD_TYPES} fieldType - the field type
     * @param  {OPENSEARCH_FIELD_TYPES[]} esTypes - Array of OpenSearch data types
     * @return {FieldType}
     */
    _defineProperty(this, "getDefaultConfig", (fieldType, esTypes) => {
      const type = this.getDefaultTypeName(fieldType, esTypes);
      return this.defaultMap && this.defaultMap[type] || {
        id: _types.FIELD_FORMAT_IDS.STRING,
        params: {}
      };
    });
    /**
     * Get a derived FieldFormat class by its id.
     *
     * @param  {FieldFormatId} formatId - the format id
     * @return {FieldFormatInstanceType | undefined}
     */
    _defineProperty(this, "getType", formatId => {
      const fieldFormat = this.fieldFormats.get(formatId);
      if (fieldFormat) {
        const decoratedFieldFormat = this.fieldFormatMetaParamsDecorator(fieldFormat);
        if (decoratedFieldFormat) {
          return decoratedFieldFormat;
        }
      }
      return undefined;
    });
    _defineProperty(this, "getTypeWithoutMetaParams", formatId => {
      return this.fieldFormats.get(formatId);
    });
    /**
     * Get the default FieldFormat type (class) for
     * a field type, using the format:defaultTypeMap.
     * used by the field editor
     *
     * @param  {OSD_FIELD_TYPES} fieldType
     * @param  {OPENSEARCH_FIELD_TYPES[]} esTypes - Array of OpenSearch data types
     * @return {FieldFormatInstanceType | undefined}
     */
    _defineProperty(this, "getDefaultType", (fieldType, esTypes) => {
      const config = this.getDefaultConfig(fieldType, esTypes);
      return this.getType(config.id);
    });
    /**
     * Get the name of the default type for OpenSearch types like date_nanos
     * using the format:defaultTypeMap config map
     *
     * @param  {OPENSEARCH_FIELD_TYPES[]} esTypes - Array of OpenSearch data types
     * @return {OPENSEARCH_FIELD_TYPES | undefined}
     */
    _defineProperty(this, "getTypeNameByOpenSearchTypes", esTypes => {
      if (!Array.isArray(esTypes)) {
        return undefined;
      }
      return esTypes.find(type => this.defaultMap[type] && this.defaultMap[type].opensearch);
    });
    /**
     * Get the default FieldFormat type name for
     * a field type, using the format:defaultTypeMap.
     *
     * @param  {OSD_FIELD_TYPES} fieldType
     * @param  {OPENSEARCH_FIELD_TYPES[]} esTypes
     * @return {OPENSEARCH_FIELD_TYPES | OSD_FIELD_TYPES}
     */
    _defineProperty(this, "getDefaultTypeName", (fieldType, esTypes) => {
      const opensearchType = this.getTypeNameByOpenSearchTypes(esTypes);
      return opensearchType || fieldType;
    });
    /**
     * Get the singleton instance of the FieldFormat type by its id.
     *
     * @param  {FieldFormatId} formatId
     * @return {FieldFormat}
     */
    _defineProperty(this, "getInstance", (0, _lodash.memoize)((formatId, params = {}) => {
      const ConcreteFieldFormat = this.getType(formatId);
      if (!ConcreteFieldFormat) {
        throw new _field_formats.FieldFormatNotFoundError(`Field Format '${formatId}' not found!`, formatId);
      }
      return new ConcreteFieldFormat(params, this.getConfig);
    }, (formatId, params = {}) => JSON.stringify({
      formatId,
      ...params
    })));
    /**
     * Get the default fieldFormat instance for a field format.
     *
     * @param  {OSD_FIELD_TYPES} fieldType
     * @param  {OPENSEARCH_FIELD_TYPES[]} esTypes
     * @return {FieldFormat}
     */
    _defineProperty(this, "getDefaultInstancePlain", (fieldType, esTypes, params = {}) => {
      const conf = this.getDefaultConfig(fieldType, esTypes);
      const instanceParams = {
        ...conf.params,
        ...params
      };
      return this.getInstance(conf.id, instanceParams);
    });
    /**
     * Get the default fieldFormat instance for a field format.
     * It's a memoized function that builds and reads a cache
     *
     * @param  {OSD_FIELD_TYPES} fieldType
     * @param  {OPENSEARCH_FIELD_TYPES[]} esTypes
     * @return {FieldFormat}
     */
    _defineProperty(this, "getDefaultInstance", (0, _lodash.memoize)(this.getDefaultInstancePlain, this.getDefaultInstanceCacheResolver));
    /**
     * FieldFormat decorator - provide a one way to add meta-params for all field formatters
     *
     * @private
     * @param  {FieldFormatInstanceType} fieldFormat - field format type
     * @return {FieldFormatInstanceType | undefined}
     */
    _defineProperty(this, "fieldFormatMetaParamsDecorator", fieldFormat => {
      const getMetaParams = customParams => this.buildMetaParams(customParams);
      if (fieldFormat) {
        var _class2;
        return _class2 = class DecoratedFieldFormat extends fieldFormat {
          constructor(params = {}, getConfig) {
            super(getMetaParams(params), getConfig);
          }
        }, _defineProperty(_class2, "id", fieldFormat.id), _defineProperty(_class2, "fieldType", fieldFormat.fieldType), _class2;
      }
      return undefined;
    });
    /**
     * Build Meta Params
     *
     * @param  {Record<string, any>} custom params
     * @return {Record<string, any>}
     */
    _defineProperty(this, "buildMetaParams", customParams => ({
      ...this.metaParamsOptions,
      ...customParams
    }));
  }
  init(getConfig, metaParamsOptions = {}, defaultFieldConverters = _base_formatters.baseFormatters) {
    const defaultTypeMap = getConfig(_constants.UI_SETTINGS.FORMAT_DEFAULT_TYPE_MAP);
    this.register(defaultFieldConverters);
    this.parseDefaultTypeMap(defaultTypeMap);
    this.getConfig = getConfig;
    this.metaParamsOptions = metaParamsOptions;
  }
  /**
   * Returns a cache key built by the given variables for caching in memoized
   * Where opensearchType contains fieldType, fieldType is returned
   * -> OpenSearch Dashboards types have a higher priority in that case
   * -> would lead to failing tests that match e.g. date format with/without esTypes
   * https://lodash.com/docs#memoize
   *
   * @param  {OSD_FIELD_TYPES} fieldType
   * @param  {OPENSEARCH_FIELD_TYPES[]} esTypes
   * @return {String}
   */
  getDefaultInstanceCacheResolver(fieldType, esTypes) {
    // @ts-ignore
    return Array.isArray(esTypes) && esTypes.indexOf(fieldType) === -1 ? [fieldType, ...esTypes].join('-') : fieldType;
  }

  /**
   * Get filtered list of field formats by format type
   *
   * @param  {OSD_FIELD_TYPES} fieldType
   * @return {FieldFormatInstanceType[]}
   */
  getByFieldType(fieldType) {
    return [...this.fieldFormats.values()].filter(format => format && format.fieldType.indexOf(fieldType) !== -1).map(format => this.fieldFormatMetaParamsDecorator(format));
  }
  parseDefaultTypeMap(value) {
    this.defaultMap = value;
    (0, _lodash.forOwn)(this, fn => {
      if ((0, _lodash.isFunction)(fn) && fn.cache) {
        // clear all memoize caches
        // @ts-ignore
        fn.cache = new _lodash.memoize.Cache();
      }
    });
  }
  register(fieldFormats) {
    fieldFormats.forEach(fieldFormat => this.fieldFormats.set(fieldFormat.id, fieldFormat));
  }
}
exports.FieldFormatsRegistry = FieldFormatsRegistry;