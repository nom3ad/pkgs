"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkspaceService = void 0;
var _operators = require("rxjs/operators");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/** @internal */
class WorkspaceService {
  constructor(coreContext) {
    this.coreContext = coreContext;
    _defineProperty(this, "log", void 0);
    _defineProperty(this, "config$", void 0);
    this.log = this.coreContext.logger.get('workspace-service');
    this.config$ = this.coreContext.configService.atPath('workspace');
  }
  async setup() {
    this.log.debug('Setting up workspace service');
    const workspaceConfig = await this.config$.pipe((0, _operators.first)()).toPromise();
    return {
      isWorkspaceEnabled: () => workspaceConfig.enabled
    };
  }
  async start() {
    this.log.debug('Starting workspace service');
    const workspaceConfig = await this.config$.pipe((0, _operators.first)()).toPromise();
    return {
      isWorkspaceEnabled: () => workspaceConfig.enabled
    };
  }
  async stop() {}
}
exports.WorkspaceService = WorkspaceService;