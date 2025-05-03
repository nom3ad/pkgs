"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SecurityService = void 0;
var _readonly_service = require("./readonly_service");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
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