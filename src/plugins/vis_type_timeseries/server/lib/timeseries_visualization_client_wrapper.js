"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.timeSeriesVisualizationClientWrapper = exports.TIMESERIES_VISUALIZATION_CLIENT_WRAPPER_PRIORITY = exports.TIMESERIES_VISUALIZATION_CLIENT_WRAPPER_ID = void 0;
var _server = require("../../../../core/server");
var _services = require("./services");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const TIMESERIES_VISUALIZATION_CLIENT_WRAPPER_ID = exports.TIMESERIES_VISUALIZATION_CLIENT_WRAPPER_ID = 'timeseries-visualization-client-wrapper';
/**
 * A lower priority number means that a wrapper will be first to execute.
 * In this case, since this wrapper does not have any conflicts with other wrappers, it is set to 11.
 * */
const TIMESERIES_VISUALIZATION_CLIENT_WRAPPER_PRIORITY = exports.TIMESERIES_VISUALIZATION_CLIENT_WRAPPER_PRIORITY = 11;
const timeSeriesVisualizationClientWrapper = wrapperOptions => {
  const createForTimeSeries = async (type, attributes, options) => {
    var _options$references;
    if (type !== 'visualization' || !(0, _services.getDataSourceEnabled)().enabled) {
      return await wrapperOptions.client.create(type, attributes, options);
    }
    const tsvbAttributes = attributes;
    const visState = JSON.parse(tsvbAttributes.visState);
    if (visState.type !== 'metrics' || !visState.params) {
      return await wrapperOptions.client.create(type, attributes, options);
    }
    const newReferences = options === null || options === void 0 || (_options$references = options.references) === null || _options$references === void 0 ? void 0 : _options$references.filter(reference => reference.type !== 'data-source');
    if (visState.params.data_source_id) {
      try {
        if (await checkIfDataSourceExists(visState.params.data_source_id, wrapperOptions.client)) {
          newReferences === null || newReferences === void 0 || newReferences.push({
            id: visState.params.data_source_id,
            name: 'dataSource',
            type: 'data-source'
          });
        } else {
          delete visState.params.data_source_id;
        }
      } catch (err) {
        const errMsg = `Failed to fetch existing data source for dataSourceId [${visState.params.data_source_id}]`;
        throw _server.SavedObjectsErrorHelpers.decorateBadRequestError(err, errMsg);
      }
    }
    tsvbAttributes.visState = JSON.stringify(visState);
    return await wrapperOptions.client.create(type, attributes, {
      ...options,
      references: newReferences
    });
  };
  return {
    ...wrapperOptions.client,
    create: createForTimeSeries,
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
exports.timeSeriesVisualizationClientWrapper = timeSeriesVisualizationClientWrapper;
const checkIfDataSourceExists = async (id, client) => {
  return client.get('data-source', id).then(response => !!response.attributes);
};