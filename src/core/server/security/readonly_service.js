"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReadonlyService = void 0;
var _lodash = require("lodash");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

class ReadonlyService {
  async isReadonly(request) {
    return false;
  }
  async hideForReadonly(request, capabilites, hideCapabilities) {
    return (await this.isReadonly(request)) ? (0, _lodash.merge)(capabilites, hideCapabilities) : capabilites;
  }
}
exports.ReadonlyService = ReadonlyService;