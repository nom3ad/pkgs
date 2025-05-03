"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataExplorerPlugin = void 0;
var _routes = require("./routes");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class DataExplorerPlugin {
  constructor(initializerContext) {
    _defineProperty(this, "logger", void 0);
    this.logger = initializerContext.logger.get();
  }
  setup(core) {
    this.logger.debug('dataExplorer: Setup');
    const router = core.http.createRouter();

    // Register server side APIs
    (0, _routes.defineRoutes)(router);
    return {};
  }
  start(core) {
    this.logger.debug('dataExplorer: Started');
    return {};
  }
  stop() {}
}
exports.DataExplorerPlugin = DataExplorerPlugin;