"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isResponseError = exports.DataSourceError = void 0;
var _common = require("../../../opensearch_dashboards_utils/common");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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