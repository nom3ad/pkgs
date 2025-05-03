"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ipv4Address = void 0;
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

const NUM_BYTES = 4;
const BYTE_SIZE = 256;
function throwError(ipAddress) {
  throw Error('Invalid IPv4 address: ' + ipAddress);
}
function isIntegerInRange(integer, min, max) {
  return !isNaN(integer) && integer >= min && integer < max && integer % 1 === 0;
}
class Ipv4Address {
  constructor(ipAddress) {
    _defineProperty(this, "value", void 0);
    if (typeof ipAddress === 'string') {
      this.value = 0;
      const bytes = ipAddress.split('.');
      if (bytes.length !== NUM_BYTES) {
        throwError(ipAddress);
      }
      for (let i = 0; i < bytes.length; i++) {
        const byte = Number(bytes[i]);
        if (!isIntegerInRange(byte, 0, BYTE_SIZE)) {
          throwError(ipAddress);
        }
        this.value += Math.pow(BYTE_SIZE, NUM_BYTES - 1 - i) * byte;
      }
    } else {
      this.value = ipAddress;
    }
    if (!isIntegerInRange(this.value, 0, Math.pow(BYTE_SIZE, NUM_BYTES))) {
      throwError(ipAddress);
    }
  }
  toString() {
    let value = this.value;
    const bytes = [];
    for (let i = 0; i < NUM_BYTES; i++) {
      bytes.unshift(value % 256);
      value = Math.floor(value / 256);
    }
    return bytes.join('.');
  }
  valueOf() {
    return this.value;
  }
}
exports.Ipv4Address = Ipv4Address;