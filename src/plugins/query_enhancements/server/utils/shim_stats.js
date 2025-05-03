"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shimStats = shimStats;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Add vis mapping for runtime fields
 * json data structure added to response will be
 * [{
 *  agent: "mozilla",
 *  avg(bytes): 5756
 *  ...
 * }, {
 *  agent: "MSIE",
 *  avg(bytes): 5605
 *  ...
 * }, {
 *  agent: "chrome",
 *  avg(bytes): 5648
 *  ...
 * }]
 *
 * @internal
 */
function shimStats(response) {
  var _response$metadata;
  if (!(response !== null && response !== void 0 && (_response$metadata = response.metadata) !== null && _response$metadata !== void 0 && _response$metadata.fields) || !(response !== null && response !== void 0 && response.data)) {
    return {
      ...response
    };
  }
  const {
    data: statsDataSet,
    metadata: {
      fields: queriedFields
    },
    size
  } = response;
  const data = new Array(size).fill(null).map((_, i) => {
    const entry = {};
    queriedFields.forEach(({
      name
    }) => {
      if (statsDataSet[name] && i < statsDataSet[name].length) {
        entry[name] = statsDataSet[name][i];
      }
    });
    return entry;
  });
  return {
    ...response,
    jsonData: data
  };
}