"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DateNanosFormat = void 0;
exports.analysePatternForFract = analysePatternForFract;
exports.formatWithNanos = formatWithNanos;
var _i18n = require("@osd/i18n");
var _lodash = require("lodash");
var _moment = _interopRequireDefault(require("moment"));
var _ = require("../../");
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
 */
/**
 * Analyse the given moment.js format pattern for the fractional sec part (S,SS,SSS...)
 * returning length, match, pattern and an escaped pattern, that excludes the fractional
 * part when formatting with moment.js -> e.g. [SSS]
 */
function analysePatternForFract(pattern) {
  const fracSecMatch = pattern.match('S+'); // extract fractional seconds sub-pattern
  const fracSecMatchStr = fracSecMatch ? fracSecMatch[0] : '';
  return {
    length: fracSecMatchStr.length,
    patternNanos: fracSecMatchStr,
    pattern,
    patternEscaped: fracSecMatchStr ? pattern.replace(fracSecMatch, `[${fracSecMatch}]`) : ''
  };
}

/**
 * Format a given moment.js date object
 * Since momentjs would loose the exact value for fractional seconds with a higher resolution than
 * milliseconds, the fractional pattern is replaced by the fractional value of the raw timestamp
 */
function formatWithNanos(dateMomentObj, valRaw, fracPatternObj) {
  if (fracPatternObj.length <= 3) {
    // S,SS,SSS is formatted correctly by moment.js
    return dateMomentObj.format(fracPatternObj.pattern);
  } else {
    // Beyond SSS the precise value of the raw datetime string is used
    const valFormatted = dateMomentObj.format(fracPatternObj.patternEscaped);
    // Extract fractional value of OpenSearch formatted timestamp, zero pad if necessary:
    // 2020-05-18T20:45:05.957Z -> 957000000
    // 2020-05-18T20:45:05.957000123Z -> 957000123
    // we do not need to take care of the year 10000 bug since max year of date_nanos is 2262
    const valNanos = valRaw.substr(20, valRaw.length - 21) // remove timezone(Z)
    .padEnd(9, '0') // pad shorter fractionals
    .substr(0, fracPatternObj.patternNanos.length);
    return valFormatted.replace(fracPatternObj.patternNanos, valNanos);
  }
}
class DateNanosFormat extends _.FieldFormat {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "memoizedConverter", _lodash.noop);
    _defineProperty(this, "memoizedPattern", '');
    _defineProperty(this, "timeZone", '');
    _defineProperty(this, "textConvert", val => {
      // don't give away our ref to converter so
      // we can hot-swap when config changes
      const pattern = this.param('pattern');
      const timezone = this.param('timezone');
      const fractPattern = analysePatternForFract(pattern);
      const fallbackPattern = this.param('patternFallback');
      const timezoneChanged = this.timeZone !== timezone;
      const datePatternChanged = this.memoizedPattern !== pattern;
      if (timezoneChanged || datePatternChanged) {
        this.timeZone = timezone;
        this.memoizedPattern = pattern;
        this.memoizedConverter = (0, _lodash.memoize)(function converter(value) {
          if (value === null || value === undefined) {
            return '-';
          }
          const date = (0, _moment.default)(value);
          if (typeof value !== 'string' && date.isValid()) {
            // fallback for max/min aggregation, where unixtime in ms is returned as a number
            // aggregations in OpenSearch generally just return ms
            return date.format(fallbackPattern);
          } else if (date.isValid()) {
            return formatWithNanos(date, value, fractPattern);
          } else {
            return value;
          }
        });
      }
      return this.memoizedConverter(val);
    });
  }
  getParamDefaults() {
    return {
      pattern: this.getConfig('dateNanosFormat'),
      fallbackPattern: this.getConfig('dateFormat'),
      timezone: this.getConfig('dateFormat:tz')
    };
  }
}
exports.DateNanosFormat = DateNanosFormat;
_defineProperty(DateNanosFormat, "id", _.FIELD_FORMAT_IDS.DATE_NANOS);
_defineProperty(DateNanosFormat, "title", _i18n.i18n.translate('data.fieldFormats.date_nanos.title', {
  defaultMessage: 'Date nanos'
}));
_defineProperty(DateNanosFormat, "fieldType", _.OSD_FIELD_TYPES.DATE);