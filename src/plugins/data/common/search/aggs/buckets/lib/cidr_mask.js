"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CidrMask = void 0;
var _utils = require("../../utils");
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