"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ColorFormat = void 0;
var _i18n = require("@osd/i18n");
var _lodash = require("lodash");
var _types = require("../../osd_field_types/types");
var _field_format = require("../field_format");
var _types2 = require("../types");
var _utils = require("../utils");
var _color_default = require("../constants/color_default");
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
const convertTemplate = (0, _lodash.template)('<span style="<%- style %>"><%- val %></span>');
class ColorFormat extends _field_format.FieldFormat {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "htmlConvert", val => {
      const color = this.findColorRuleForVal(val);
      if (!color) return (0, _lodash.escape)((0, _utils.asPrettyString)(val));
      let style = '';
      if (color.text) style += `color: ${color.text};`;
      if (color.background) style += `background-color: ${color.background};`;
      return convertTemplate({
        val,
        style
      });
    });
  }
  getParamDefaults() {
    return {
      fieldType: null,
      // populated by editor, see controller below
      colors: [(0, _lodash.cloneDeep)(_color_default.DEFAULT_CONVERTER_COLOR)]
    };
  }
  findColorRuleForVal(val) {
    switch (this.param('fieldType')) {
      case 'string':
        return (0, _lodash.findLast)(this.param('colors'), colorParam => {
          return new RegExp(colorParam.regex).test(val);
        });
      case 'number':
        return (0, _lodash.findLast)(this.param('colors'), ({
          range
        }) => {
          if (!range) return;
          const [start, end] = range.split(':');
          return val >= Number(start) && val <= Number(end);
        });
      default:
        return null;
    }
  }
}
exports.ColorFormat = ColorFormat;
_defineProperty(ColorFormat, "id", _types2.FIELD_FORMAT_IDS.COLOR);
_defineProperty(ColorFormat, "title", _i18n.i18n.translate('data.fieldFormats.color.title', {
  defaultMessage: 'Color'
}));
_defineProperty(ColorFormat, "fieldType", [_types.OSD_FIELD_TYPES.NUMBER, _types.OSD_FIELD_TYPES.STRING]);