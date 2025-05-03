"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WORKSPACES_API_BASE_URL = void 0;
exports.registerRoutes = registerRoutes;
var _configSchema = require("@osd/config-schema");
var _server = require("../../../../core/server");
var _utils = require("../../common/utils");
var _constants = require("../../common/constants");
var _duplicate = require("./duplicate");
var _utils2 = require("../utils");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const WORKSPACES_API_BASE_URL = exports.WORKSPACES_API_BASE_URL = '/api/workspaces';
const workspacePermissionMode = _configSchema.schema.oneOf([_configSchema.schema.literal(_server.WorkspacePermissionMode.Read), _configSchema.schema.literal(_server.WorkspacePermissionMode.Write), _configSchema.schema.literal(_server.WorkspacePermissionMode.LibraryRead), _configSchema.schema.literal(_server.WorkspacePermissionMode.LibraryWrite)]);
const principalType = _configSchema.schema.oneOf([_configSchema.schema.literal(_server.PrincipalType.Users), _configSchema.schema.literal(_server.PrincipalType.Groups)]);
const workspacePermissions = _configSchema.schema.recordOf(workspacePermissionMode, _configSchema.schema.recordOf(principalType, _configSchema.schema.arrayOf(_configSchema.schema.string()), {}));
const dataSourceIds = _configSchema.schema.arrayOf(_configSchema.schema.string());
const dataConnectionIds = _configSchema.schema.arrayOf(_configSchema.schema.string());
const settingsSchema = _configSchema.schema.object({
  permissions: _configSchema.schema.maybe(workspacePermissions),
  dataSources: _configSchema.schema.maybe(dataSourceIds),
  dataConnections: _configSchema.schema.maybe(dataConnectionIds)
});
const featuresSchema = _configSchema.schema.arrayOf(_configSchema.schema.string(), {
  minSize: 1,
  validate: featureConfigs => {
    const validateUseCaseConfigs = [_server.DEFAULT_NAV_GROUPS.all, _server.DEFAULT_NAV_GROUPS.observability, _server.DEFAULT_NAV_GROUPS['security-analytics'], _server.DEFAULT_NAV_GROUPS.essentials, _server.DEFAULT_NAV_GROUPS.search].map(({
      id
    }) => (0, _utils.getUseCaseFeatureConfig)(id));
    const useCaseConfigCount = featureConfigs.filter(config => validateUseCaseConfigs.includes(config)).length;
    if (useCaseConfigCount === 0) {
      return `At least one use case is required. Valid options: ${validateUseCaseConfigs.join(', ')}`;
    } else if (useCaseConfigCount > 1) {
      return 'Only one use case is allowed per workspace.';
    }
  }
});
const workspaceOptionalAttributesSchema = {
  description: _configSchema.schema.maybe(_configSchema.schema.string({
    maxLength: _constants.MAX_WORKSPACE_DESCRIPTION_LENGTH
  })),
  color: _configSchema.schema.maybe(_configSchema.schema.string({
    validate: color => {
      if (!(0, _utils.validateWorkspaceColor)(color)) {
        return 'invalid workspace color format';
      }
    }
  })),
  icon: _configSchema.schema.maybe(_configSchema.schema.string()),
  defaultVISTheme: _configSchema.schema.maybe(_configSchema.schema.string()),
  reserved: _configSchema.schema.maybe(_configSchema.schema.boolean())
};
const workspaceNameSchema = _configSchema.schema.string({
  maxLength: _constants.MAX_WORKSPACE_NAME_LENGTH,
  validate(value) {
    if (!value || value.trim().length === 0) {
      return "can't be empty or blank.";
    }
  }
});
const createWorkspaceAttributesSchema = _configSchema.schema.object({
  name: workspaceNameSchema,
  features: featuresSchema,
  ...workspaceOptionalAttributesSchema
});
const updateWorkspaceAttributesSchema = _configSchema.schema.object({
  name: _configSchema.schema.maybe(workspaceNameSchema),
  features: _configSchema.schema.maybe(featuresSchema),
  ...workspaceOptionalAttributesSchema
});
function registerRoutes({
  client,
  logger,
  router,
  maxImportExportSize,
  permissionControlClient,
  isPermissionControlEnabled,
  isDataSourceEnabled
}) {
  router.post({
    path: `${WORKSPACES_API_BASE_URL}/_list`,
    validate: {
      body: _configSchema.schema.object({
        search: _configSchema.schema.maybe(_configSchema.schema.string()),
        sortOrder: _configSchema.schema.maybe(_configSchema.schema.string()),
        perPage: _configSchema.schema.number({
          min: 0,
          defaultValue: 20
        }),
        page: _configSchema.schema.number({
          min: 0,
          defaultValue: 1
        }),
        sortField: _configSchema.schema.maybe(_configSchema.schema.string()),
        searchFields: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.string())),
        permissionModes: _configSchema.schema.maybe(_configSchema.schema.arrayOf(workspacePermissionMode))
      })
    }
  }, router.handleLegacyErrors(async (context, req, res) => {
    const result = await client.list({
      request: req
    }, req.body);
    if (!result.success) {
      return res.ok({
        body: result
      });
    }
    const {
      workspaces
    } = result.result;

    // enrich workspace permissionMode
    const principals = permissionControlClient === null || permissionControlClient === void 0 ? void 0 : permissionControlClient.getPrincipalsFromRequest(req);
    workspaces.forEach(workspace => {
      const permissionMode = (0, _utils2.translatePermissionsToRole)(isPermissionControlEnabled, workspace.permissions, principals);
      workspace.permissionMode = permissionMode;
    });
    return res.ok({
      body: result
    });
  }));
  router.get({
    path: `${WORKSPACES_API_BASE_URL}/{id}`,
    validate: {
      params: _configSchema.schema.object({
        id: _configSchema.schema.string()
      })
    }
  }, router.handleLegacyErrors(async (context, req, res) => {
    const {
      id
    } = req.params;
    const result = await client.get({
      request: req
    }, id);
    return res.ok({
      body: result
    });
  }));
  router.post({
    path: `${WORKSPACES_API_BASE_URL}`,
    validate: {
      body: _configSchema.schema.object({
        attributes: createWorkspaceAttributesSchema,
        settings: settingsSchema
      })
    }
  }, router.handleLegacyErrors(async (context, req, res) => {
    const {
      attributes,
      settings
    } = req.body;
    const principals = permissionControlClient === null || permissionControlClient === void 0 ? void 0 : permissionControlClient.getPrincipalsFromRequest(req);
    const createPayload = attributes;
    if (isPermissionControlEnabled) {
      var _principals$users;
      createPayload.permissions = settings.permissions;
      if (!!(principals !== null && principals !== void 0 && (_principals$users = principals.users) !== null && _principals$users !== void 0 && _principals$users.length)) {
        const currentUserId = principals.users[0];
        const acl = new _server.ACL((0, _utils2.transferCurrentUserInPermissions)(currentUserId, settings.permissions));
        createPayload.permissions = acl.getPermissions();
      }
    }
    createPayload.dataSources = settings.dataSources;
    createPayload.dataConnections = settings.dataConnections;
    const result = await client.create({
      request: req
    }, createPayload);
    return res.ok({
      body: result
    });
  }));
  router.put({
    path: `${WORKSPACES_API_BASE_URL}/{id?}`,
    validate: {
      params: _configSchema.schema.object({
        id: _configSchema.schema.string()
      }),
      body: _configSchema.schema.object({
        attributes: updateWorkspaceAttributesSchema,
        settings: settingsSchema
      })
    }
  }, router.handleLegacyErrors(async (context, req, res) => {
    const {
      id
    } = req.params;
    const {
      attributes,
      settings
    } = req.body;
    const result = await client.update({
      request: req
    }, id, {
      ...attributes,
      ...(isPermissionControlEnabled ? {
        permissions: settings.permissions
      } : {}),
      ...{
        dataSources: settings.dataSources
      },
      ...{
        dataConnections: settings.dataConnections
      }
    });
    return res.ok({
      body: result
    });
  }));
  router.delete({
    path: `${WORKSPACES_API_BASE_URL}/{id?}`,
    validate: {
      params: _configSchema.schema.object({
        id: _configSchema.schema.string()
      })
    }
  }, router.handleLegacyErrors(async (context, req, res) => {
    const {
      id
    } = req.params;
    const result = await client.delete({
      request: req
    }, id);
    return res.ok({
      body: result
    });
  }));
  router.post({
    path: `${WORKSPACES_API_BASE_URL}/_associate`,
    validate: {
      body: _configSchema.schema.object({
        workspaceId: _configSchema.schema.string(),
        savedObjects: _configSchema.schema.arrayOf(_configSchema.schema.object({
          id: _configSchema.schema.string(),
          type: _configSchema.schema.string()
        }))
      })
    }
  }, router.handleLegacyErrors(async (context, req, res) => {
    const {
      workspaceId,
      savedObjects
    } = req.body;
    const result = await client.associate({
      request: req
    }, workspaceId, savedObjects);
    return res.ok({
      body: result
    });
  }));
  router.post({
    path: `${WORKSPACES_API_BASE_URL}/_dissociate`,
    validate: {
      body: _configSchema.schema.object({
        workspaceId: _configSchema.schema.string(),
        savedObjects: _configSchema.schema.arrayOf(_configSchema.schema.object({
          id: _configSchema.schema.string(),
          type: _configSchema.schema.string()
        }))
      })
    }
  }, router.handleLegacyErrors(async (context, req, res) => {
    const {
      workspaceId,
      savedObjects
    } = req.body;
    const result = await client.dissociate({
      request: req
    }, workspaceId, savedObjects);
    return res.ok({
      body: result
    });
  }));

  // duplicate saved objects among workspaces
  (0, _duplicate.registerDuplicateRoute)(router, logger, client, maxImportExportSize, isDataSourceEnabled);
}