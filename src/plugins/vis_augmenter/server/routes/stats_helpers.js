"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStats = exports.getAugmentVisSavedObjects = void 0;
var _lodash = require("lodash");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const getAugmentVisSavedObjects = async (savedObjectsClient, perPage) => {
  const augmentVisSavedObjects = await (savedObjectsClient === null || savedObjectsClient === void 0 ? void 0 : savedObjectsClient.find({
    type: 'augment-vis',
    perPage
  }));
  // If there are more than perPage of objs, we need to make additional requests
  if (augmentVisSavedObjects.total > perPage) {
    const iterations = Math.ceil(augmentVisSavedObjects.total / perPage);
    for (let i = 1; i < iterations; i++) {
      const augmentVisSavedObjectsPage = await (savedObjectsClient === null || savedObjectsClient === void 0 ? void 0 : savedObjectsClient.find({
        type: 'augment-vis',
        perPage,
        page: i + 1
      }));
      augmentVisSavedObjects.saved_objects = [...augmentVisSavedObjects.saved_objects, ...augmentVisSavedObjectsPage.saved_objects];
    }
  }
  return augmentVisSavedObjects;
};

/**
 * Given the _find response that contains all of the saved objects, iterate through them and
 * increment counters for each unique value we are tracking
 */
exports.getAugmentVisSavedObjects = getAugmentVisSavedObjects;
const getStats = resp => {
  const originPluginMap = {};
  const pluginResourceTypeMap = {};
  const pluginResourceIdMap = {};
  const visualizationIdMap = {};
  resp.saved_objects.forEach(augmentVisObj => {
    const originPlugin = augmentVisObj.attributes.originPlugin;
    const pluginResourceType = augmentVisObj.attributes.pluginResource.type;
    const pluginResourceId = augmentVisObj.attributes.pluginResource.id;
    const visualizationId = augmentVisObj.references[0].id;
    originPluginMap[originPlugin] = (0, _lodash.get)(originPluginMap, originPlugin, 0) + 1;
    pluginResourceTypeMap[pluginResourceType] = (0, _lodash.get)(pluginResourceTypeMap, pluginResourceType, 0) + 1;
    pluginResourceIdMap[pluginResourceId] = (0, _lodash.get)(pluginResourceIdMap, pluginResourceId, 0) + 1;
    visualizationIdMap[visualizationId] = (0, _lodash.get)(visualizationIdMap, visualizationId, 0) + 1;
  });
  return {
    total_objs: resp.total,
    obj_breakdown: {
      origin_plugin: originPluginMap,
      plugin_resource_type: pluginResourceTypeMap,
      plugin_resource_id: pluginResourceIdMap,
      visualization_id: visualizationIdMap
    }
  };
};
exports.getStats = getStats;