"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Keystore = void 0;
var _fs = require("fs");
var _crypto = require("crypto");
var errors = _interopRequireWildcard(require("./errors"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
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
const VERSION = 1;
const ALGORITHM = 'aes-256-gcm';
const ITERATIONS = 10000;
class Keystore {
  constructor(path, password = '') {
    this.path = path;
    this.password = password;
    this.reset();
    this.load();
  }
  static encrypt(text, password = '') {
    const iv = (0, _crypto.randomBytes)(12);
    const salt = (0, _crypto.randomBytes)(64);
    const key = (0, _crypto.pbkdf2Sync)(password, salt, ITERATIONS, 32, 'sha512');
    const cipher = (0, _crypto.createCipheriv)(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([salt, iv, tag, ciphertext]).toString('base64');
  }
  static decrypt(data, password = '') {
    try {
      const bData = Buffer.from(data, 'base64');

      // convert data to buffers
      const salt = bData.slice(0, 64);
      const iv = bData.slice(64, 76);
      const tag = bData.slice(76, 92);
      const text = bData.slice(92);
      const key = (0, _crypto.pbkdf2Sync)(password, salt, ITERATIONS, 32, 'sha512');
      const decipher = (0, _crypto.createDecipheriv)(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      return decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');
    } catch (e) {
      throw new errors.UnableToReadKeystore();
    }
  }
  save() {
    const text = JSON.stringify(this.data);

    // The encrypted text and the version are colon delimited to make
    // it easy to visually read the version as we could have easily
    // included it with the buffer

    const keystore = [VERSION, Keystore.encrypt(text, this.password)].join(':');
    (0, _fs.writeFileSync)(this.path, keystore);
  }
  load() {
    try {
      const keystore = (0, _fs.readFileSync)(this.path);
      const [, data] = keystore.toString().split(':');
      this.data = JSON.parse(Keystore.decrypt(data, this.password));
    } catch (e) {
      if (e.code === 'ENOENT') {
        return;
      }
      throw e;
    }
  }
  reset() {
    this.data = {};
  }
  exists() {
    return (0, _fs.existsSync)(this.path);
  }
  keys() {
    return Object.keys(this.data);
  }
  has(key) {
    return this.keys().indexOf(key) > -1;
  }
  add(key, value) {
    this.data[key] = value;
  }
  remove(key) {
    delete this.data[key];
  }
}
exports.Keystore = Keystore;
_defineProperty(Keystore, "errors", errors);