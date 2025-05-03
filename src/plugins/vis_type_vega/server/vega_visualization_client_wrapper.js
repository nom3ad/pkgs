"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vegaVisualizationClientWrapper = exports.VEGA_VISUALIZATION_CLIENT_WRAPPER_ID = void 0;
var _server = require("../../../core/server");
var _utils = require("./utils");
var _services = require("./services");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const VEGA_VISUALIZATION_CLIENT_WRAPPER_ID = exports.VEGA_VISUALIZATION_CLIENT_WRAPPER_ID = 'vega-visualization-client-wrapper';
const vegaVisualizationClientWrapper = wrapperOptions => {
  const createForVega = async (type, attributes, options) => {
    var _options$references, _options$references2;
    const vegaSpec = (0, _utils.extractVegaSpecFromAttributes)(attributes);
    if (type !== 'visualization' || vegaSpec === undefined || !(0, _services.getDataSourceEnabled)().enabled) {
      return await wrapperOptions.client.create(type, attributes, options);
    }
    const dataSourceNamesSet = (0, _utils.extractDataSourceNamesInVegaSpec)(vegaSpec);
    const existingDataSourceReferences = options === null || options === void 0 || (_options$references = options.references) === null || _options$references === void 0 ? void 0 : _options$references.filter(reference => reference.type === 'data-source').map(dataSourceReference => {
      return {
        id: dataSourceReference.id,
        type: dataSourceReference.type
      };
    });
    const existingDataSourceIdToNameMap = new Map();
    if (!!existingDataSourceReferences && existingDataSourceReferences.length > 0) {
      (await wrapperOptions.client.bulkGet(existingDataSourceReferences)).saved_objects.forEach(object => {
        // @ts-expect-error
        if (!!object.attributes && !!object.attributes.title) {
          // @ts-expect-error
          existingDataSourceIdToNameMap.set(object.id, object.attributes.title);
        }
      });
    }

    // Filters out outdated datasource references
    const newReferences = options === null || options === void 0 || (_options$references2 = options.references) === null || _options$references2 === void 0 ? void 0 : _options$references2.filter(reference => {
      if (reference.type !== 'data-source') {
        return true;
      }
      const dataSourceName = existingDataSourceIdToNameMap.get(reference.id);
      if (dataSourceNamesSet.has(dataSourceName)) {
        dataSourceNamesSet.delete(dataSourceName);
        return true;
      }
      return false;
    });
    for await (const dataSourceName of dataSourceNamesSet) {
      const dataSourceId = await (0, _utils.findDataSourceIdbyName)({
        dataSourceName,
        savedObjectsClient: wrapperOptions.client
      });
      if (dataSourceId) {
        newReferences === null || newReferences === void 0 || newReferences.push({
          id: dataSourceId,
          name: 'dataSource',
          type: 'data-source'
        });
      } else {
        throw _server.SavedObjectsErrorHelpers.createBadRequestError(`data_source_name "${dataSourceName}" cannot be found in saved objects`);
      }
    }
    return await wrapperOptions.client.create(type, attributes, {
      ...options,
      references: newReferences
    });
  };
  return {
    ...wrapperOptions.client,
    create: createForVega,
    bulkCreate: wrapperOptions.client.bulkCreate,
    checkConflicts: wrapperOptions.client.checkConflicts,
    delete: wrapperOptions.client.delete,
    find: wrapperOptions.client.find,
    bulkGet: wrapperOptions.client.bulkGet,
    get: wrapperOptions.client.get,
    update: wrapperOptions.client.update,
    bulkUpdate: wrapperOptions.client.bulkUpdate,
    errors: wrapperOptions.client.errors,
    addToNamespaces: wrapperOptions.client.addToNamespaces,
    deleteFromNamespaces: wrapperOptions.client.deleteFromNamespaces
  };
};
exports.vegaVisualizationClientWrapper = vegaVisualizationClientWrapper;