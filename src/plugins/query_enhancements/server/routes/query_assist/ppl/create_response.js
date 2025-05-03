"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPPLResponseBody = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const createPPLResponseBody = agentResponse => {
  if (!agentResponse.body.inference_results[0].output[0].result) throw new Error('Generated query not found.');
  const result = JSON.parse(agentResponse.body.inference_results[0].output[0].result);
  const ppl = result.ppl.replace(/[\r\n]/g, ' ').trim().replace(/ISNOTNULL/g, 'isnotnull') // https://github.com/opensearch-project/sql/issues/2431
  .replace(/\bSPAN\(/g, 'span('); // https://github.com/opensearch-project/dashboards-observability/issues/759
  return {
    query: ppl
  };
};
exports.createPPLResponseBody = createPPLResponseBody;