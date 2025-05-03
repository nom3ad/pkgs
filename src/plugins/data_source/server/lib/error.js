"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDataSourceError = void 0;
var _elasticsearch = require("elasticsearch");
var _server = require("../../../../../src/core/server");
var _error = require("../../common/data_sources/error");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const createDataSourceError = (error, message) => {
  // handle saved object client error, while retrieve data source meta info
  if (_server.SavedObjectsErrorHelpers.isSavedObjectsClientError(error)) {
    return new _error.DataSourceError(error, error.output.payload.message, error.output.statusCode);
  }

  // cast OpenSearch client 401 response error to 400, due to https://github.com/opensearch-project/OpenSearch-Dashboards/issues/2591
  if ((0, _error.isResponseError)(error) && error.statusCode === 401) {
    return new _error.DataSourceError(error, JSON.stringify(error.meta.body), 400);
  }

  // cast legacy client 401 response error to 400
  if (error instanceof _elasticsearch.errors.AuthenticationException) {
    return new _error.DataSourceError(error, error.message, 400);
  }

  // handle all other error that may or may not comes with statuscode
  return new _error.DataSourceError(error, message);
};
exports.createDataSourceError = createDataSourceError;