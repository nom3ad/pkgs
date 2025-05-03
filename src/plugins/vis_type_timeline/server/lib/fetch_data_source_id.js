"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchDataSourceIdByName = void 0;
var _services = require("./services");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const fetchDataSourceIdByName = async (config, client) => {
  var _possibleDataSourceId;
  if (!config.data_source_name) {
    return undefined;
  }
  if (!(0, _services.getDataSourceEnabled)().enabled) {
    throw new Error('data_source_name is not supported. Contact your administrator to start using multiple data sources');
  }
  const dataSources = await client.find({
    type: 'data-source',
    perPage: 100,
    search: `"${config.data_source_name}"`,
    searchFields: ['title'],
    fields: ['id', 'title']
  });
  const possibleDataSourceIds = dataSources.saved_objects.filter(obj => obj.attributes.title === config.data_source_name);
  if (possibleDataSourceIds.length !== 1) {
    throw new Error(`Expected exactly 1 result for data_source_name "${config.data_source_name}" but got ${possibleDataSourceIds.length} results`);
  }
  return (_possibleDataSourceId = possibleDataSourceIds.pop()) === null || _possibleDataSourceId === void 0 ? void 0 : _possibleDataSourceId.id;
};
exports.fetchDataSourceIdByName = fetchDataSourceIdByName;