"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkspacePermissionMode = exports.PermissionModeId = void 0;
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
let WorkspacePermissionMode = exports.WorkspacePermissionMode = /*#__PURE__*/function (WorkspacePermissionMode) {
  WorkspacePermissionMode["Read"] = "read";
  WorkspacePermissionMode["Write"] = "write";
  WorkspacePermissionMode["LibraryRead"] = "library_read";
  WorkspacePermissionMode["LibraryWrite"] = "library_write";
  return WorkspacePermissionMode;
}({});