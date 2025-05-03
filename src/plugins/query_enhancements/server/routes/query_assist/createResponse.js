"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createResponseBody = void 0;
var _create_response = require("./ppl/create_response");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const createResponseBody = (language, agentResponse) => {
  switch (language) {
    case 'PPL':
      return (0, _create_response.createPPLResponseBody)(agentResponse);
    default:
      if (!agentResponse.body.inference_results[0].output[0].result) throw new Error('Generated query not found.');
      const result = JSON.parse(agentResponse.body.inference_results[0].output[0].result);
      const query = Object.values(result).at(0);
      if (typeof query !== 'string') throw new Error('Generated query not found.');
      return {
        query
      };
  }
};
exports.createResponseBody = createResponseBody;