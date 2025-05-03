"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defineRoutes = defineRoutes;
exports.handleDeleteEntityConfig = handleDeleteEntityConfig;
exports.handleGetConfig = handleGetConfig;
exports.handleGetEntityConfig = handleGetEntityConfig;
exports.handleUpdateEntityConfig = handleUpdateEntityConfig;
var _configSchema = require("@osd/config-schema");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

function defineRoutes(router, getConfigurationClient, logger) {
  router.get({
    path: '/api/appconfig',
    validate: false
  }, async (context, request, response) => {
    return await handleGetConfig(getConfigurationClient, request, response, logger);
  });
  router.get({
    path: '/api/appconfig/{entity}',
    validate: {
      params: _configSchema.schema.object({
        entity: _configSchema.schema.string()
      })
    }
  }, async (context, request, response) => {
    return await handleGetEntityConfig(getConfigurationClient, request, response, logger);
  });
  router.post({
    path: '/api/appconfig/{entity}',
    validate: {
      params: _configSchema.schema.object({
        entity: _configSchema.schema.string()
      }),
      body: _configSchema.schema.object({
        newValue: _configSchema.schema.string()
      })
    }
  }, async (context, request, response) => {
    return await handleUpdateEntityConfig(getConfigurationClient, request, response, logger);
  });
  router.delete({
    path: '/api/appconfig/{entity}',
    validate: {
      params: _configSchema.schema.object({
        entity: _configSchema.schema.string()
      })
    }
  }, async (context, request, response) => {
    return await handleDeleteEntityConfig(getConfigurationClient, request, response, logger);
  });
}
async function handleGetEntityConfig(getConfigurationClient, request, response, logger) {
  logger.info(`Received a request to get entity config for ${request.params.entity}.`);
  const client = getConfigurationClient(request);
  try {
    const result = await client.getEntityConfig(request.params.entity, {
      headers: request.headers
    });
    return response.ok({
      body: {
        value: result
      }
    });
  } catch (e) {
    logger.error(e);
    return errorResponse(response, e);
  }
}
async function handleUpdateEntityConfig(getConfigurationClient, request, response, logger) {
  logger.info(`Received a request to update entity ${request.params.entity} with new value ${request.body.newValue}.`);
  const client = getConfigurationClient(request);
  try {
    const result = await client.updateEntityConfig(request.params.entity, request.body.newValue, {
      headers: request.headers
    });
    return response.ok({
      body: {
        newValue: result
      }
    });
  } catch (e) {
    logger.error(e);
    return errorResponse(response, e);
  }
}
async function handleDeleteEntityConfig(getConfigurationClient, request, response, logger) {
  logger.info(`Received a request to delete entity ${request.params.entity}.`);
  const client = getConfigurationClient(request);
  try {
    const result = await client.deleteEntityConfig(request.params.entity, {
      headers: request.headers
    });
    return response.ok({
      body: {
        deletedEntity: result
      }
    });
  } catch (e) {
    logger.error(e);
    return errorResponse(response, e);
  }
}
async function handleGetConfig(getConfigurationClient, request, response, logger) {
  logger.info('Received a request to get all configurations.');
  const client = getConfigurationClient(request);
  try {
    const result = await client.getConfig({
      headers: request.headers
    });
    return response.ok({
      body: {
        value: result
      }
    });
  } catch (e) {
    logger.error(e);
    return errorResponse(response, e);
  }
}
function errorResponse(response, error) {
  return response.customError({
    statusCode: (error === null || error === void 0 ? void 0 : error.statusCode) || 500,
    body: error
  });
}