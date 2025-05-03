"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SourceFormat = void 0;
var _lodash = require("lodash");
var _utils = require("../../utils");
var _types = require("../../osd_field_types/types");
var _field_format = require("../field_format");
var _types2 = require("../types");
var _constants = require("../../constants");
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
/**
 * Remove all of the whitespace between html tags
 * so that inline elements don't have extra spaces.
 *
 * If you have inline elements (span, a, em, etc.) and any
 * amount of whitespace around them in your markup, then the
 * browser will push them apart. This is ugly in certain
 * scenarios and is only fixed by removing the whitespace
 * from the html in the first place (or ugly css hacks).
 *
 * @param  {string} html - the html to modify
 * @return {string} - modified html
 */
function noWhiteSpace(html) {
  const TAGS_WITH_WS = />\s+</g;
  return html.replace(TAGS_WITH_WS, '><');
}
const templateHtml = `
  <dl class="source truncate-by-height">
    <% defPairs.forEach(function (def) { %>
      <dt><%- def[0] %>:</dt>
      <dd><%= def[1] %></dd>
      <%= ' ' %>
    <% }); %>
  </dl>`;
const doTemplate = (0, _lodash.template)(noWhiteSpace(templateHtml));
class SourceFormat extends _field_format.FieldFormat {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "textConvert", value => JSON.stringify(value));
    _defineProperty(this, "htmlConvert", (value, options = {}) => {
      const {
        field,
        hit,
        indexPattern
      } = options;
      if (!field) {
        const converter = this.getConverterFor('text');
        return (0, _lodash.escape)(converter(value));
      }
      const highlights = hit && hit.highlight || {};
      const formatted = indexPattern.formatHit(hit);
      const highlightPairs = [];
      const sourcePairs = [];
      const isShortDots = this.getConfig(_constants.UI_SETTINGS.SHORT_DOTS_ENABLE);
      (0, _lodash.keys)(formatted).forEach(key => {
        const pairs = highlights[key] ? highlightPairs : sourcePairs;
        const newField = isShortDots ? (0, _utils.shortenDottedString)(key) : key;
        const val = formatted[key];
        pairs.push([newField, val]);
      }, []);
      return doTemplate({
        defPairs: highlightPairs.concat(sourcePairs)
      });
    });
  }
}
exports.SourceFormat = SourceFormat;
_defineProperty(SourceFormat, "id", _types2.FIELD_FORMAT_IDS._SOURCE);
_defineProperty(SourceFormat, "title", '_source');
_defineProperty(SourceFormat, "fieldType", _types.OSD_FIELD_TYPES._SOURCE);