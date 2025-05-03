"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setNestedField = exports.overwriteSavedObjectsWithWorkspaceId = exports.getSavedObjectsWithDataSource = exports.getNestedField = exports.getFinalSavedObjects = exports.appendDataSourceId = void 0;
var _server = require("../../../../../../core/server");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const appendDataSourceId = id => {
  return (dataSourceId, workspaceId) => {
    const idWithDataSource = dataSourceId ? `${dataSourceId}_` + id : id;
    if (!workspaceId) {
      return idWithDataSource;
    }
    return `${workspaceId}_${idWithDataSource}`;
  };
};
exports.appendDataSourceId = appendDataSourceId;
const overrideSavedObjectId = (savedObject, idGenerator) => {
  savedObject.id = idGenerator(savedObject.id);
  // update reference
  if (savedObject.type === 'dashboard' || savedObject.type === 'visualization-visbuilder') {
    savedObject.references.map(reference => {
      if (reference.id) {
        reference.id = idGenerator(reference.id);
      }
    });
  }

  // update reference
  if (savedObject.type === 'visualization' || savedObject.type === 'search') {
    var _savedObject$attribut, _savedObject$attribut2;
    const searchSourceString = (_savedObject$attribut = savedObject.attributes) === null || _savedObject$attribut === void 0 || (_savedObject$attribut = _savedObject$attribut.kibanaSavedObjectMeta) === null || _savedObject$attribut === void 0 ? void 0 : _savedObject$attribut.searchSourceJSON;
    const visStateString = (_savedObject$attribut2 = savedObject.attributes) === null || _savedObject$attribut2 === void 0 ? void 0 : _savedObject$attribut2.visState;
    if (searchSourceString) {
      const searchSource = JSON.parse(searchSourceString);
      if (searchSource.index) {
        searchSource.index = idGenerator(searchSource.index);
        if (Array.isArray(searchSource.filter)) {
          searchSource.filter.forEach(item => {
            var _item$meta;
            if ((_item$meta = item.meta) !== null && _item$meta !== void 0 && _item$meta.index) {
              item.meta.index = idGenerator(item.meta.index);
            }
          });
        }
        savedObject.attributes.kibanaSavedObjectMeta.searchSourceJSON = JSON.stringify(searchSource);
      }
    }
    if (visStateString) {
      var _visState$params;
      const visState = JSON.parse(visStateString);
      const controlList = (_visState$params = visState.params) === null || _visState$params === void 0 ? void 0 : _visState$params.controls;
      if (controlList) {
        controlList.map(control => {
          if (control.indexPattern) {
            control.indexPattern = idGenerator(control.indexPattern);
          }
        });
      }
      savedObject.attributes.visState = JSON.stringify(visState);
    }
  }
};
const getSavedObjectsWithDataSource = (saveObjectList, dataSourceId, dataSourceTitle) => {
  if (dataSourceId) {
    const idGenerator = id => `${dataSourceId}_${id}`;
    return saveObjectList.map(saveObject => {
      overrideSavedObjectId(saveObject, idGenerator);

      // update reference
      if (saveObject.type === 'index-pattern') {
        saveObject.references = [{
          id: `${dataSourceId}`,
          type: 'data-source',
          name: 'dataSource'
        }];
      }
      if (dataSourceTitle) {
        if (saveObject.type === 'dashboard' || saveObject.type === 'visualization' || saveObject.type === 'search' || saveObject.type === 'visualization-visbuilder') {
          saveObject.attributes.title = saveObject.attributes.title + `_${dataSourceTitle}`;
        }
        if (saveObject.type === 'visualization') {
          const vegaSpec = (0, _server.extractVegaSpecFromSavedObject)(saveObject);
          const visualizationSavedObject = saveObject;
          const visStateObject = JSON.parse(visualizationSavedObject.attributes.visState);
          if (!!vegaSpec) {
            const updatedVegaSpec = (0, _server.updateDataSourceNameInVegaSpec)({
              spec: vegaSpec,
              newDataSourceName: dataSourceTitle,
              // Spacing of 1 prevents the Sankey visualization in logs data from exceeding the default url length and breaking
              spacing: 1
            });
            visStateObject.params.spec = updatedVegaSpec;

            // @ts-expect-error
            saveObject.attributes.visState = JSON.stringify(visStateObject);
            saveObject.references.push({
              id: `${dataSourceId}`,
              type: 'data-source',
              name: 'dataSource'
            });
          }
          const timelineExpression = (0, _server.extractTimelineExpression)(saveObject);
          if (!!timelineExpression) {
            var _saveObject$attribute;
            // Get the timeline expression with the updated data source name
            const modifiedExpression = (0, _server.updateDataSourceNameInTimeline)(timelineExpression, dataSourceTitle);

            // @ts-expect-error
            const timelineStateObject = JSON.parse((_saveObject$attribute = saveObject.attributes) === null || _saveObject$attribute === void 0 ? void 0 : _saveObject$attribute.visState);
            timelineStateObject.params.expression = modifiedExpression;
            // @ts-expect-error
            saveObject.attributes.visState = JSON.stringify(timelineStateObject);
          }
          if (visStateObject.type === 'metrics') {
            visStateObject.params.data_source_id = dataSourceId;
            visualizationSavedObject.attributes.visState = JSON.stringify(visStateObject);
            visualizationSavedObject.references.push({
              id: `${dataSourceId}`,
              type: 'data-source',
              name: 'dataSource'
            });
          }
        }
      }
      return saveObject;
    });
  }
  return saveObjectList;
};
exports.getSavedObjectsWithDataSource = getSavedObjectsWithDataSource;
const overwriteSavedObjectsWithWorkspaceId = (savedObjectList, workspaceId) => {
  const idGenerator = id => `${workspaceId}_${id}`;
  savedObjectList.forEach(savedObject => {
    overrideSavedObjectId(savedObject, idGenerator);
  });
  return savedObjectList;
};
exports.overwriteSavedObjectsWithWorkspaceId = overwriteSavedObjectsWithWorkspaceId;
const getFinalSavedObjects = ({
  dataset,
  workspaceId,
  dataSourceId,
  dataSourceTitle
}) => {
  if (workspaceId && dataSourceId) {
    return overwriteSavedObjectsWithWorkspaceId(dataset.getDataSourceIntegratedSavedObjects(dataSourceId, dataSourceTitle), workspaceId);
  }
  if (workspaceId) {
    return dataset.getWorkspaceIntegratedSavedObjects(workspaceId);
  }
  if (dataSourceId) {
    return dataset.getDataSourceIntegratedSavedObjects(dataSourceId, dataSourceTitle);
  }
  return dataset.savedObjects;
};

// Helper function to get a nested field by path
exports.getFinalSavedObjects = getFinalSavedObjects;
const getNestedField = (doc, path) => {
  // First check if the exact path exists as a field
  if (path in doc) {
    return doc[path];
  }
  // If not, treat it as a nested path
  return path.split('.').reduce((obj, key) => obj && obj[key] !== 'undefined' ? obj[key] : undefined, doc);
};

// Helper function to set a nested field by path
exports.getNestedField = getNestedField;
const setNestedField = (doc, path, value) => {
  // First check if the exact path exists as a field
  if (path in doc) {
    doc[path] = value;
    return;
  }
  // If not, treat it as a nested path
  const keys = path.split('.');
  keys.reduce((obj, key, indexName) => {
    if (indexName === keys.length - 1) {
      obj[key] = value;
    } else {
      if (!obj[key]) obj[key] = {}; // Create the object if it doesn't exist
      return obj[key];
    }
  }, doc);
};
exports.setNestedField = setNestedField;