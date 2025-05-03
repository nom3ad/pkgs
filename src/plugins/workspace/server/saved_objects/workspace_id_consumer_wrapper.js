"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkspaceIdConsumerWrapper = void 0;
var _utils = require("../../../../core/server/utils");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
const UI_SETTINGS_SAVED_OBJECTS_TYPE = 'config';
class WorkspaceIdConsumerWrapper {
  formatWorkspaceIdParams(request, options) {
    const {
      workspaces,
      ...others
    } = options || {};
    const workspaceState = (0, _utils.getWorkspaceState)(request);
    const workspaceIdParsedFromRequest = workspaceState === null || workspaceState === void 0 ? void 0 : workspaceState.requestWorkspaceId;
    const workspaceIdsInUserOptions = options === null || options === void 0 ? void 0 : options.workspaces;
    let finalWorkspaces = [];
    if (options !== null && options !== void 0 && options.hasOwnProperty('workspaces')) {
      // In order to get all data sources in workspace, use * to skip appending workspace id automatically
      finalWorkspaces = (workspaceIdsInUserOptions || []).filter(id => id !== '*');
    } else if (workspaceIdParsedFromRequest) {
      finalWorkspaces = [workspaceIdParsedFromRequest];
    }
    return {
      ...others,
      ...(finalWorkspaces.length ? {
        workspaces: finalWorkspaces
      } : {})
    };
  }
  isConfigType(type) {
    return type === UI_SETTINGS_SAVED_OBJECTS_TYPE;
  }
  constructor() {
    _defineProperty(this, "wrapperFactory", wrapperOptions => {
      return {
        ...wrapperOptions.client,
        create: (type, attributes, options = {}) => wrapperOptions.client.create(type, attributes, this.isConfigType(type) ? options : this.formatWorkspaceIdParams(wrapperOptions.request, options)),
        bulkCreate: (objects, options = {}) => wrapperOptions.client.bulkCreate(objects, this.formatWorkspaceIdParams(wrapperOptions.request, options)),
        checkConflicts: (objects = [], options = {}) => wrapperOptions.client.checkConflicts(objects, this.formatWorkspaceIdParams(wrapperOptions.request, options)),
        delete: wrapperOptions.client.delete,
        find: options => {
          return wrapperOptions.client.find(
          // Based on https://github.com/opensearch-project/OpenSearch-Dashboards/blob/main/src/core/server/ui_settings/create_or_upgrade_saved_config/get_upgradeable_config.ts#L49
          // we need to make sure the find call for upgrade config should be able to find all the global configs as it was before.
          // It is a workaround for 2.17, should be optimized in the upcoming 2.18 release.
          this.isConfigType(options.type) && options.sortField === 'buildNum' ? options : this.formatWorkspaceIdParams(wrapperOptions.request, options));
        },
        bulkGet: wrapperOptions.client.bulkGet,
        get: wrapperOptions.client.get,
        update: wrapperOptions.client.update,
        bulkUpdate: wrapperOptions.client.bulkUpdate,
        addToNamespaces: wrapperOptions.client.addToNamespaces,
        deleteFromNamespaces: wrapperOptions.client.deleteFromNamespaces,
        deleteByWorkspace: wrapperOptions.client.deleteByWorkspace
      };
    });
  }
}
exports.WorkspaceIdConsumerWrapper = WorkspaceIdConsumerWrapper;