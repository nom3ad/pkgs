"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AggParamType = void 0;
var _agg_config = require("../agg_config");
var _base = require("./base");
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
class AggParamType extends _base.BaseParamType {
  constructor(config) {
    super(config);
    _defineProperty(this, "makeAgg", void 0);
    _defineProperty(this, "allowedAggs", []);
    if (config.allowedAggs) {
      this.allowedAggs = config.allowedAggs;
    }
    if (!config.write) {
      this.write = (aggConfig, output) => {
        if (aggConfig.params[this.name] && aggConfig.params[this.name].length) {
          output.params[this.name] = aggConfig.params[this.name];
        }
      };
    }
    if (!config.serialize) {
      this.serialize = agg => {
        return agg.serialize();
      };
    }
    if (!config.deserialize) {
      this.deserialize = (state, agg) => {
        if (!agg) {
          throw new Error('aggConfig was not provided to AggParamType deserialize function');
        }
        return this.makeAgg(agg, state);
      };
    }
    if (!config.toExpressionAst) {
      this.toExpressionAst = agg => {
        if (!agg || !agg.toExpressionAst) {
          throw new Error('aggConfig was not provided to AggParamType toExpressionAst function');
        }
        return agg.toExpressionAst();
      };
    }
    this.makeAgg = config.makeAgg;
    this.valueType = _agg_config.AggConfig;
  }
}
exports.AggParamType = AggParamType;