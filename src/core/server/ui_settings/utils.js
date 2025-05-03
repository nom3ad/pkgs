"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildDocIdWithScope = exports.CURRENT_USER_PLACEHOLDER = void 0;
var _types = require("./types");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const CURRENT_USER_PLACEHOLDER = exports.CURRENT_USER_PLACEHOLDER = '<current_user>';
const buildDocIdWithScope = (id, scope) => {
  if (scope === _types.UiSettingScope.USER) {
    return `${CURRENT_USER_PLACEHOLDER}_${id}`;
  }
  return id;
};
exports.buildDocIdWithScope = buildDocIdWithScope;