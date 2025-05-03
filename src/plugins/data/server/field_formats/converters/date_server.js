"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DateFormat = void 0;
var _i18n = require("@osd/i18n");
var _lodash = require("lodash");
var _momentTimezone = _interopRequireDefault(require("moment-timezone"));
var _common = require("../../../common");
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
class DateFormat extends _common.FieldFormat {
  constructor(params, getConfig) {
    super(params, getConfig);
    _defineProperty(this, "memoizedConverter", _lodash.noop);
    _defineProperty(this, "memoizedPattern", '');
    _defineProperty(this, "timeZone", '');
    _defineProperty(this, "textConvert", val => {
      // don't give away our ref to converter so we can hot-swap when config changes
      const pattern = this.param('pattern');
      const timezone = this.param('timezone');
      const timezoneChanged = this.timeZone !== timezone;
      const datePatternChanged = this.memoizedPattern !== pattern;
      if (timezoneChanged || datePatternChanged) {
        this.timeZone = timezone;
        this.memoizedPattern = pattern;
      }
      return this.memoizedConverter(val);
    });
    this.memoizedConverter = (0, _lodash.memoize)(val => {
      if (val == null) {
        return '-';
      }

      /* On the server, importing moment returns a new instance. Unlike on
       * the client side, it doesn't have the dateFormat:tz configuration
       * baked in.
       * We need to set the timezone manually here. The date is taken in as
       * UTC and converted into the desired timezone. */
      let date;
      if (this.timeZone === 'Browser') {
        // Assume a warning has been logged this can be unpredictable. It
        // would be too verbose to log anything here.
        date = _momentTimezone.default.utc(val);
      } else {
        date = _momentTimezone.default.utc(val).tz(this.timeZone);
      }
      if (date.isValid()) {
        return date.format(this.memoizedPattern);
      } else {
        return val;
      }
    });
  }
  getParamDefaults() {
    return {
      pattern: this.getConfig('dateFormat'),
      timezone: this.getConfig('dateFormat:tz')
    };
  }
}
exports.DateFormat = DateFormat;
_defineProperty(DateFormat, "id", _common.FIELD_FORMAT_IDS.DATE);
_defineProperty(DateFormat, "title", _i18n.i18n.translate('data.fieldFormats.date.title', {
  defaultMessage: 'Date'
}));
_defineProperty(DateFormat, "fieldType", _common.OSD_FIELD_TYPES.DATE);