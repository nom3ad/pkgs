"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PermissionModeId = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
let PermissionModeId = exports.PermissionModeId = /*#__PURE__*/function (PermissionModeId) {
  PermissionModeId["Read"] = "read";
  PermissionModeId["ReadAndWrite"] = "read+write";
  PermissionModeId["Owner"] = "owner";
  return PermissionModeId;
}({});