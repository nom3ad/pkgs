"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FieldFormat = void 0;
var _lodash = require("lodash");
var _custom = require("./converters/custom");
var _content_types = require("./content_types");
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
const DEFAULT_CONTEXT_TYPE = _content_types.TEXT_CONTEXT_TYPE;
class FieldFormat {
  constructor(_params = {}, getConfig) {
    /**
     * @property {FieldFormatConvert}
     * @private
     * have to remove the private because of
     * https://github.com/Microsoft/TypeScript/issues/17293
     */
    _defineProperty(this, "convertObject", void 0);
    /**
     * @property {htmlConvert}
     * @protected
     * have to remove the protected because of
     * https://github.com/Microsoft/TypeScript/issues/17293
     */
    _defineProperty(this, "htmlConvert", void 0);
    /**
     * @property {textConvert}
     * @protected
     * have to remove the protected because of
     * https://github.com/Microsoft/TypeScript/issues/17293
     */
    _defineProperty(this, "textConvert", void 0);
    /**
     * @property {Function} - ref to child class
     * @private
     */
    _defineProperty(this, "type", this.constructor);
    /**
     * @property {boolean} - allow numeric aggregation
     * @private
     */
    _defineProperty(this, "allowsNumericalAggregations", void 0);
    _defineProperty(this, "_params", void 0);
    _defineProperty(this, "getConfig", void 0);
    this._params = _params;
    if (getConfig) {
      this.getConfig = getConfig;
    }
  }

  /**
   * Convert a raw value to a formatted string
   * @param  {any} value
   * @param  {string} [contentType=text] - optional content type, the only two contentTypes
   *                                currently supported are "html" and "text", which helps
   *                                formatters adjust to different contexts
   * @return {string} - the formatted string, which is assumed to be html, safe for
   *                    injecting into the DOM or a DOM attribute
   * @public
   */
  convert(value, contentType = DEFAULT_CONTEXT_TYPE, options) {
    const converter = this.getConverterFor(contentType);
    if (converter) {
      return converter.call(this, value, options);
    }
    return value;
  }

  /**
   * Get a convert function that is bound to a specific contentType
   * @param  {string} [contentType=text]
   * @return {function} - a bound converter function
   * @public
   */
  getConverterFor(contentType = DEFAULT_CONTEXT_TYPE) {
    if (!this.convertObject) {
      this.convertObject = this.setupContentType();
    }
    return this.convertObject[contentType];
  }

  /**
   * Get parameter defaults
   * @return {object} - parameter defaults
   * @public
   */
  getParamDefaults() {
    return {};
  }

  /**
   * Get the value of a param. This value may be a default value.
   *
   * @param  {string} name - the param name to fetch
   * @return {any}
   * @public
   */
  param(name) {
    const val = (0, _lodash.get)(this._params, name);
    if (val || val === false || val === 0) {
      // truthy, false, or 0 are fine
      // '', NaN, null, undefined, etc are not
      return val;
    }
    return (0, _lodash.get)(this.getParamDefaults(), name);
  }

  /**
   * Get all of the params in a single object
   * @return {object}
   * @public
   */
  params() {
    return (0, _lodash.cloneDeep)((0, _lodash.defaults)({}, this._params, this.getParamDefaults()));
  }

  /**
   * Serialize this format to a simple POJO, with only the params
   * that are not default
   *
   * @return {object}
   * @public
   */
  toJSON() {
    const id = (0, _lodash.get)(this.type, 'id');
    const defaultsParams = this.getParamDefaults() || {};
    const params = (0, _lodash.transform)(this._params, (uniqParams, val, param) => {
      if (param && val !== (0, _lodash.get)(defaultsParams, param)) {
        uniqParams[param] = val;
      }
    }, {});
    return {
      id,
      params: (0, _lodash.size)(params) ? params : undefined
    };
  }
  static from(convertFn) {
    return (0, _custom.createCustomFieldFormat)(convertFn);
  }
  setupContentType() {
    return {
      text: (0, _content_types.textContentTypeSetup)(this, this.textConvert),
      html: (0, _content_types.htmlContentTypeSetup)(this, this.htmlConvert)
    };
  }
  static isInstanceOfFieldFormat(fieldFormat) {
    return Boolean(fieldFormat && fieldFormat.convert);
  }
}
exports.FieldFormat = FieldFormat;
/**
 * @property {string} - Field Format Id
 * @static
 * @public
 */
_defineProperty(FieldFormat, "id", void 0);
/**
 * @property {string} -  Field Format Title
 * @static
 * @public
 */
_defineProperty(FieldFormat, "title", void 0);
/**
 * @property {string} - Field Format Type
 * @private
 */
_defineProperty(FieldFormat, "fieldType", void 0);