"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateWorkspaceState = exports.getWorkspaceState = void 0;
var _router = require("../http/router");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * This function will be used as a proxy
 * because `ensureRequest` is only importable from core module.
 *
 * @param workspaceId string
 * @returns void
 */
const updateWorkspaceState = (request, payload) => {
  const rawRequest = (0, _router.ensureRawRequest)(request);
  rawRequest.app = {
    ...rawRequest.app,
    ...payload
  };
};

// TODO: Move isDataSourceAdmin and isDashboardAdmin out of WorkspaceState and this change is planned for version 2.18
exports.updateWorkspaceState = updateWorkspaceState;
const getWorkspaceState = request => {
  const {
    requestWorkspaceId,
    isDashboardAdmin,
    isDataSourceAdmin
  } = (0, _router.ensureRawRequest)(request).app;
  return {
    requestWorkspaceId,
    isDashboardAdmin,
    isDataSourceAdmin
  };
};
exports.getWorkspaceState = getWorkspaceState;