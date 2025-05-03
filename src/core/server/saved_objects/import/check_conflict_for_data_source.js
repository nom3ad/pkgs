"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkConflictsForDataSource = checkConflictsForDataSource;
var _utils = require("./utils");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * function to only check the data souerce conflict when multiple data sources are enabled.
 * the purpose of this function is to check the conflict of the imported saved objects and data source
 * @param objects, this the array of saved objects to be verified whether contains the data source conflict
 * @param ignoreRegularConflicts whether to override
 * @param retries import operations list
 * @param dataSourceId the id to identify the data source
 * @returns {filteredObjects, errors, importIdMap }
 */
async function checkConflictsForDataSource({
  objects,
  ignoreRegularConflicts,
  retries = [],
  dataSourceId,
  savedObjectsClient
}) {
  const filteredObjects = [];
  const errors = [];
  const importIdMap = new Map();
  // exit early if there are no objects to check
  if (objects.length === 0) {
    return {
      filteredObjects,
      errors,
      importIdMap
    };
  }
  const retryMap = retries.reduce((acc, cur) => acc.set(`${cur.type}:${cur.id}`, cur), new Map());
  const dataSourceTitle = !!dataSourceId && !!savedObjectsClient ? await (0, _utils.getDataSourceTitleFromId)(dataSourceId, savedObjectsClient) : undefined;
  objects.forEach(object => {
    const {
      type,
      id,
      attributes: {
        title
      }
    } = object;
    const {
      destinationId
    } = retryMap.get(`${type}:${id}`) || {};
    if (object.type !== 'data-source') {
      const parts = id.split('_'); // this is the array to host the split results of the id
      const previoudDataSourceId = parts.length > 1 ? parts[0] : undefined;
      const rawId = previoudDataSourceId ? parts[1] : parts[0];

      /**
       * for import saved object from osd exported
       * when the imported saved objects with the different dataSourceId comparing to the current dataSourceId
       */

      if (previoudDataSourceId && previoudDataSourceId !== dataSourceId && !ignoreRegularConflicts) {
        const error = {
          type: 'conflict',
          ...(destinationId && {
            destinationId
          })
        };
        errors.push({
          type,
          id,
          title,
          meta: {
            title
          },
          error
        });
      } else if (previoudDataSourceId && previoudDataSourceId === dataSourceId) {
        filteredObjects.push(object);
      } else {
        /**
         * Only update importIdMap and filtered objects
         */

        // Some visualization types will need special modifications, like Vega visualizations
        if (object.type === 'visualization') {
          const vegaSpec = (0, _utils.extractVegaSpecFromSavedObject)(object);
          if (!!vegaSpec && !!dataSourceTitle) {
            var _object$attributes;
            const updatedVegaSpec = (0, _utils.updateDataSourceNameInVegaSpec)({
              spec: vegaSpec,
              newDataSourceName: dataSourceTitle
            });

            // @ts-expect-error
            const visStateObject = JSON.parse((_object$attributes = object.attributes) === null || _object$attributes === void 0 ? void 0 : _object$attributes.visState);
            visStateObject.params.spec = updatedVegaSpec;

            // @ts-expect-error
            object.attributes.visState = JSON.stringify(visStateObject);
            if (!!dataSourceId) {
              object.references.push({
                id: dataSourceId,
                name: 'dataSource',
                type: 'data-source'
              });
            }
          }

          // For timeline visualizations, update the data source name in the timeline expression
          const timelineExpression = (0, _utils.extractTimelineExpression)(object);
          if (!!timelineExpression && !!dataSourceTitle) {
            var _object$attributes2;
            // Get the timeline expression with the updated data source name
            const modifiedExpression = (0, _utils.updateDataSourceNameInTimeline)(timelineExpression, dataSourceTitle);

            // @ts-expect-error
            const timelineStateObject = JSON.parse((_object$attributes2 = object.attributes) === null || _object$attributes2 === void 0 ? void 0 : _object$attributes2.visState);
            timelineStateObject.params.expression = modifiedExpression;
            // @ts-expect-error
            object.attributes.visState = JSON.stringify(timelineStateObject);
          }
          if (!!dataSourceId) {
            const visualizationObject = object;
            const {
              visState,
              references
            } = (0, _utils.getUpdatedTSVBVisState)(visualizationObject, dataSourceId);
            visualizationObject.attributes.visState = visState;
            object.references = references;
          }
        }
        const omitOriginId = ignoreRegularConflicts;
        importIdMap.set(`${type}:${id}`, {
          id: `${dataSourceId}_${rawId}`,
          omitOriginId
        });
        filteredObjects.push({
          ...object,
          id: `${dataSourceId}_${rawId}`
        });
      }
    }
  });
  return {
    filteredObjects,
    errors,
    importIdMap
  };
}