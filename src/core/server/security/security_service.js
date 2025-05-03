"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SecurityService = void 0;
var _readonly_service = require("./readonly_service");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class SecurityService {
  constructor(coreContext) {
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "readonlyService", void 0);
    this.logger = coreContext.logger.get('security-service');
    this.readonlyService = new _readonly_service.ReadonlyService();
  }
  setup() {
    this.logger.debug('Setting up Security service');
    const securityService = this;
    return {
      registerReadonlyService(service) {
        securityService.readonlyService = service;
      },
      readonlyService() {
        return securityService.readonlyService;
      }
    };
  }
  start() {
    this.logger.debug('Starting plugin');
  }
  stop() {
    this.logger.debug('Stopping plugin');
  }
}
exports.SecurityService = SecurityService;