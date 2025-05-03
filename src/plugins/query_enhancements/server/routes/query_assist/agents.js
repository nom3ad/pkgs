"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestAgentByConfig = exports.getAgentIdByConfig = void 0;
var _common = require("../../../common");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const AGENT_REQUEST_OPTIONS = {
  /**
   * It is time-consuming for LLM to generate final answer
   * Give it a large timeout window
   */
  requestTimeout: 5 * 60 * 1000,
  /**
   * Do not retry
   */
  maxRetries: 0
};
const getAgentIdByConfig = async (client, configName) => {
  try {
    var _response$body$ml_con, _response$body$config, _response$body$ml_con2;
    const response = await client.transport.request({
      method: 'GET',
      path: `${_common.URI.ML}/config/${configName}`
    });
    if (!response || !((_response$body$ml_con = response.body.ml_configuration) !== null && _response$body$ml_con !== void 0 && _response$body$ml_con.agent_id || (_response$body$config = response.body.configuration) !== null && _response$body$config !== void 0 && _response$body$config.agent_id)) {
      throw new Error('cannot find any agent by configuration: ' + configName);
    }
    return ((_response$body$ml_con2 = response.body.ml_configuration) === null || _response$body$ml_con2 === void 0 ? void 0 : _response$body$ml_con2.agent_id) || response.body.configuration.agent_id;
  } catch (error) {
    var _error$meta;
    const errorMessage = JSON.stringify((_error$meta = error.meta) === null || _error$meta === void 0 ? void 0 : _error$meta.body) || error;
    throw new Error(`Get agent '${configName}' failed, reason: ` + errorMessage);
  }
};
exports.getAgentIdByConfig = getAgentIdByConfig;
const requestAgentByConfig = async options => {
  const {
    context,
    configName,
    body,
    dataSourceId
  } = options;
  const client = context.query_assist.dataSourceEnabled && dataSourceId ? await context.dataSource.opensearch.getClient(dataSourceId) : context.core.opensearch.client.asCurrentUser;
  const agentId = await getAgentIdByConfig(client, configName);
  return client.transport.request({
    method: 'POST',
    path: `${_common.URI.ML}/agents/${agentId}/_execute`,
    body
  }, AGENT_REQUEST_OPTIONS);
};
exports.requestAgentByConfig = requestAgentByConfig;