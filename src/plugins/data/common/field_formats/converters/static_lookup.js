"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StaticLookupFormat = void 0;
var _i18n = require("@osd/i18n");
var _types = require("../../osd_field_types/types");
var _field_format = require("../field_format");
var _types2 = require("../types");
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
function convertLookupEntriesToMap(lookupEntries) {
  return lookupEntries.reduce((lookupMap, lookupEntry) => {
    lookupMap[lookupEntry.key] = lookupEntry.value;
    return lookupMap;
  }, {});
}
class StaticLookupFormat extends _field_format.FieldFormat {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "textConvert", val => {
      const lookupEntries = this.param('lookupEntries');
      const unknownKeyValue = this.param('unknownKeyValue');
      const lookupMap = convertLookupEntriesToMap(lookupEntries);
      return lookupMap[val] || unknownKeyValue || val;
    });
  }
  getParamDefaults() {
    return {
      lookupEntries: [{}],
      unknownKeyValue: null
    };
  }
}
exports.StaticLookupFormat = StaticLookupFormat;
_defineProperty(StaticLookupFormat, "id", _types2.FIELD_FORMAT_IDS.STATIC_LOOKUP);
_defineProperty(StaticLookupFormat, "title", _i18n.i18n.translate('data.fieldFormats.static_lookup.title', {
  defaultMessage: 'Static lookup'
}));
_defineProperty(StaticLookupFormat, "fieldType", [_types.OSD_FIELD_TYPES.STRING, _types.OSD_FIELD_TYPES.NUMBER, _types.OSD_FIELD_TYPES.IP, _types.OSD_FIELD_TYPES.BOOLEAN]);