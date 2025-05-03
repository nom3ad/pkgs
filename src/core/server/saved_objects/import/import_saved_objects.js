"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importSavedObjectsFromStream = importSavedObjectsFromStream;
var _collect_saved_objects = require("./collect_saved_objects");
var _validate_references = require("./validate_references");
var _check_origin_conflicts = require("./check_origin_conflicts");
var _create_saved_objects = require("./create_saved_objects");
var _check_conflicts = require("./check_conflicts");
var _regenerate_ids = require("./regenerate_ids");
var _check_conflict_for_data_source = require("./check_conflict_for_data_source");
var _validate_object_id = require("./validate_object_id");
var _validate_data_sources = require("./validate_data_sources");
/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Import saved objects from given stream. See the {@link SavedObjectsImportOptions | options} for more
 * detailed information.
 *
 * @public
 */
async function importSavedObjectsFromStream({
  readStream,
  objectLimit,
  overwrite,
  createNewCopies,
  savedObjectsClient,
  typeRegistry,
  namespace,
  dataSourceId,
  dataSourceTitle,
  workspaces,
  dataSourceEnabled,
  isCopy
}) {
  let errorAccumulator = [];
  const supportedTypes = typeRegistry.getImportableAndExportableTypes().map(type => type.name);

  // Get the objects to import
  const collectSavedObjectsResult = await (0, _collect_saved_objects.collectSavedObjects)({
    readStream,
    objectLimit,
    supportedTypes,
    dataSourceId
  });
  // if dataSource is not enabled, but object type is data-source, or saved object id contains datasource id
  // return unsupported type error
  if (!dataSourceEnabled) {
    const notSupportedErrors = collectSavedObjectsResult.collectedObjects.reduce((errors, obj) => {
      if (obj.type === 'data-source' || (0, _validate_object_id.isSavedObjectWithDataSource)(obj.id)) {
        const error = {
          type: 'unsupported_type'
        };
        const {
          title
        } = obj.attributes;
        errors.push({
          error,
          type: obj.type,
          id: obj.id,
          title,
          meta: {
            title
          }
        });
      }
      return errors; // Return the accumulator in each iteration
    }, []);
    if ((notSupportedErrors === null || notSupportedErrors === void 0 ? void 0 : notSupportedErrors.length) > 0) {
      return {
        successCount: 0,
        success: false,
        errors: notSupportedErrors
      };
    }
  }
  errorAccumulator = [...errorAccumulator, ...collectSavedObjectsResult.errors];
  /** Map of all IDs for objects that we are attempting to import; each value is empty by default */
  let importIdMap = collectSavedObjectsResult.importIdMap;
  let pendingOverwrites = new Set();

  // Validate references
  const validateReferencesResult = await (0, _validate_references.validateReferences)(collectSavedObjectsResult.collectedObjects, savedObjectsClient, namespace);
  errorAccumulator = [...errorAccumulator, ...validateReferencesResult];
  if (isCopy) {
    // Data sources can only be assigned to workspaces and can not be copied between workspaces.
    collectSavedObjectsResult.collectedObjects = collectSavedObjectsResult.collectedObjects.filter(obj => obj.type !== 'data-source');
    const validateDataSourcesResult = await (0, _validate_data_sources.validateDataSources)(collectSavedObjectsResult.collectedObjects, savedObjectsClient, errorAccumulator, workspaces);
    errorAccumulator = [...errorAccumulator, ...validateDataSourcesResult];
  }
  if (createNewCopies) {
    // randomly generated id
    importIdMap = (0, _regenerate_ids.regenerateIds)(collectSavedObjectsResult.collectedObjects, dataSourceId);
  } else {
    // in check conclict and override mode
    // Check single-namespace objects for conflicts in this namespace, and check multi-namespace objects for conflicts across all namespaces
    const checkConflictsParams = {
      objects: collectSavedObjectsResult.collectedObjects,
      savedObjectsClient,
      namespace,
      ignoreRegularConflicts: overwrite,
      workspaces
    };
    const checkConflictsResult = await (0, _check_conflicts.checkConflicts)(checkConflictsParams);
    errorAccumulator = [...errorAccumulator, ...checkConflictsResult.errors];
    importIdMap = new Map([...importIdMap, ...checkConflictsResult.importIdMap]);
    pendingOverwrites = new Set([...pendingOverwrites, ...checkConflictsResult.pendingOverwrites]);

    // Check multi-namespace object types for origin conflicts in this namespace
    const checkOriginConflictsParams = {
      objects: checkConflictsResult.filteredObjects,
      savedObjectsClient,
      typeRegistry,
      namespace,
      ignoreRegularConflicts: overwrite,
      importIdMap
    };

    /**
     * If dataSourceId exist,
     */
    if (dataSourceId) {
      const checkConflictsForDataSourceResult = await (0, _check_conflict_for_data_source.checkConflictsForDataSource)({
        objects: checkConflictsResult.filteredObjects,
        ignoreRegularConflicts: overwrite,
        dataSourceId,
        savedObjectsClient
      });
      checkOriginConflictsParams.objects = checkConflictsForDataSourceResult.filteredObjects;
    }
    const checkOriginConflictsResult = await (0, _check_origin_conflicts.checkOriginConflicts)(checkOriginConflictsParams);
    errorAccumulator = [...errorAccumulator, ...checkOriginConflictsResult.errors];
    importIdMap = new Map([...importIdMap, ...checkOriginConflictsResult.importIdMap]);
    pendingOverwrites = new Set([...pendingOverwrites, ...checkOriginConflictsResult.pendingOverwrites]);
  }

  // Create objects in bulk
  const createSavedObjectsParams = {
    objects: dataSourceId ? collectSavedObjectsResult.collectedObjects.filter(object => object.type !== 'data-source') : collectSavedObjectsResult.collectedObjects,
    accumulatedErrors: errorAccumulator,
    savedObjectsClient,
    importIdMap,
    overwrite,
    namespace,
    dataSourceId,
    dataSourceTitle,
    ...(workspaces ? {
      workspaces
    } : {})
  };
  const createSavedObjectsResult = await (0, _create_saved_objects.createSavedObjects)(createSavedObjectsParams);
  errorAccumulator = [...errorAccumulator, ...createSavedObjectsResult.errors];
  const successResults = createSavedObjectsResult.createdObjects.map(({
    type,
    id,
    attributes: {
      title
    },
    destinationId,
    originId
  }) => {
    var _typeRegistry$getType;
    const meta = {
      title,
      icon: (_typeRegistry$getType = typeRegistry.getType(type)) === null || _typeRegistry$getType === void 0 || (_typeRegistry$getType = _typeRegistry$getType.management) === null || _typeRegistry$getType === void 0 ? void 0 : _typeRegistry$getType.icon
    };
    const attemptedOverwrite = pendingOverwrites.has(`${type}:${id}`);
    return {
      type,
      id,
      meta,
      ...(attemptedOverwrite && {
        overwrite: true
      }),
      ...(destinationId && {
        destinationId
      }),
      ...(destinationId && !originId && !createNewCopies && {
        createNewCopy: true
      })
    };
  });
  const errorResults = errorAccumulator.map(error => {
    var _typeRegistry$getType2;
    const icon = (_typeRegistry$getType2 = typeRegistry.getType(error.type)) === null || _typeRegistry$getType2 === void 0 || (_typeRegistry$getType2 = _typeRegistry$getType2.management) === null || _typeRegistry$getType2 === void 0 ? void 0 : _typeRegistry$getType2.icon;
    const attemptedOverwrite = pendingOverwrites.has(`${error.type}:${error.id}`);
    return {
      ...error,
      meta: {
        ...error.meta,
        icon
      },
      ...(attemptedOverwrite && {
        overwrite: true
      })
    };
  });
  return {
    successCount: createSavedObjectsResult.createdObjects.length,
    success: errorAccumulator.length === 0,
    ...(successResults.length && {
      successResults
    }),
    ...(errorResults.length && {
      errors: errorResults
    })
  };
}