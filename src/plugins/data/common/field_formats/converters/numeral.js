"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NumeralFormat = void 0;
var _numeral = _interopRequireDefault(require("@elastic/numeral"));
var _languages = _interopRequireDefault(require("@elastic/numeral/languages"));
var _types = require("../../osd_field_types/types");
var _field_format = require("../field_format");
var _constants = require("../../constants");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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
 */ // @ts-ignore
// @ts-ignore
const numeralInst = (0, _numeral.default)();
_languages.default.forEach(numeralLanguage => {
  _numeral.default.language(numeralLanguage.id, numeralLanguage.lang);
});
class NumeralFormat extends _field_format.FieldFormat {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "id", void 0);
    _defineProperty(this, "title", void 0);
    _defineProperty(this, "getParamDefaults", () => ({
      pattern: this.getConfig(`format:${this.id}:defaultPattern`)
    }));
    _defineProperty(this, "textConvert", val => {
      return this.getConvertedValue(val);
    });
  }
  getConvertedValue(val) {
    if (val === -Infinity) return '-∞';
    if (val === +Infinity) return '+∞';
    const isBigInt = typeof val === 'bigint';
    if (typeof val !== 'number' && !isBigInt) {
      val = parseFloat(val);
    }
    if (!isBigInt && isNaN(val)) return '';
    const previousLocale = _numeral.default.language();
    const defaultLocale = this.getConfig && this.getConfig(_constants.UI_SETTINGS.FORMAT_NUMBER_DEFAULT_LOCALE) || 'en';
    _numeral.default.language(defaultLocale);
    const formatted = numeralInst.set(val).format(this.param('pattern'));
    _numeral.default.language(previousLocale);
    return formatted;
  }
}
exports.NumeralFormat = NumeralFormat;
_defineProperty(NumeralFormat, "fieldType", _types.OSD_FIELD_TYPES.NUMBER);