"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataSourceManagementPlugin = void 0;
var _operators = require("rxjs/operators");
var _routes = require("./routes");
var _opensearch_data_source_management_plugin = require("./adaptors/opensearch_data_source_management_plugin");
var _ppl_plugin = require("./adaptors/ppl_plugin");
var _utils = require("../../../../src/core/server/utils");
var _common = require("../common");
var _data_source_premission_client_wrapper = require("./saved_objects/data_source_premission_client_wrapper");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */ // eslint-disable-next-line @osd/eslint/no-restricted-paths
class DataSourceManagementPlugin {
  setupDataSourcePermission(core, config) {
    core.http.registerOnPostAuth(async (request, response, toolkit) => {
      let groups;
      const [coreStart] = await core.getStartServices();
      try {
        ({
          groups = []
        } = (0, _utils.getPrincipalsFromRequest)(request, coreStart.http.auth));
      } catch (e) {
        return toolkit.next();
      }
      const configGroups = config.dataSourceAdmin.groups;
      const isDataSourceAdmin = configGroups.some(configGroup => groups.includes(configGroup));
      (0, _utils.updateWorkspaceState)(request, {
        isDataSourceAdmin
      });
      return toolkit.next();
    });
    const dataSourcePermissionWrapper = new _data_source_premission_client_wrapper.DataSourcePermissionClientWrapper(config.manageableBy);

    // Add data source permission client wrapper factory
    core.savedObjects.addClientWrapper(_common.ORDER_FOR_DATA_SOURCE_PERMISSION_WRAPPER, _common.DATA_SOURCE_PERMISSION_CLIENT_WRAPPER_ID, dataSourcePermissionWrapper.wrapperFactory);
  }
  constructor(initializerContext) {
    _defineProperty(this, "config$", void 0);
    _defineProperty(this, "logger", void 0);
    this.logger = initializerContext.logger.get();
    this.config$ = initializerContext.config.create();
  }
  async setup(core, deps) {
    const {
      dataSource
    } = deps;
    const config = await this.config$.pipe((0, _operators.first)()).toPromise();
    const dataSourceEnabled = !!dataSource;
    const openSearchDataSourceManagementClient = core.opensearch.legacy.createClient('opensearch_data_source_management', {
      plugins: [_ppl_plugin.PPLPlugin, _opensearch_data_source_management_plugin.OpenSearchDataSourceManagementPlugin]
    });
    this.logger.debug('dataSourceManagement: Setup');
    const router = core.http.createRouter();
    const {
      manageableBy
    } = config;
    core.capabilities.registerProvider(() => ({
      dataSource: {
        canManage: false
      }
    }));
    core.capabilities.registerSwitcher(request => {
      const {
        requestWorkspaceId,
        isDashboardAdmin
      } = (0, _utils.getWorkspaceState)(request);
      // User can not manage data source in the workspace.
      const canManage = manageableBy === _common.ManageableBy.All && !requestWorkspaceId || manageableBy === _common.ManageableBy.DashboardAdmin && isDashboardAdmin !== false && !requestWorkspaceId;
      return {
        dataSource: {
          canManage
        }
      };
    });
    if (dataSourceEnabled) {
      dataSource.registerCustomApiSchema(_ppl_plugin.PPLPlugin);
      dataSource.registerCustomApiSchema(_opensearch_data_source_management_plugin.OpenSearchDataSourceManagementPlugin);
      this.setupDataSourcePermission(core, config);
    }
    // @ts-ignore
    core.http.registerRouteHandlerContext('opensearch_data_source_management', (_context, _request) => {
      return {
        logger: this.logger,
        dataSourceManagementClient: openSearchDataSourceManagementClient
      };
    });
    (0, _routes.setupRoutes)({
      router,
      client: openSearchDataSourceManagementClient,
      dataSourceEnabled
    });
    return {};
  }
  start(core) {
    this.logger.debug('dataSourceManagement: Started');
    return {};
  }
  stop() {}
}
exports.DataSourceManagementPlugin = DataSourceManagementPlugin;