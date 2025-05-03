"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeACLAuditor = exports.getACLAuditor = exports.cleanUpACLAuditor = exports.ACLAuditorStateKey = void 0;
var _router = require("../http/router");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
const ACLAuditorKey = Symbol('ACLAuditor');
const ACLAuditorStateKey = exports.ACLAuditorStateKey = {
  VALIDATE_SUCCESS: 'validateSuccess',
  VALIDATE_FAILURE: 'validateFailure',
  DATABASE_OPERATION: 'databaseOperation'
};
const defaultState = {
  [ACLAuditorStateKey.VALIDATE_SUCCESS]: 0,
  [ACLAuditorStateKey.VALIDATE_FAILURE]: 0,
  [ACLAuditorStateKey.DATABASE_OPERATION]: 0
};
class ACLAuditor {
  constructor(logger) {
    this.logger = logger;
    _defineProperty(this, "state", {
      ...defaultState
    });
    _defineProperty(this, "reset", () => {
      this.state = {
        ...defaultState
      };
    });
    _defineProperty(this, "increment", (key, count) => {
      if (typeof count !== 'number' || !this.state.hasOwnProperty(key)) {
        return;
      }
      this.state[key] = this.state[key] + count;
    });
    _defineProperty(this, "checkout", requestInfo => {
      /**
       * VALIDATE_FAILURE represents the count for unauthorized call to a specific objects
       * VALIDATE_SUCCESS represents the count for authorized call to a specific objects
       * DATABASE_OPERATION represents the count for operations call to the database.
       *
       * Normally the operations call to the database should always <= the AuthZ check(VALIDATE_FAILURE + VALIDATE_SUCCESS)
       * If DATABASE_OPERATION > AuthZ check, it means we have somewhere bypasses the AuthZ check and we should audit this bypass behavior.
       */
      if (this.state[ACLAuditorStateKey.VALIDATE_FAILURE] + this.state[ACLAuditorStateKey.VALIDATE_SUCCESS] < this.state[ACLAuditorStateKey.DATABASE_OPERATION]) {
        this.logger.error(`[ACLCounterCheckoutFailed] counter state: ${JSON.stringify(this.state)}, ${requestInfo ? `requestInfo: ${requestInfo}` : ''}`);
      }
      this.reset();
    });
    _defineProperty(this, "getState", () => this.state);
  }
}
/**
 * This function will be used to initialize a new app state to the request
 *
 * @param request OpenSearchDashboardsRequest
 * @returns void
 */
const initializeACLAuditor = (request, logger) => {
  const rawRequest = (0, _router.ensureRawRequest)(request);
  const appState = rawRequest.app;
  const ACLCounterInstance = appState[ACLAuditorKey];
  if (ACLCounterInstance) {
    return;
  }
  appState[ACLAuditorKey] = new ACLAuditor(logger);
};
exports.initializeACLAuditor = initializeACLAuditor;
const getACLAuditor = request => {
  return (0, _router.ensureRawRequest)(request).app[ACLAuditorKey];
};
exports.getACLAuditor = getACLAuditor;
const cleanUpACLAuditor = request => {
  (0, _router.ensureRawRequest)(request).app[ACLAuditorKey] = undefined;
};
exports.cleanUpACLAuditor = cleanUpACLAuditor;