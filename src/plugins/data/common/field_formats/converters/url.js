"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UrlFormat = void 0;
var _i18n = require("@osd/i18n");
var _lodash = require("lodash");
var _utils = require("../utils");
var _types = require("../../osd_field_types/types");
var _field_format = require("../field_format");
var _types2 = require("../types");
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
const templateMatchRE = /{{([\s\S]+?)}}/g;
const allowedUrlSchemes = ['http://', 'https://'];
const URL_TYPES = [{
  kind: 'a',
  text: _i18n.i18n.translate('data.fieldFormats.url.types.link', {
    defaultMessage: 'Link'
  })
}, {
  kind: 'img',
  text: _i18n.i18n.translate('data.fieldFormats.url.types.img', {
    defaultMessage: 'Image'
  })
}, {
  kind: 'audio',
  text: _i18n.i18n.translate('data.fieldFormats.url.types.audio', {
    defaultMessage: 'Audio'
  })
}];
const DEFAULT_URL_TYPE = 'a';
class UrlFormat extends _field_format.FieldFormat {
  constructor(params) {
    super(params);
    _defineProperty(this, "textConvert", value => this.formatLabel(value));
    _defineProperty(this, "htmlConvert", (rawValue, options = {}) => {
      const {
        field,
        hit
      } = options;
      const {
        parsedUrl
      } = this._params;
      const {
        basePath,
        pathname,
        origin
      } = parsedUrl || {};
      const url = (0, _lodash.escape)(this.formatUrl(rawValue));
      const label = (0, _lodash.escape)(this.formatLabel(rawValue, url));
      switch (this.param('type')) {
        case 'audio':
          return `<audio controls preload="none" src="${url}">`;
        case 'img':
          // If the URL hasn't been formatted to become a meaningful label then the best we can do
          // is tell screen readers where the image comes from.
          const imageLabel = label === url ? `A dynamically-specified image located at ${url}` : label;
          return this.generateImgHtml(url, imageLabel);
        default:
          const allowed = allowedUrlSchemes.some(scheme => url.indexOf(scheme) === 0);
          if (!allowed && !parsedUrl) {
            return url;
          }
          let prefix = '';
          /**
           * This code attempts to convert a relative url into a OpenSearch Dashboards absolute url
           *
           * SUPPORTED:
           *  - /app/opensearch-dashboards/
           *  - ../app/opensearch-dashboards
           *  - #/discover
           *
           * UNSUPPORTED
           *  - app/opensearch-dashboards
           */
          if (!allowed) {
            // Handles urls like: `#/discover`
            if (url[0] === '#') {
              prefix = `${origin}${pathname}`;
            }
            // Handle urls like: `/app/opensearch-dashboards` or `/xyz/app/opensearch-dashboards`
            else if (url.indexOf(basePath || '/') === 0) {
              prefix = `${origin}`;
            }
            // Handle urls like: `../app/opensearch-dashboards`
            else {
              const prefixEnd = url[0] === '/' ? '' : '/';
              prefix = `${origin}${basePath || ''}/app${prefixEnd}`;
            }
          }
          let linkLabel;
          if (hit && hit.highlight && hit.highlight[field.name]) {
            linkLabel = (0, _utils.getHighlightHtml)(label, hit.highlight[field.name]);
          } else {
            linkLabel = label;
          }
          const linkTarget = this.param('openLinkInCurrentTab') ? '_self' : '_blank';
          return `<a href="${prefix}${url}" target="${linkTarget}" rel="noopener noreferrer">${linkLabel}</a>`;
      }
    });
    this.compileTemplate = (0, _lodash.memoize)(this.compileTemplate);
  }
  getParamDefaults() {
    return {
      type: DEFAULT_URL_TYPE,
      urlTemplate: null,
      labelTemplate: null,
      width: null,
      height: null
    };
  }
  formatLabel(value, url) {
    const template = this.param('labelTemplate');
    if (url == null) url = this.formatUrl(value);
    if (!template) return url;
    return this.compileTemplate(template)({
      value,
      url
    });
  }
  formatUrl(value) {
    const template = this.param('urlTemplate');
    if (!template) return value;
    return this.compileTemplate(template)({
      value: encodeURIComponent(value),
      rawValue: value
    });
  }
  compileTemplate(template) {
    // trim all the odd bits, the variable names
    const parts = template.split(templateMatchRE).map((part, i) => i % 2 ? part.trim() : part);
    return function (locals) {
      // replace all the odd bits with their local var
      let output = '';
      let i = -1;
      while (++i < parts.length) {
        if (i % 2) {
          if (locals.hasOwnProperty(parts[i])) {
            const local = locals[parts[i]];
            output += local == null ? '' : local;
          }
        } else {
          output += parts[i];
        }
      }
      return output;
    };
  }
  generateImgHtml(url, imageLabel) {
    const isValidWidth = !isNaN(parseInt(this.param('width'), 10));
    const isValidHeight = !isNaN(parseInt(this.param('height'), 10));
    const maxWidth = isValidWidth ? `${this.param('width')}px` : 'none';
    const maxHeight = isValidHeight ? `${this.param('height')}px` : 'none';
    return `<img src="${url}" alt="${imageLabel}" style="width:auto; height:auto; max-width:${maxWidth}; max-height:${maxHeight};">`;
  }
}

// console.log(UrlFormat);
exports.UrlFormat = UrlFormat;
_defineProperty(UrlFormat, "id", _types2.FIELD_FORMAT_IDS.URL);
_defineProperty(UrlFormat, "title", _i18n.i18n.translate('data.fieldFormats.url.title', {
  defaultMessage: 'Url'
}));
_defineProperty(UrlFormat, "fieldType", [_types.OSD_FIELD_TYPES.NUMBER, _types.OSD_FIELD_TYPES.BOOLEAN, _types.OSD_FIELD_TYPES.DATE, _types.OSD_FIELD_TYPES.IP, _types.OSD_FIELD_TYPES.STRING, _types.OSD_FIELD_TYPES.MURMUR3, _types.OSD_FIELD_TYPES.UNKNOWN, _types.OSD_FIELD_TYPES.CONFLICT]);
_defineProperty(UrlFormat, "urlTypes", URL_TYPES);