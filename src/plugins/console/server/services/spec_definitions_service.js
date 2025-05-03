"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SpecDefinitionsService = void 0;
var _lodash = _interopRequireWildcard(require("lodash"));
var _glob = _interopRequireDefault(require("glob"));
var _path = require("path");
var _fs = require("fs");
var _lib = require("../lib");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
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
const PATH_TO_OSS_JSON_SPEC = (0, _path.resolve)(__dirname, '../lib/spec_definitions/json');
class SpecDefinitionsService {
  constructor() {
    _defineProperty(this, "name", 'opensearch');
    _defineProperty(this, "globalRules", {});
    _defineProperty(this, "endpoints", {});
    _defineProperty(this, "extensionSpecFilePaths", []);
    _defineProperty(this, "hasLoadedSpec", false);
  }
  addGlobalAutocompleteRules(parentNode, rules) {
    this.globalRules[parentNode] = rules;
  }
  addEndpointDescription(endpoint, description = {}) {
    let copiedDescription = {};
    if (this.endpoints[endpoint]) {
      copiedDescription = {
        ...this.endpoints[endpoint]
      };
    }
    let urlParamsDef;
    _lodash.default.each(description.patterns || [], function (p) {
      if (p.indexOf('{indices}') >= 0) {
        urlParamsDef = urlParamsDef || {};
        urlParamsDef.ignore_unavailable = '__flag__';
        urlParamsDef.allow_no_indices = '__flag__';
        urlParamsDef.expand_wildcards = ['open', 'closed'];
      }
    });
    if (urlParamsDef) {
      description.url_params = _lodash.default.assign(description.url_params || {}, copiedDescription.url_params);
      _lodash.default.defaults(description.url_params, urlParamsDef);
    }
    _lodash.default.assign(copiedDescription, description);
    _lodash.default.defaults(copiedDescription, {
      id: endpoint,
      patterns: [endpoint],
      methods: ['GET']
    });
    this.endpoints[endpoint] = copiedDescription;
  }
  asJson() {
    return {
      name: this.name,
      globals: this.globalRules,
      endpoints: this.endpoints
    };
  }
  addExtensionSpecFilePath(path) {
    this.extensionSpecFilePaths.push(path);
  }
  addProcessorDefinition(processor) {
    if (!this.hasLoadedSpec) {
      throw new Error('Cannot add a processor definition because spec definitions have not loaded!');
    }
    this.endpoints._processor.data_autocomplete_rules.__one_of.push(processor);
  }
  setup() {
    return {
      addExtensionSpecFilePath: this.addExtensionSpecFilePath.bind(this)
    };
  }
  start() {
    if (!this.hasLoadedSpec) {
      this.loadJsonSpec();
      this.loadJSSpec();
      this.hasLoadedSpec = true;
      return {
        addProcessorDefinition: this.addProcessorDefinition.bind(this)
      };
    } else {
      throw new Error('Service has already started!');
    }
  }
  loadJSONSpecInDir(dirname) {
    const generatedFiles = _glob.default.sync((0, _path.join)(dirname, 'generated', '*.json'));
    const overrideFiles = _glob.default.sync((0, _path.join)(dirname, 'overrides', '*.json'));
    return generatedFiles.reduce((acc, file) => {
      const overrideFile = overrideFiles.find(f => (0, _path.basename)(f) === (0, _path.basename)(file));
      const loadedSpec = JSON.parse((0, _fs.readFileSync)(file, 'utf8'));
      if (overrideFile) {
        (0, _lodash.merge)(loadedSpec, JSON.parse((0, _fs.readFileSync)(overrideFile, 'utf8')));
      }
      const spec = {};
      Object.entries(loadedSpec).forEach(([key, value]) => {
        if (acc[key]) {
          // add time to remove key collision
          spec[`${key}${Date.now()}`] = value;
        } else {
          spec[key] = value;
        }
      });
      return {
        ...acc,
        ...spec
      };
    }, {});
  }
  loadJsonSpec() {
    const result = this.loadJSONSpecInDir(PATH_TO_OSS_JSON_SPEC);
    this.extensionSpecFilePaths.forEach(extensionSpecFilePath => {
      (0, _lodash.merge)(result, this.loadJSONSpecInDir(extensionSpecFilePath));
    });
    Object.keys(result).forEach(endpoint => {
      this.addEndpointDescription(endpoint, result[endpoint]);
    });
  }
  loadJSSpec() {
    _lib.jsSpecLoaders.forEach(addJsSpec => addJsSpec(this));
  }
}
exports.SpecDefinitionsService = SpecDefinitionsService;