"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerDuplicateRoute = void 0;
var _configSchema = require("@osd/config-schema");
var _server = require("../../../../core/server");
var _ = require(".");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const registerDuplicateRoute = (router, logger, client, maxImportExportSize) => {
  router.post({
    path: `${_.WORKSPACES_API_BASE_URL}/_duplicate_saved_objects`,
    validate: {
      body: _configSchema.schema.object({
        objects: _configSchema.schema.arrayOf(_configSchema.schema.object({
          type: _configSchema.schema.string(),
          id: _configSchema.schema.string()
        })),
        includeReferencesDeep: _configSchema.schema.boolean({
          defaultValue: true
        }),
        targetWorkspace: _configSchema.schema.string()
      })
    }
  }, router.handleLegacyErrors(async (context, req, res) => {
    const savedObjectsClient = context.core.savedObjects.client;
    const {
      objects,
      includeReferencesDeep,
      targetWorkspace
    } = req.body;

    // need to access the registry for type validation, can't use the schema for this
    const supportedTypes = context.core.savedObjects.typeRegistry.getImportableAndExportableTypes().map(t => t.name);
    const invalidObjects = objects.filter(obj => !supportedTypes.includes(obj.type));
    if (invalidObjects.length) {
      return res.badRequest({
        body: {
          message: `Trying to duplicate object(s) with unsupported types: ${invalidObjects.map(obj => `${obj.type}:${obj.id}`).join(', ')}`
        }
      });
    }

    // check whether the target workspace exists or not
    const getTargetWorkspaceResult = await client.get({
      request: req,
      logger
    }, targetWorkspace);
    if (!getTargetWorkspaceResult.success) {
      return res.badRequest({
        body: {
          message: `Get target workspace ${targetWorkspace} error: ${getTargetWorkspaceResult.error}`
        }
      });
    }

    // fetch all the details of the specified saved objects
    const objectsListStream = await (0, _server.exportSavedObjectsToStream)({
      savedObjectsClient,
      objects,
      exportSizeLimit: maxImportExportSize,
      includeReferencesDeep,
      excludeExportDetails: true
    });

    // import the saved objects into the target workspace
    const result = await (0, _server.importSavedObjectsFromStream)({
      savedObjectsClient: context.core.savedObjects.client,
      typeRegistry: context.core.savedObjects.typeRegistry,
      readStream: objectsListStream,
      objectLimit: maxImportExportSize,
      overwrite: false,
      createNewCopies: true,
      workspaces: [targetWorkspace],
      dataSourceEnabled: true
    });
    return res.ok({
      body: result
    });
  }));
};
exports.registerDuplicateRoute = registerDuplicateRoute;