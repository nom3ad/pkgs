"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkspacePlugin = void 0;
var _operators = require("rxjs/operators");
var _constants = require("../common/constants");
var _workspace_client = require("./workspace_client");
var _routes = require("./routes");
var _saved_objects = require("./saved_objects");
var _utils = require("../../../core/server/utils");
var _saved_objects_wrapper_for_check_workspace_conflict = require("./saved_objects/saved_objects_wrapper_for_check_workspace_conflict");
var _client = require("./permission_control/client");
var _utils2 = require("./utils");
var _workspace_id_consumer_wrapper = require("./saved_objects/workspace_id_consumer_wrapper");
var _workspace_ui_settings_client_wrapper = require("./saved_objects/workspace_ui_settings_client_wrapper");
var _ui_settings = require("./ui_settings");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class WorkspacePlugin {
  proxyWorkspaceTrafficToRealHandler(setupDeps) {
    /**
     * Proxy all {basePath}/w/{workspaceId}{osdPath*} paths to {basePath}{osdPath*}
     */
    setupDeps.http.registerOnPreRouting(async (request, response, toolkit) => {
      const workspaceId = (0, _utils.getWorkspaceIdFromUrl)(request.url.toString(), '' // No need to pass basePath here because the request.url will be rewrite by registerOnPreRouting method in `src/core/server/http/http_server.ts`
      );

      if (workspaceId) {
        (0, _utils.updateWorkspaceState)(request, {
          requestWorkspaceId: workspaceId
        });
        const requestUrl = new URL(request.url.toString());
        requestUrl.pathname = (0, _utils.cleanWorkspaceId)(requestUrl.pathname);
        return toolkit.rewriteUrl(requestUrl.toString());
      }
      return toolkit.next();
    });
  }
  setupPermission(core) {
    this.permissionControl = new _client.SavedObjectsPermissionControl(this.logger);
    core.http.registerOnPostAuth(async (request, response, toolkit) => {
      let groups;
      let users;

      // There may be calls to saved objects client before user get authenticated, need to add a try catch here as `getPrincipalsFromRequest` will throw error when user is not authenticated.
      try {
        ({
          groups = [],
          users = []
        } = this.permissionControl.getPrincipalsFromRequest(request));
      } catch (e) {
        return toolkit.next();
      }
      const [configGroups, configUsers] = await (0, _utils2.getOSDAdminConfigFromYMLConfig)(this.globalConfig$);
      (0, _utils2.updateDashboardAdminStateForRequest)(request, groups, users, configGroups, configUsers);
      return toolkit.next();
    });
    this.workspaceSavedObjectsClientWrapper = new _saved_objects.WorkspaceSavedObjectsClientWrapper(this.permissionControl);
    core.savedObjects.addClientWrapper(_constants.PRIORITY_FOR_PERMISSION_CONTROL_WRAPPER, _constants.WORKSPACE_SAVED_OBJECTS_CLIENT_WRAPPER_ID, this.workspaceSavedObjectsClientWrapper.wrapperFactory);
    core.http.registerOnPreResponse((request, _response, toolkit) => {
      var _this$permissionContr;
      (_this$permissionContr = this.permissionControl) === null || _this$permissionContr === void 0 || _this$permissionContr.clearSavedObjectsCache(request);
      return toolkit.next();
    });
  }
  setUpRedirectPage(core) {
    core.http.registerOnPostAuth(async (request, response, toolkit) => {
      const path = request.url.pathname;
      if (path === '/') {
        var _this$client;
        const workspaceListResponse = await ((_this$client = this.client) === null || _this$client === void 0 ? void 0 : _this$client.list({
          request,
          logger: this.logger
        }, {
          page: 1,
          perPage: 100
        }));
        const basePath = core.http.basePath.serverBasePath;
        if (workspaceListResponse !== null && workspaceListResponse !== void 0 && workspaceListResponse.success && workspaceListResponse.result.total > 0) {
          const workspaceList = workspaceListResponse.result.workspaces;
          // If user only has one workspace, go to overview page of that workspace
          if (workspaceList.length === 1) {
            return response.redirected({
              headers: {
                location: `${basePath}/w/${workspaceList[0].id}/app/${_constants.WORKSPACE_NAVIGATION_APP_ID}`
              }
            });
          }
          const [coreStart] = await core.getStartServices();
          const uiSettingsClient = coreStart.uiSettings.asScopedToClient(coreStart.savedObjects.getScopedClient(request));
          const defaultWorkspaceId = await uiSettingsClient.get(_constants.DEFAULT_WORKSPACE);
          const defaultWorkspace = workspaceList.find(workspace => workspace.id === defaultWorkspaceId);
          // If user has a default workspace configured, go to overview page of that workspace
          // If user has more than one workspaces, go to homepage
          if (defaultWorkspace) {
            return response.redirected({
              headers: {
                location: `${basePath}/w/${defaultWorkspace.id}/app/${_constants.WORKSPACE_NAVIGATION_APP_ID}`
              }
            });
          } else {
            return response.redirected({
              headers: {
                location: `${basePath}/app/home`
              }
            });
          }
        }
        // If user has no workspaces, go to initial page
        return response.redirected({
          headers: {
            location: `${basePath}/app/${_constants.WORKSPACE_INITIAL_APP_ID}`
          }
        });
      }
      return toolkit.next();
    });
  }
  constructor(initializerContext) {
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "client", void 0);
    _defineProperty(this, "workspaceConflictControl", void 0);
    _defineProperty(this, "permissionControl", void 0);
    _defineProperty(this, "globalConfig$", void 0);
    _defineProperty(this, "workspaceSavedObjectsClientWrapper", void 0);
    _defineProperty(this, "workspaceUiSettingsClientWrapper", void 0);
    this.logger = initializerContext.logger.get();
    this.globalConfig$ = initializerContext.config.legacy.globalConfig$;
  }
  async setup(core) {
    this.logger.debug('Setting up Workspaces service');
    const globalConfig = await this.globalConfig$.pipe((0, _operators.first)()).toPromise();
    const isPermissionControlEnabled = globalConfig.savedObjects.permission.enabled === true;

    // setup new ui_setting user's default workspace
    core.uiSettings.register(_ui_settings.uiSettings);
    this.client = new _workspace_client.WorkspaceClient(core, this.logger);
    await this.client.setup(core);
    this.workspaceConflictControl = new _saved_objects_wrapper_for_check_workspace_conflict.WorkspaceConflictSavedObjectsClientWrapper();
    core.savedObjects.addClientWrapper(_constants.PRIORITY_FOR_WORKSPACE_CONFLICT_CONTROL_WRAPPER, _constants.WORKSPACE_CONFLICT_CONTROL_SAVED_OBJECTS_CLIENT_WRAPPER_ID, this.workspaceConflictControl.wrapperFactory);
    this.proxyWorkspaceTrafficToRealHandler(core);
    const workspaceUiSettingsClientWrapper = new _workspace_ui_settings_client_wrapper.WorkspaceUiSettingsClientWrapper(this.logger);
    this.workspaceUiSettingsClientWrapper = workspaceUiSettingsClientWrapper;
    core.savedObjects.addClientWrapper(_constants.PRIORITY_FOR_WORKSPACE_UI_SETTINGS_WRAPPER, _constants.WORKSPACE_UI_SETTINGS_CLIENT_WRAPPER_ID, workspaceUiSettingsClientWrapper.wrapperFactory);
    core.savedObjects.addClientWrapper(_constants.PRIORITY_FOR_WORKSPACE_ID_CONSUMER_WRAPPER, _constants.WORKSPACE_ID_CONSUMER_WRAPPER_ID, new _workspace_id_consumer_wrapper.WorkspaceIdConsumerWrapper().wrapperFactory);
    const maxImportExportSize = core.savedObjects.getImportExportObjectLimit();
    this.logger.info('Workspace permission control enabled:' + isPermissionControlEnabled);
    if (isPermissionControlEnabled) this.setupPermission(core);
    const router = core.http.createRouter();
    (0, _routes.registerRoutes)({
      router,
      logger: this.logger,
      client: this.client,
      maxImportExportSize,
      permissionControlClient: this.permissionControl,
      isPermissionControlEnabled
    });
    core.capabilities.registerProvider(() => ({
      workspaces: {
        enabled: true,
        permissionEnabled: isPermissionControlEnabled
      },
      dashboards: {
        isDashboardAdmin: false
      }
    }));
    // Dynamically update capabilities based on the auth information from request.
    core.capabilities.registerSwitcher(request => {
      // If the value is undefined/true, the user is dashboard admin.
      const isDashboardAdmin = (0, _utils.getWorkspaceState)(request).isDashboardAdmin !== false;
      return {
        dashboards: {
          isDashboardAdmin
        }
      };
    });
    this.setUpRedirectPage(core);
    return {
      client: this.client
    };
  }
  start(core) {
    var _this$permissionContr2, _this$client2, _this$client3, _this$workspaceConfli, _this$workspaceSavedO, _this$workspaceUiSett;
    this.logger.debug('Starting Workspace service');
    (_this$permissionContr2 = this.permissionControl) === null || _this$permissionContr2 === void 0 || _this$permissionContr2.setup(core.savedObjects.getScopedClient, core.http.auth);
    (_this$client2 = this.client) === null || _this$client2 === void 0 || _this$client2.setSavedObjects(core.savedObjects);
    (_this$client3 = this.client) === null || _this$client3 === void 0 || _this$client3.setUiSettings(core.uiSettings);
    (_this$workspaceConfli = this.workspaceConflictControl) === null || _this$workspaceConfli === void 0 || _this$workspaceConfli.setSerializer(core.savedObjects.createSerializer());
    (_this$workspaceSavedO = this.workspaceSavedObjectsClientWrapper) === null || _this$workspaceSavedO === void 0 || _this$workspaceSavedO.setScopedClient(core.savedObjects.getScopedClient);
    (_this$workspaceUiSett = this.workspaceUiSettingsClientWrapper) === null || _this$workspaceUiSett === void 0 || _this$workspaceUiSett.setScopedClient(core.savedObjects.getScopedClient);
    return {
      client: this.client
    };
  }
  stop() {}
}
exports.WorkspacePlugin = WorkspacePlugin;