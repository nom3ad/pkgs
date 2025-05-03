"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataSourceEngineType = exports.AuthType = void 0;
Object.defineProperty(exports, "DataSourceError", {
  enumerable: true,
  get: function () {
    return _error.DataSourceError;
  }
});
exports.SigV4ServiceName = void 0;
var _error = require("./error");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Multiple datasource supports authenticating as IAM user, it doesn't support IAM role.
 * Because IAM role session requires temporary security credentials through assuming role,
 * which makes no sense to store the credentials.
 */
let AuthType = exports.AuthType = /*#__PURE__*/function (AuthType) {
  AuthType["NoAuth"] = "no_auth";
  AuthType["UsernamePasswordType"] = "username_password";
  AuthType["SigV4"] = "sigv4";
  return AuthType;
}({}); // src/plugins/workspace/public/utils.ts Workspace plugin depends on this to do use case limitation.
let SigV4ServiceName = exports.SigV4ServiceName = /*#__PURE__*/function (SigV4ServiceName) {
  SigV4ServiceName["OpenSearch"] = "es";
  SigV4ServiceName["OpenSearchServerless"] = "aoss";
  return SigV4ServiceName;
}({});
let DataSourceEngineType = exports.DataSourceEngineType = /*#__PURE__*/function (DataSourceEngineType) {
  DataSourceEngineType["OpenSearch"] = "OpenSearch";
  DataSourceEngineType["OpenSearchServerless"] = "OpenSearch Serverless";
  DataSourceEngineType["Elasticsearch"] = "Elasticsearch";
  DataSourceEngineType["NA"] = "No Engine Type Available";
  return DataSourceEngineType;
}({});