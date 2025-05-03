"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWorkspaceIdFromUrl = exports.formatUrlWithWorkspaceId = exports.cleanWorkspaceId = void 0;
var _constants = require("./constants");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const getWorkspaceIdFromUrl = (url, basePath) => {
  const regexp = new RegExp(`^${basePath || ''}\/w\/([^\/]*)`);
  const urlObject = new URL(url);
  const matchedResult = urlObject.pathname.match(regexp);
  if (matchedResult) {
    return matchedResult[1];
  }
  return '';
};
exports.getWorkspaceIdFromUrl = getWorkspaceIdFromUrl;
const cleanWorkspaceId = path => {
  return path.replace(/^\/w\/([^\/]*)/, '');
};
exports.cleanWorkspaceId = cleanWorkspaceId;
const formatUrlWithWorkspaceId = (url, workspaceId, basePath) => {
  const newUrl = new URL(url, window.location.href);
  /**
   * Patch workspace id into path
   */
  newUrl.pathname = basePath.remove(newUrl.pathname);
  if (workspaceId) {
    newUrl.pathname = `${_constants.WORKSPACE_PATH_PREFIX}/${workspaceId}${newUrl.pathname}`;
  } else {
    newUrl.pathname = cleanWorkspaceId(newUrl.pathname);
  }
  newUrl.pathname = basePath.prepend(newUrl.pathname, {
    withoutClientBasePath: true
  });
  return newUrl.toString();
};
exports.formatUrlWithWorkspaceId = formatUrlWithWorkspaceId;