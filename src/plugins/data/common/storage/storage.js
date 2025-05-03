"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StorageKeys = exports.DataStorage = void 0;
exports.createStorage = createStorage;
var _lodash = require("lodash");
var _std = require("@osd/std");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
let StorageKeys = exports.StorageKeys = /*#__PURE__*/function (StorageKeys) {
  StorageKeys["WIDTH"] = "widths";
  return StorageKeys;
}({});
class DataStorage {
  constructor(engine, prefix) {
    this.engine = engine;
    this.prefix = prefix;
  }
  encode(val) {
    return (0, _std.stringify)(val);
  }
  decode(val) {
    if (typeof val === 'string') {
      return (0, _std.parse)(val);
    }
  }
  encodeKey(key) {
    return `${this.prefix}${key}`;
  }
  decodeKey(key) {
    if ((0, _lodash.startsWith)(key, this.prefix)) {
      return `${key.slice(this.prefix.length)}`;
    }
  }
  set(key, val) {
    this.engine.setItem(this.encodeKey(key), this.encode(val));
    return val;
  }
  has(key) {
    return this.engine.getItem(this.encodeKey(key)) != null;
  }
  get(key, _default) {
    if (this.has(key)) {
      return this.decode(this.engine.getItem(this.encodeKey(key)));
    } else {
      return _default;
    }
  }
  remove(key) {
    return this.engine.removeItem(this.encodeKey(key));
  }
  keys() {
    return (0, _lodash.transform)((0, _lodash.keys)(this.engine), (ours, key) => {
      const ourKey = this.decodeKey(key);
      if (ourKey != null) ours.push(ourKey);
    });
  }
  clear() {
    this.engine.clear();
  }
}
exports.DataStorage = DataStorage;
function createStorage(deps) {
  return new DataStorage(deps.engine, deps.prefix);
}