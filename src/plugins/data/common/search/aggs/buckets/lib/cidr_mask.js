"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CidrMask = void 0;
var _utils = require("../../utils");
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
const NUM_BITS = 32;
function throwError(mask) {
  throw Error('Invalid CIDR mask: ' + mask);
}
class CidrMask {
  constructor(mask) {
    _defineProperty(this, "initialAddress", void 0);
    _defineProperty(this, "prefixLength", void 0);
    const splits = mask.split('/');
    if (splits.length !== 2) {
      throwError(mask);
    }
    this.initialAddress = new _utils.Ipv4Address(splits[0]);
    this.prefixLength = Number(splits[1]);
    if (isNaN(this.prefixLength) || this.prefixLength < 1 || this.prefixLength > NUM_BITS) {
      throwError(mask);
    }
  }
  getRange() {
    const variableBits = NUM_BITS - this.prefixLength;
    // eslint-disable-next-line no-bitwise
    const fromAddress = this.initialAddress.valueOf() >> variableBits << variableBits >>> 0; // >>> 0 coerces to unsigned
    const numAddresses = Math.pow(2, variableBits);
    return {
      from: new _utils.Ipv4Address(fromAddress).toString(),
      to: new _utils.Ipv4Address(fromAddress + numAddresses - 1).toString()
    };
  }
  toString() {
    return this.initialAddress.toString() + '/' + this.prefixLength;
  }
}
exports.CidrMask = CidrMask;