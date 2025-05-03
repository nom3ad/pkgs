"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateWorkspaceColor = exports.validateIsWorkspaceDataSourceAndConnectionObjectType = exports.getUseCaseFeatureConfig = void 0;
var _constants = require("./constants");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// Reference https://github.com/opensearch-project/oui/blob/main/src/services/color/is_valid_hex.ts
const validateWorkspaceColor = color => !!color && /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
exports.validateWorkspaceColor = validateWorkspaceColor;
const getUseCaseFeatureConfig = useCaseId => `${_constants.USE_CASE_PREFIX}${useCaseId}`;
exports.getUseCaseFeatureConfig = getUseCaseFeatureConfig;
const validateIsWorkspaceDataSourceAndConnectionObjectType = type => _constants.WORKSPACE_DATA_SOURCE_AND_CONNECTION_OBJECT_TYPES.includes(type);
exports.validateIsWorkspaceDataSourceAndConnectionObjectType = validateIsWorkspaceDataSourceAndConnectionObjectType;