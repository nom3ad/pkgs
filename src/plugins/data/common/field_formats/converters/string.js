"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StringFormat = void 0;
var _i18n = require("@osd/i18n");
var _utils = require("../utils");
var _types = require("../../osd_field_types/types");
var _field_format = require("../field_format");
var _types2 = require("../types");
var _utils2 = require("../../utils");
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
const TRANSFORM_OPTIONS = [{
  kind: false,
  text: _i18n.i18n.translate('data.fieldFormats.string.transformOptions.none', {
    defaultMessage: '- None -'
  })
}, {
  kind: 'lower',
  text: _i18n.i18n.translate('data.fieldFormats.string.transformOptions.lower', {
    defaultMessage: 'Lower Case'
  })
}, {
  kind: 'upper',
  text: _i18n.i18n.translate('data.fieldFormats.string.transformOptions.upper', {
    defaultMessage: 'Upper Case'
  })
}, {
  kind: 'title',
  text: _i18n.i18n.translate('data.fieldFormats.string.transformOptions.title', {
    defaultMessage: 'Title Case'
  })
}, {
  kind: 'short',
  text: _i18n.i18n.translate('data.fieldFormats.string.transformOptions.short', {
    defaultMessage: 'Short Dots'
  })
}, {
  kind: 'base64',
  text: _i18n.i18n.translate('data.fieldFormats.string.transformOptions.base64', {
    defaultMessage: 'Base64 Decode'
  })
}, {
  kind: 'urlparam',
  text: _i18n.i18n.translate('data.fieldFormats.string.transformOptions.url', {
    defaultMessage: 'URL Param Decode'
  })
}];
const DEFAULT_TRANSFORM_OPTION = false;
class StringFormat extends _field_format.FieldFormat {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "textConvert", val => {
      switch (this.param('transform')) {
        case 'lower':
          return String(val).toLowerCase();
        case 'upper':
          return String(val).toUpperCase();
        case 'title':
          return this.toTitleCase(val);
        case 'short':
          return (0, _utils2.shortenDottedString)(val);
        case 'base64':
          return this.base64Decode(val);
        case 'urlparam':
          return decodeURIComponent(val);
        default:
          return (0, _utils.asPrettyString)(val);
      }
    });
  }
  getParamDefaults() {
    return {
      transform: DEFAULT_TRANSFORM_OPTION
    };
  }
  base64Decode(val) {
    try {
      return Buffer.from(val, 'base64').toString('utf8');
    } catch (e) {
      return (0, _utils.asPrettyString)(val);
    }
  }
  toTitleCase(val) {
    return val.replace(/\w\S*/g, txt => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
}
exports.StringFormat = StringFormat;
_defineProperty(StringFormat, "id", _types2.FIELD_FORMAT_IDS.STRING);
_defineProperty(StringFormat, "title", _i18n.i18n.translate('data.fieldFormats.string.title', {
  defaultMessage: 'String'
}));
_defineProperty(StringFormat, "fieldType", [_types.OSD_FIELD_TYPES.NUMBER, _types.OSD_FIELD_TYPES.BOOLEAN, _types.OSD_FIELD_TYPES.DATE, _types.OSD_FIELD_TYPES.IP, _types.OSD_FIELD_TYPES.ATTACHMENT, _types.OSD_FIELD_TYPES.GEO_POINT, _types.OSD_FIELD_TYPES.GEO_SHAPE, _types.OSD_FIELD_TYPES.STRING, _types.OSD_FIELD_TYPES.MURMUR3, _types.OSD_FIELD_TYPES.UNKNOWN, _types.OSD_FIELD_TYPES.CONFLICT]);
_defineProperty(StringFormat, "transformOptions", TRANSFORM_OPTIONS);