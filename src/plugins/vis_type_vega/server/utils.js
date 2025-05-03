"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findDataSourceIdbyName = exports.extractVegaSpecFromAttributes = exports.extractDataSourceNamesInVegaSpec = void 0;
var _hjson = require("hjson");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const findDataSourceIdbyName = async props => {
  var _possibleDataSourceOb;
  const {
    dataSourceName
  } = props;
  const dataSources = await dataSourceFindQuery(props);

  // In the case that data_source_name is a prefix of another name, match exact data_source_name
  const possibleDataSourceObjects = dataSources.saved_objects.filter(obj => obj.attributes.title === dataSourceName);
  if (possibleDataSourceObjects.length !== 1) {
    throw new Error(`Expected exactly 1 result for data_source_name "${dataSourceName}" but got ${possibleDataSourceObjects.length} results`);
  }
  return (_possibleDataSourceOb = possibleDataSourceObjects.pop()) === null || _possibleDataSourceOb === void 0 ? void 0 : _possibleDataSourceOb.id;
};
exports.findDataSourceIdbyName = findDataSourceIdbyName;
const extractVegaSpecFromAttributes = attributes => {
  if (isVegaVisualization(attributes)) {
    // @ts-expect-error
    const visStateObject = JSON.parse(attributes === null || attributes === void 0 ? void 0 : attributes.visState);
    return visStateObject.params.spec;
  }
  return undefined;
};
exports.extractVegaSpecFromAttributes = extractVegaSpecFromAttributes;
const extractDataSourceNamesInVegaSpec = spec => {
  const parsedSpec = (0, _hjson.parse)(spec, {
    keepWsc: true
  });
  const dataField = parsedSpec.data;
  const dataSourceNameSet = new Set();
  if (dataField instanceof Array) {
    dataField.forEach(dataObject => {
      const dataSourceName = getDataSourceNameFromObject(dataObject);
      if (!!dataSourceName) {
        dataSourceNameSet.add(dataSourceName);
      }
    });
  } else if (dataField instanceof Object) {
    const dataSourceName = getDataSourceNameFromObject(dataField);
    if (!!dataSourceName) {
      dataSourceNameSet.add(dataSourceName);
    }
  } else {
    throw new Error(`"data" field should be an object or an array of objects`);
  }
  return dataSourceNameSet;
};
exports.extractDataSourceNamesInVegaSpec = extractDataSourceNamesInVegaSpec;
const getDataSourceNameFromObject = dataObject => {
  if (dataObject.hasOwnProperty('url') && dataObject.url.hasOwnProperty('index') && dataObject.url.hasOwnProperty('data_source_name')) {
    return dataObject.url.data_source_name;
  }
  return undefined;
};
const isVegaVisualization = attributes => {
  // @ts-expect-error
  const visState = attributes === null || attributes === void 0 ? void 0 : attributes.visState;
  if (!!visState) {
    const visStateObject = JSON.parse(visState);
    return !!visStateObject.type && visStateObject.type === 'vega';
  }
  return false;
};
const dataSourceFindQuery = async props => {
  const {
    savedObjectsClient,
    dataSourceName
  } = props;
  return await savedObjectsClient.find({
    type: 'data-source',
    perPage: 10,
    search: `"${dataSourceName}"`,
    searchFields: ['title'],
    fields: ['id', 'title']
  });
};