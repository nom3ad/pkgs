"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractUserName = void 0;
var _utils = require("../../../core/server/utils");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const extractUserName = (request, core) => {
  try {
    var _principals$users;
    const principals = (0, _utils.getPrincipalsFromRequest)(request, core === null || core === void 0 ? void 0 : core.http.auth);
    if (principals && (_principals$users = principals.users) !== null && _principals$users !== void 0 && _principals$users.length) {
      return principals.users[0];
    }
  } catch (error) {
    return undefined;
  }
};
exports.extractUserName = extractUserName;