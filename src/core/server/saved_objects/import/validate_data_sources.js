"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateDataSources = validateDataSources;
var _inject_nested_depdendencies = require("../export/inject_nested_depdendencies");
var _utils = require("./utils");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// Check whether the target workspace includes the data source referenced by the savedObjects.
async function validateDataSources(savedObjects, savedObjectsClient, errorAccumulator, workspaces) {
  // Filter out any objects that resulted in errors
  const errorSet = errorAccumulator.reduce((acc, {
    type,
    id
  }) => acc.add(`${type}:${id}`), new Set());
  const filteredObjects = savedObjects.filter(({
    type,
    id
  }) => !errorSet.has(`${type}:${id}`));
  if ((filteredObjects === null || filteredObjects === void 0 ? void 0 : filteredObjects.length) === 0) {
    return [];
  }
  const errorMap = {};
  // Get the data sources assigned target workspace
  const assignedDataSourcesInTargetWorkspace = await savedObjectsClient.find({
    type: 'data-source',
    fields: ['id'],
    perPage: 999,
    workspaces
  }).then(response => {
    var _response$saved_objec;
    return new Set(response === null || response === void 0 || (_response$saved_objec = response.saved_objects) === null || _response$saved_objec === void 0 ? void 0 : _response$saved_objec.map(ds => ds.id));
  });
  const nestedDependencies = await (0, _inject_nested_depdendencies.fetchNestedDependencies)(filteredObjects, savedObjectsClient);
  const sourceDataSourceMap = new Map(nestedDependencies.objects.filter(object => object.type === 'data-source').map(({
    id,
    attributes
  }) => [id, (attributes === null || attributes === void 0 ? void 0 : attributes.title) || id]));
  const nestedObjectsMap = new Map(nestedDependencies.objects.map(object => [object.id, object]));
  for (const object of filteredObjects) {
    const {
      id,
      type,
      attributes
    } = object;
    const referenceDS = (0, _utils.findReferenceDataSourceForObject)(object, nestedObjectsMap);
    const missingDataSources = Array.from(referenceDS).filter(item => !assignedDataSourcesInTargetWorkspace.has(item));
    if (missingDataSources.length > 0) {
      errorMap[`${type}:${id}`] = {
        id,
        type,
        title: attributes === null || attributes === void 0 ? void 0 : attributes.title,
        meta: {
          title: attributes === null || attributes === void 0 ? void 0 : attributes.title
        },
        error: {
          type: 'missing_data_source',
          dataSource: missingDataSources.map(mdId => sourceDataSourceMap.get(mdId) || mdId).join(', ')
        }
      };
    }
  }
  return Object.values(errorMap);
}