"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoggingAuditor = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

class LoggingAuditor {
  constructor(request, logger) {
    this.request = request;
    this.logger = logger;
  }
  withAuditScope(name) {}
  add(event) {
    const message = event.message;
    const meta = {
      type: event.type
    };
    this.logger.info(message, meta);
  }
}
exports.LoggingAuditor = LoggingAuditor;