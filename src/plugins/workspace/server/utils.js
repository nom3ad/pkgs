"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateDashboardAdminStateForRequest = exports.translatePermissionsToRole = exports.transferCurrentUserInPermissions = exports.getOSDAdminConfigFromYMLConfig = exports.getDataSourcesList = exports.generateRandomId = exports.checkAndSetDefaultDataSource = void 0;
var _crypto = _interopRequireDefault(require("crypto"));
var _operators = require("rxjs/operators");
var _utils = require("../../../core/server/utils");
var _common = require("../../data_source_management/common");
var _constants = require("../common/constants");
var _server = require("../../../core/server");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generate URL friendly random ID
 */
const generateRandomId = size => {
  return _crypto.default.randomBytes(size).toString('base64url').slice(0, size);
};
exports.generateRandomId = generateRandomId;
const updateDashboardAdminStateForRequest = (request, groups, users, configGroups, configUsers) => {
  // If the security plugin is not installed, login defaults to OSD Admin
  if (!groups.length && !users.length) {
    (0, _utils.updateWorkspaceState)(request, {
      isDashboardAdmin: true
    });
    return;
  }
  // If groups/users are not configured or [], login defaults to OSD Admin
  if (!configGroups.length && !configUsers.length) {
    (0, _utils.updateWorkspaceState)(request, {
      isDashboardAdmin: true
    });
    return;
  }
  const groupMatchAny = groups.some(group => configGroups.includes(group));
  const userMatchAny = users.some(user => configUsers.includes(user));
  (0, _utils.updateWorkspaceState)(request, {
    isDashboardAdmin: groupMatchAny || userMatchAny
  });
};
exports.updateDashboardAdminStateForRequest = updateDashboardAdminStateForRequest;
const getOSDAdminConfigFromYMLConfig = async globalConfig$ => {
  var _globalConfig$opensea, _globalConfig$opensea2;
  const globalConfig = await globalConfig$.pipe((0, _operators.first)()).toPromise();
  const groupsResult = ((_globalConfig$opensea = globalConfig.opensearchDashboards) === null || _globalConfig$opensea === void 0 || (_globalConfig$opensea = _globalConfig$opensea.dashboardAdmin) === null || _globalConfig$opensea === void 0 ? void 0 : _globalConfig$opensea.groups) || [];
  const usersResult = ((_globalConfig$opensea2 = globalConfig.opensearchDashboards) === null || _globalConfig$opensea2 === void 0 || (_globalConfig$opensea2 = _globalConfig$opensea2.dashboardAdmin) === null || _globalConfig$opensea2 === void 0 ? void 0 : _globalConfig$opensea2.users) || [];
  return [groupsResult, usersResult];
};
exports.getOSDAdminConfigFromYMLConfig = getOSDAdminConfigFromYMLConfig;
const transferCurrentUserInPermissions = (realUserId, permissions) => {
  if (!permissions) {
    return permissions;
  }
  return Object.keys(permissions).reduce((previousPermissions, currentKey) => {
    var _permissions$currentK;
    return {
      ...previousPermissions,
      [currentKey]: {
        ...permissions[currentKey],
        users: (_permissions$currentK = permissions[currentKey].users) === null || _permissions$currentK === void 0 ? void 0 : _permissions$currentK.map(user => user === _constants.CURRENT_USER_PLACEHOLDER ? realUserId : user)
      }
    };
  }, {});
};
exports.transferCurrentUserInPermissions = transferCurrentUserInPermissions;
const getDataSourcesList = (client, workspaces) => {
  return client.find({
    type: 'data-source',
    fields: ['id', 'title'],
    perPage: 10000,
    workspaces
  }).then(response => {
    const objects = response === null || response === void 0 ? void 0 : response.saved_objects;
    if (objects) {
      return objects.map(source => {
        const id = source.id;
        return {
          id
        };
      });
    } else {
      return [];
    }
  });
};
exports.getDataSourcesList = getDataSourcesList;
const checkAndSetDefaultDataSource = async (uiSettingsClient, dataSources, needCheck) => {
  if ((dataSources === null || dataSources === void 0 ? void 0 : dataSources.length) > 0) {
    if (!needCheck) {
      // Create# Will set first data source as default data source.
      await uiSettingsClient.set(_common.DEFAULT_DATA_SOURCE_UI_SETTINGS_ID, dataSources[0]);
    } else {
      var _await$uiSettingsClie;
      // Update will check if default DS still exists.
      const defaultDSId = (_await$uiSettingsClie = await uiSettingsClient.get(_common.DEFAULT_DATA_SOURCE_UI_SETTINGS_ID)) !== null && _await$uiSettingsClie !== void 0 ? _await$uiSettingsClie : '';
      if (!dataSources.includes(defaultDSId)) {
        await uiSettingsClient.set(_common.DEFAULT_DATA_SOURCE_UI_SETTINGS_ID, dataSources[0]);
      }
    }
  } else {
    // If there is no data source left, clear workspace level default data source.
    await uiSettingsClient.set(_common.DEFAULT_DATA_SOURCE_UI_SETTINGS_ID, undefined);
  }
};

/**
 * translate workspace permission object into PermissionModeId
 * @param permissions workspace permissions object
 * @param isPermissionControlEnabled permission control flag
 * @param principals
 * @returns PermissionModeId
 */
exports.checkAndSetDefaultDataSource = checkAndSetDefaultDataSource;
const translatePermissionsToRole = (isPermissionControlEnabled, permissions, principals) => {
  let permissionMode = _server.PermissionModeId.Owner;
  if (isPermissionControlEnabled && permissions) {
    var _principals$users, _principals$groups;
    const modes = [];
    const currentUserId = (principals === null || principals === void 0 || (_principals$users = principals.users) === null || _principals$users === void 0 ? void 0 : _principals$users[0]) || '';
    const currentGroupId = (principals === null || principals === void 0 || (_principals$groups = principals.groups) === null || _principals$groups === void 0 ? void 0 : _principals$groups[0]) || '';
    [_constants.WorkspacePermissionMode.Write, _constants.WorkspacePermissionMode.LibraryWrite, _constants.WorkspacePermissionMode.LibraryRead, _constants.WorkspacePermissionMode.Read].forEach(mode => {
      var _permissions$mode$use, _permissions$mode$gro;
      if (permissions[mode] && ((_permissions$mode$use = permissions[mode].users) !== null && _permissions$mode$use !== void 0 && _permissions$mode$use.includes(currentUserId) || (_permissions$mode$gro = permissions[mode].groups) !== null && _permissions$mode$gro !== void 0 && _permissions$mode$gro.includes(currentGroupId))) {
        modes.push(mode);
      }
    });
    if (modes.includes(_constants.WorkspacePermissionMode.LibraryWrite) && modes.includes(_constants.WorkspacePermissionMode.Write)) {
      permissionMode = _server.PermissionModeId.Owner;
    } else if (modes.includes(_constants.WorkspacePermissionMode.LibraryWrite)) {
      permissionMode = _server.PermissionModeId.ReadAndWrite;
    } else {
      permissionMode = _server.PermissionModeId.Read;
    }
  } else {
    permissionMode = _server.PermissionModeId.Read;
  }
  return permissionMode;
};
exports.translatePermissionsToRole = translatePermissionsToRole;