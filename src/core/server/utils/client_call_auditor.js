"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeClientCallAuditor = exports.getClientCallAuditor = exports.cleanUpClientCallAuditor = exports.CLIENT_CALL_AUDITOR_KEY = void 0;
var _router = require("../http/router");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
const clientCallAuditorKey = Symbol('clientCallAuditor');
const CLIENT_CALL_AUDITOR_KEY = exports.CLIENT_CALL_AUDITOR_KEY = {
  incoming: 'incoming',
  outgoing: 'outgoing'
};

/**
 * This class will be used to audit all the async calls to saved objects client.
 * For example, `/api/sample_data` will call savedObjectsClient.get() 3 times parallely and for ACL auditor,
 * it should only `checkout` when the incoming calls equal outgoing call.
 */
class ClientCallAuditor {
  constructor() {
    _defineProperty(this, "state", {});
  }
  increment(key) {
    this.state[key] = (this.state[key] || 0) + 1;
  }
  isAsyncClientCallsBalanced() {
    return this.state.incoming === this.state.outgoing;
  }
}

/**
 * This function will be used to initialize a new app state to the request
 *
 * @param request OpenSearchDashboardsRequest
 * @returns void
 */
const initializeClientCallAuditor = request => {
  const rawRequest = (0, _router.ensureRawRequest)(request);
  const appState = rawRequest.app;
  const clientCallAuditorInstance = appState[clientCallAuditorKey];
  if (clientCallAuditorInstance) {
    return;
  }
  appState[clientCallAuditorKey] = new ClientCallAuditor();
};
exports.initializeClientCallAuditor = initializeClientCallAuditor;
const getClientCallAuditor = request => {
  return (0, _router.ensureRawRequest)(request).app[clientCallAuditorKey];
};
exports.getClientCallAuditor = getClientCallAuditor;
const cleanUpClientCallAuditor = request => {
  (0, _router.ensureRawRequest)(request).app[clientCallAuditorKey] = undefined;
};
exports.cleanUpClientCallAuditor = cleanUpClientCallAuditor;