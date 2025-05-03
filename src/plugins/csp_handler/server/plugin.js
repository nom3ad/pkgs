"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CspHandlerPlugin = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

class CspHandlerPlugin {
  constructor(initializerContext) {
    _defineProperty(this, "logger", void 0);
    this.logger = initializerContext.logger.get();
  }
  async setup(core, {
    applicationConfig
  }) {
    /**
     * TODO Deprecate this plugin (right now it needs to be enabled for Dashboards plugin to function)
     */
    // core.http.registerOnPreResponse(
    //   createCspRulesPreResponseHandler(
    //     core,
    //     core.http.csp.header,
    //     applicationConfig.getConfigurationClient,
    //     this.logger
    //   )
    // );

    return {};
  }
  start(core) {
    return {};
  }
  stop() {}
}
exports.CspHandlerPlugin = CspHandlerPlugin;