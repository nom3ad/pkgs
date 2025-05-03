"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NavGroupType = exports.NavGroupStatus = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * There are two types of navGroup:
 * 1: system nav group, like data administration / settings and setup
 * 2: use case group, like observability.
 *
 * by default the nav group will be regarded as use case group.
 */
let NavGroupType = exports.NavGroupType = /*#__PURE__*/function (NavGroupType) {
  NavGroupType["SYSTEM"] = "system";
  return NavGroupType;
}({});
let NavGroupStatus = exports.NavGroupStatus = /*#__PURE__*/function (NavGroupStatus) {
  NavGroupStatus[NavGroupStatus["Visible"] = 0] = "Visible";
  NavGroupStatus[NavGroupStatus["Hidden"] = 1] = "Hidden";
  return NavGroupStatus;
}({});
/** @public */