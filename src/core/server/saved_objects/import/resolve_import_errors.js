"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveSavedObjectsImportErrors = resolveSavedObjectsImportErrors;
var _collect_saved_objects = require("./collect_saved_objects");
var _create_objects_filter = require("./create_objects_filter");
var _split_overwrites = require("./split_overwrites");
var _regenerate_ids = require("./regenerate_ids");
var _validate_references = require("./validate_references");
var _validate_retries = require("./validate_retries");
var _create_saved_objects = require("./create_saved_objects");
var _check_origin_conflicts = require("./check_origin_conflicts");
var _check_conflicts = require("./check_conflicts");
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
 * Resolve and return saved object import errors.
 * See the {@link SavedObjectsResolveImportErrorsOptions | options} for more detailed informations.
 *
 * @public
 */
async function resolveSavedObjectsImportErrors({
  readStream,
  objectLimit,
  retries,
  savedObjectsClient,
  typeRegistry,
  namespace,
  createNewCopies,
  dataSourceId,
  dataSourceTitle,
  workspaces
}) {
  // throw a BadRequest error if we see invalid retries
  (0, _validate_retries.validateRetries)(retries);
  let successCount = 0;
  let errorAccumulator = [];
  let importIdMap = new Map();
  const supportedTypes = typeRegistry.getImportableAndExportableTypes().map(type => type.name);
  const filter = (0, _create_objects_filter.createObjectsFilter)(retries);

  // Get the objects to resolve errors
  const {
    errors: collectorErrors,
    collectedObjects: objectsToResolve
  } = await (0, _collect_saved_objects.collectSavedObjects)({
    readStream,
    objectLimit,
    filter,
    supportedTypes,
    dataSourceId
  });
  errorAccumulator = [...errorAccumulator, ...collectorErrors];

  // Create a map of references to replace for each object to avoid iterating through
  // retries for every object to resolve
  const retriesReferencesMap = new Map();
  for (const retry of retries) {
    const map = {};
    for (const {
      type,
      from,
      to
    } of retry.replaceReferences) {
      map[`${type}:${from}`] = to;
    }
    retriesReferencesMap.set(`${retry.type}:${retry.id}`, map);
  }

  // Replace references
  for (const savedObject of objectsToResolve) {
    const refMap = retriesReferencesMap.get(`${savedObject.type}:${savedObject.id}`);
    if (!refMap) {
      continue;
    }
    for (const reference of savedObject.references || []) {
      if (refMap[`${reference.type}:${reference.id}`]) {
        reference.id = refMap[`${reference.type}:${reference.id}`];
      }
    }
  }

  // Validate references
  const validateReferencesResult = await (0, _validate_references.validateReferences)(objectsToResolve, savedObjectsClient, namespace, retries);
  errorAccumulator = [...errorAccumulator, ...validateReferencesResult];
  if (createNewCopies) {
    // In case any missing reference errors were resolved, ensure that we regenerate those object IDs as well
    // This is because a retry to resolve a missing reference error may not necessarily specify a destinationId
    importIdMap = (0, _regenerate_ids.regenerateIds)(objectsToResolve, dataSourceId);
  }

  // Check single-namespace objects for conflicts in this namespace, and check multi-namespace objects for conflicts across all namespaces
  const checkConflictsParams = {
    objects: objectsToResolve,
    savedObjectsClient,
    namespace,
    retries,
    createNewCopies,
    dataSourceId,
    workspaces
  };
  const checkConflictsResult = await (0, _check_conflicts.checkConflicts)(checkConflictsParams);
  errorAccumulator = [...errorAccumulator, ...checkConflictsResult.errors];

  // Check multi-namespace object types for regular conflicts and ambiguous conflicts
  const getImportIdMapForRetriesParams = {
    objects: checkConflictsResult.filteredObjects,
    retries,
    createNewCopies
  };
  const importIdMapForRetries = (0, _check_origin_conflicts.getImportIdMapForRetries)(getImportIdMapForRetriesParams);
  importIdMap = new Map([...importIdMap, ...importIdMapForRetries, ...checkConflictsResult.importIdMap // this importIdMap takes precedence over the others
  ]);

  // Bulk create in two batches, overwrites and non-overwrites
  let successResults = [];
  const accumulatedErrors = [...errorAccumulator];
  const bulkCreateObjects = async (objects, overwrite) => {
    const createSavedObjectsParams = {
      objects,
      accumulatedErrors,
      savedObjectsClient,
      importIdMap,
      namespace,
      overwrite,
      dataSourceId,
      dataSourceTitle,
      workspaces
    };
    const {
      createdObjects,
      errors: bulkCreateErrors
    } = await (0, _create_saved_objects.createSavedObjects)(createSavedObjectsParams);
    errorAccumulator = [...errorAccumulator, ...bulkCreateErrors];
    successCount += createdObjects.length;
    successResults = [...successResults, ...createdObjects.map(({
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
      return {
        type,
        id,
        meta,
        ...(overwrite && {
          overwrite
        }),
        ...(destinationId && {
          destinationId
        }),
        ...(destinationId && !originId && !createNewCopies && {
          createNewCopy: true
        })
      };
    })];
  };
  const {
    objectsToOverwrite,
    objectsToNotOverwrite
  } = (0, _split_overwrites.splitOverwrites)(objectsToResolve, retries);
  await bulkCreateObjects(objectsToOverwrite, true);
  await bulkCreateObjects(objectsToNotOverwrite);
  const errorResults = errorAccumulator.map(error => {
    var _typeRegistry$getType2;
    const icon = (_typeRegistry$getType2 = typeRegistry.getType(error.type)) === null || _typeRegistry$getType2 === void 0 || (_typeRegistry$getType2 = _typeRegistry$getType2.management) === null || _typeRegistry$getType2 === void 0 ? void 0 : _typeRegistry$getType2.icon;
    const attemptedOverwrite = retries.some(({
      type,
      id,
      overwrite
    }) => type === error.type && id === error.id && overwrite);
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
    successCount,
    success: errorAccumulator.length === 0,
    ...(successResults.length && {
      successResults
    }),
    ...(errorResults.length && {
      errors: errorResults
    })
  };
}