"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CustomApiSchemaRegistry = void 0;
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class CustomApiSchemaRegistry {
  constructor() {
    _defineProperty(this, "schemaRegistry", void 0);
    this.schemaRegistry = new Array();
  }
  register(schema) {
    this.schemaRegistry.push(schema);
  }
  getAll() {
    return this.schemaRegistry;
  }
}
exports.CustomApiSchemaRegistry = CustomApiSchemaRegistry;