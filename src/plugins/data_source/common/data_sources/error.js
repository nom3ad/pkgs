"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isResponseError = exports.DataSourceError = void 0;
var _common = require("../../../opensearch_dashboards_utils/common");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class DataSourceError extends _common.OsdError {
  constructor(error, context, statusCode) {
    let message;
    if (context) {
      message = context;
    } else if (isResponseError(error)) {
      message = JSON.stringify(error.meta.body);
    } else {
      message = error.message;
    }
    super('Data Source Error: ' + message);
    // must have statusCode to avoid route handler in search.ts to return 500
    _defineProperty(this, "statusCode", void 0);
    _defineProperty(this, "body", void 0);
    if (error.body) {
      this.body = error.body;
    }
    if (statusCode) {
      this.statusCode = statusCode;
    } else if (error.statusCode) {
      this.statusCode = error.statusCode;
    } else {
      this.statusCode = 400;
    }
  }
}
exports.DataSourceError = DataSourceError;
const isResponseError = error => {
  return Boolean(error.body && error.statusCode && error.headers);
};
exports.isResponseError = isResponseError;