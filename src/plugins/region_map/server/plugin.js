"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RegionMapPlugin = void 0;
var _routes = require("../server/routes");
var _ui_settings = require("./ui_settings");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class RegionMapPlugin {
  constructor(initializerContext) {
    _defineProperty(this, "logger", void 0);
    this.logger = initializerContext.logger.get();
  }
  setup(core) {
    this.logger.debug('RegionMap: Setup');
    const router = core.http.createRouter();
    core.uiSettings.register((0, _ui_settings.getUiSettings)());
    (0, _routes.registerGeospatialRoutes)(router);
    return {};
  }
  start(_core) {
    this.logger.debug('RegionMap: Started');
    return {};
  }
  stop() {}
}
exports.RegionMapPlugin = RegionMapPlugin;