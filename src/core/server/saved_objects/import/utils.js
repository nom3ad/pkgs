"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractVegaSpecFromSavedObject = exports.extractTimelineExpression = void 0;
exports.findReferenceDataSourceForObject = findReferenceDataSourceForObject;
exports.updateDataSourceNameInVegaSpec = exports.updateDataSourceNameInTimeline = exports.getUpdatedTSVBVisState = exports.getDataSourceTitleFromId = void 0;
var _hjson = require("hjson");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Given a Vega spec, the new datasource (by name), and spacing, update the Vega spec to add the new datasource name to each local cluster query
 *
 * @param {string} spec - the stringified Vega spec (HJSON or JSON)
 * @param {string} newDataSourceName - the datasource name to append
 * @param {number} [spacing=2] - how large the indenting should be after updating the spec (should be set to > 0 for a readable spec)
 */

/**
 * Given a visualization saved object and datasource id, return the updated visState and references if the visualization was a TSVB visualization
 * @param {VisualizationObject} object
 * @param {string} dataSourceId
 * @returns {{visState: string, references: SavedObjectReference[]}} - the updated stringified visState and references
 */
const getUpdatedTSVBVisState = (object, dataSourceId) => {
  const visStateObject = JSON.parse(object.attributes.visState);
  if (visStateObject.type !== 'metrics') {
    return {
      visState: object.attributes.visState,
      references: object.references
    };
  }
  const oldDataSourceId = visStateObject.params.data_source_id;
  const newReferences = object.references.filter(reference => {
    return reference.id !== oldDataSourceId && reference.type === 'data-source';
  });
  visStateObject.params.data_source_id = dataSourceId;
  newReferences.push({
    id: dataSourceId,
    name: 'dataSource',
    type: 'data-source'
  });
  return {
    visState: JSON.stringify(visStateObject),
    references: newReferences
  };
};
exports.getUpdatedTSVBVisState = getUpdatedTSVBVisState;
const updateDataSourceNameInVegaSpec = props => {
  const {
    spec,
    spacing
  } = props;
  const stringifiedSpacing = spacing || 2;
  let parsedSpec = parseJSONSpec(spec);
  const isJSONString = !!parsedSpec;
  if (!parsedSpec) {
    parsedSpec = (0, _hjson.parse)(spec, {
      keepWsc: true
    });
  }
  const dataField = parsedSpec.data;
  if (dataField instanceof Array) {
    parsedSpec.data = dataField.map(dataObject => {
      return updateDataSourceNameForDataObject(dataObject, props);
    });
  } else if (dataField instanceof Object) {
    parsedSpec.data = updateDataSourceNameForDataObject(dataField, props);
  } else {
    throw new Error(`"data" field should be an object or an array of objects`);
  }
  return isJSONString ? JSON.stringify(parsedSpec) : (0, _hjson.stringify)(parsedSpec, {
    bracesSameLine: true,
    keepWsc: true,
    space: stringifiedSpacing
  });
};
exports.updateDataSourceNameInVegaSpec = updateDataSourceNameInVegaSpec;
const updateDataSourceNameInTimeline = (timelineExpression, dataSourceTitle) => {
  const expressionRegex = /\.(opensearch|es|elasticsearch)\(([^)]*)\)/g;
  const replaceCallback = (match, funcName, args) => {
    if (!args.includes('data_source_name')) {
      let expressionArgs = args.trim();
      expressionArgs = `${expressionArgs}, data_source_name="${dataSourceTitle}"`;
      return `.${funcName}(${expressionArgs})`;
    }
    return match;
  };
  const modifiedExpression = timelineExpression.replace(expressionRegex, replaceCallback);
  return modifiedExpression;
};
exports.updateDataSourceNameInTimeline = updateDataSourceNameInTimeline;
const getDataSourceTitleFromId = async (dataSourceId, savedObjectsClient) => {
  return await savedObjectsClient.get('data-source', dataSourceId).then(response => {
    var _response$attributes$, _response$attributes;
    // @ts-expect-error
    return (_response$attributes$ = response === null || response === void 0 || (_response$attributes = response.attributes) === null || _response$attributes === void 0 ? void 0 : _response$attributes.title) !== null && _response$attributes$ !== void 0 ? _response$attributes$ : undefined;
  });
};
exports.getDataSourceTitleFromId = getDataSourceTitleFromId;
const extractVegaSpecFromSavedObject = savedObject => {
  if (confirmVisualizationType(savedObject, 'vega')) {
    var _savedObject$attribut;
    // @ts-expect-error
    const visStateObject = JSON.parse((_savedObject$attribut = savedObject.attributes) === null || _savedObject$attribut === void 0 ? void 0 : _savedObject$attribut.visState);
    return visStateObject.params.spec;
  }
  return undefined;
};
exports.extractVegaSpecFromSavedObject = extractVegaSpecFromSavedObject;
const extractTimelineExpression = savedObject => {
  var _savedObject$attribut2;
  if (!confirmVisualizationType(savedObject, 'timelion')) {
    return undefined;
  }
  // @ts-expect-error
  const visStateString = (_savedObject$attribut2 = savedObject.attributes) === null || _savedObject$attribut2 === void 0 ? void 0 : _savedObject$attribut2.visState;
  if (!visStateString) {
    return undefined;
  }
  const visStateObject = JSON.parse(visStateString);
  return visStateObject.params.expression;
};
exports.extractTimelineExpression = extractTimelineExpression;
const confirmVisualizationType = (savedObject, visualizationType) => {
  var _savedObject$attribut3;
  // @ts-expect-error
  const visState = (_savedObject$attribut3 = savedObject.attributes) === null || _savedObject$attribut3 === void 0 ? void 0 : _savedObject$attribut3.visState;
  if (!!visState) {
    const visStateObject = JSON.parse(visState);
    return !!visStateObject.type && visStateObject.type === visualizationType;
  }
  return false;
};
const updateDataSourceNameForDataObject = (dataObject, props) => {
  const {
    newDataSourceName
  } = props;
  if (dataObject.hasOwnProperty('url') && dataObject.url.hasOwnProperty('index') && !dataObject.url.hasOwnProperty('data_source_name')) {
    dataObject.url.data_source_name = newDataSourceName;
  }
  return dataObject;
};
const parseJSONSpec = spec => {
  try {
    const jsonSpec = JSON.parse(spec);
    if (jsonSpec && typeof jsonSpec === 'object') {
      return jsonSpec;
    }
  } catch (e) {
    return undefined;
  }
  return undefined;
};
function findReferenceDataSourceForObject(savedObject, savedObjects, visited = new Set()) {
  var _savedObject$referenc;
  const dataSourceReferences = new Set();
  const references = (_savedObject$referenc = savedObject.references) !== null && _savedObject$referenc !== void 0 ? _savedObject$referenc : [];
  visited.add(savedObject.id);

  // Traverse referenced objects recursively
  for (const reference of references) {
    // Add 'data-source' references directly associated with the object
    if (reference.type === 'data-source') {
      dataSourceReferences.add(reference.id);
    } else if (!visited.has(reference.id)) {
      const referenceObject = savedObjects.get(reference.id);
      if (referenceObject) {
        findReferenceDataSourceForObject(referenceObject, savedObjects, visited).forEach(ref => dataSourceReferences.add(ref));
      }
    }
  }
  return dataSourceReferences;
}