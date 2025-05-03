"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ipv4Address = void 0;
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
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