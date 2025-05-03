"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseParamType = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
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

class BaseParamType {
  /**
   *  A function that will be called before an aggConfig is serialized and sent to OpenSearch.
   *  Allows aggConfig to retrieve values needed for serialization
   *  Example usage: an aggregation needs to know the min/max of a field to determine an appropriate interval
   *
   *  @param {AggConfig} aggConfig
   *  @param {Courier.SearchSource} searchSource
   *  @returns {Promise<undefined>|undefined}
   */

  constructor(config) {
    _defineProperty(this, "name", void 0);
    _defineProperty(this, "type", void 0);
    _defineProperty(this, "displayName", void 0);
    _defineProperty(this, "required", void 0);
    _defineProperty(this, "advanced", void 0);
    _defineProperty(this, "default", void 0);
    _defineProperty(this, "write", void 0);
    _defineProperty(this, "serialize", void 0);
    _defineProperty(this, "deserialize", void 0);
    _defineProperty(this, "toExpressionAst", void 0);
    _defineProperty(this, "options", void 0);
    _defineProperty(this, "valueType", void 0);
    _defineProperty(this, "modifyAggConfigOnSearchRequestStart", void 0);
    this.name = config.name;
    this.type = config.type;
    this.displayName = config.displayName || this.name;
    this.required = config.required === true;
    this.advanced = config.advanced || false;
    this.onChange = config.onChange;
    this.shouldShow = config.shouldShow;
    this.default = config.default;
    const defaultWrite = (aggConfig, output) => {
      if (aggConfig.params[this.name]) {
        output.params[this.name] = aggConfig.params[this.name] || this.default;
      }
    };
    this.write = config.write || defaultWrite;
    this.serialize = config.serialize;
    this.deserialize = config.deserialize;
    this.toExpressionAst = config.toExpressionAst;
    this.options = config.options;
    this.modifyAggConfigOnSearchRequestStart = config.modifyAggConfigOnSearchRequestStart || function () {};
    this.valueType = config.valueType || config.type;
  }
}
exports.BaseParamType = BaseParamType;