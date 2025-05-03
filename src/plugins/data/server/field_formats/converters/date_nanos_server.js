"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DateNanosFormat = void 0;
var _lodash = require("lodash");
var _momentTimezone = _interopRequireDefault(require("moment-timezone"));
var _date_nanos_shared = require("../../../common/field_formats/converters/date_nanos_shared");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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
class DateNanosFormatServer extends _date_nanos_shared.DateNanosFormat {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "textConvert", val => {
      // don't give away our ref to converter so
      // we can hot-swap when config changes
      const pattern = this.param('pattern');
      const timezone = this.param('timezone');
      const fractPattern = (0, _date_nanos_shared.analysePatternForFract)(pattern);
      const fallbackPattern = this.param('patternFallback');
      const timezoneChanged = this.timeZone !== timezone;
      const datePatternChanged = this.memoizedPattern !== pattern;
      if (timezoneChanged || datePatternChanged) {
        this.timeZone = timezone;
        this.memoizedPattern = pattern;
        this.memoizedConverter = (0, _lodash.memoize)(value => {
          if (value === null || value === undefined) {
            return '-';
          }

          /* On the server, importing moment returns a new instance. Unlike on
           * the client side, it doesn't have the dateFormat:tz configuration
           * baked in.
           * We need to set the timezone manually here. The date is taken in as
           * UTC and converted into the desired timezone. */
          let date;
          if (this.timeZone === 'Browser') {
            // Assume a warning has been logged that this can be unpredictable. It
            // would be too verbose to log anything here.
            date = _momentTimezone.default.utc(val);
          } else {
            date = _momentTimezone.default.utc(val).tz(this.timeZone);
          }
          if (typeof value !== 'string' && date.isValid()) {
            // fallback for max/min aggregation, where unixtime in ms is returned as a number
            // aggregations in Elasticsearch generally just return ms
            return date.format(fallbackPattern);
          } else if (date.isValid()) {
            return (0, _date_nanos_shared.formatWithNanos)(date, value, fractPattern);
          } else {
            return value;
          }
        });
      }
      return this.memoizedConverter(val);
    });
  }
}
exports.DateNanosFormat = DateNanosFormatServer;