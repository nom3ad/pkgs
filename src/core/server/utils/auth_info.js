"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPrincipalsFromRequest = void 0;
var _auth_state_storage = require("../http/auth_state_storage");
var _acl = require("../saved_objects/permission_control/acl");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const getPrincipalsFromRequest = (request, auth) => {
  const payload = {};
  const authInfoResp = auth === null || auth === void 0 ? void 0 : auth.get(request);
  if ((authInfoResp === null || authInfoResp === void 0 ? void 0 : authInfoResp.status) === _auth_state_storage.AuthStatus.unknown) {
    /**
     * Login user have access to all the workspaces when no authentication is presented.
     */
    return payload;
  }
  if ((authInfoResp === null || authInfoResp === void 0 ? void 0 : authInfoResp.status) === _auth_state_storage.AuthStatus.authenticated) {
    var _authState$authInfo, _authState$authInfo2, _authState$authInfo3;
    const authState = authInfoResp === null || authInfoResp === void 0 ? void 0 : authInfoResp.state;
    if (authState !== null && authState !== void 0 && (_authState$authInfo = authState.authInfo) !== null && _authState$authInfo !== void 0 && _authState$authInfo.backend_roles) {
      payload[_acl.PrincipalType.Groups] = authState.authInfo.backend_roles;
    }
    if (authState !== null && authState !== void 0 && (_authState$authInfo2 = authState.authInfo) !== null && _authState$authInfo2 !== void 0 && _authState$authInfo2.user_id) {
      payload[_acl.PrincipalType.Users] = [authState.authInfo.user_id];
    } else if (authState !== null && authState !== void 0 && (_authState$authInfo3 = authState.authInfo) !== null && _authState$authInfo3 !== void 0 && _authState$authInfo3.user_name) {
      payload[_acl.PrincipalType.Users] = [authState.authInfo.user_name];
    }
    return payload;
  }
  if ((authInfoResp === null || authInfoResp === void 0 ? void 0 : authInfoResp.status) === _auth_state_storage.AuthStatus.unauthenticated) {
    throw new Error('NOT_AUTHORIZED');
  }
  throw new Error('UNEXPECTED_AUTHORIZATION_STATUS');
};
exports.getPrincipalsFromRequest = getPrincipalsFromRequest;