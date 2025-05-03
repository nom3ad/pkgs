"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerQueryAssistRoutes = registerQueryAssistRoutes;
var _configSchema = require("@osd/config-schema");
var _errors = require("../../..../../../../../core/server/opensearch/client/errors");
var _common = require("../../../common");
var _agents = require("./agents");
var _createResponse = require("./createResponse");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// eslint-disable-next-line @osd/eslint/no-restricted-paths

function registerQueryAssistRoutes(router) {
  router.get({
    path: _common.API.QUERY_ASSIST.LANGUAGES,
    validate: {
      query: _configSchema.schema.object({
        dataSourceId: _configSchema.schema.maybe(_configSchema.schema.string())
      })
    }
  }, async (context, request, response) => {
    const config = await context.query_assist.configPromise;
    const client = context.query_assist.dataSourceEnabled && request.query.dataSourceId ? await context.dataSource.opensearch.getClient(request.query.dataSourceId) : context.core.opensearch.client.asCurrentUser;
    const configuredLanguages = [];
    try {
      await Promise.allSettled(config.queryAssist.supportedLanguages.map(languageConfig =>
      // if the call does not throw any error, then the agent is properly configured
      (0, _agents.getAgentIdByConfig)(client, languageConfig.agentConfig).then(() => configuredLanguages.push(languageConfig.language))));
      return response.ok({
        body: {
          configuredLanguages
        }
      });
    } catch (error) {
      return response.ok({
        body: {
          configuredLanguages,
          error: error.message
        }
      });
    }
  });
  router.post({
    path: _common.API.QUERY_ASSIST.GENERATE,
    validate: {
      body: _configSchema.schema.object({
        index: _configSchema.schema.string(),
        question: _configSchema.schema.string(),
        language: _configSchema.schema.string(),
        dataSourceId: _configSchema.schema.maybe(_configSchema.schema.string())
      })
    }
  }, async (context, request, response) => {
    const config = await context.query_assist.configPromise;
    const languageConfig = config.queryAssist.supportedLanguages.find(c => c.language === request.body.language);
    if (!languageConfig) return response.badRequest({
      body: 'Unsupported language'
    });
    try {
      const agentResponse = await (0, _agents.requestAgentByConfig)({
        context,
        configName: languageConfig.agentConfig,
        body: {
          parameters: {
            index: request.body.index,
            question: request.body.question
          }
        },
        dataSourceId: request.body.dataSourceId
      });
      const responseBody = (0, _createResponse.createResponseBody)(languageConfig.language, agentResponse);
      return response.ok({
        body: responseBody
      });
    } catch (error) {
      if ((0, _errors.isResponseError)(error)) {
        if (error.statusCode === 400 &&
        // on opensearch >= 2.17, error.body is an object https://github.com/opensearch-project/ml-commons/pull/2858
        JSON.stringify(error.body).includes(_common.ERROR_DETAILS.GUARDRAILS_TRIGGERED)) return response.badRequest({
          body: _common.ERROR_DETAILS.GUARDRAILS_TRIGGERED
        });
        return response.custom({
          statusCode: error.statusCode,
          // for consistency, frontend will always receive the actual error in error.body.message as a JSON string
          body: typeof error.body === 'string' ? error.body : JSON.stringify(error.body)
        });
      }
      return response.custom({
        statusCode: error.statusCode || 500,
        body: error.message
      });
    }
  });
}