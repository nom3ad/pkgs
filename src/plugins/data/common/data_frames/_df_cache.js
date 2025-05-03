"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDataFrameCache = createDataFrameCache;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

function createDataFrameCache() {
  let df;
  const cache = {
    get: () => {
      return df;
    },
    set: prom => {
      df = prom;
      return prom;
    },
    clear: () => {
      df = undefined;
    }
  };
  return cache;
}