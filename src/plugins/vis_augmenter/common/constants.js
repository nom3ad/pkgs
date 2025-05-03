"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PLUGIN_AUGMENTATION_MAX_OBJECTS_SETTING = exports.PLUGIN_AUGMENTATION_ENABLE_SETTING = exports.APP_PATH = exports.APP_API = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const APP_PATH = exports.APP_PATH = {
  STATS: '/stats'
};
const APP_API = exports.APP_API = '/api/vis_augmenter';
const PLUGIN_AUGMENTATION_ENABLE_SETTING = exports.PLUGIN_AUGMENTATION_ENABLE_SETTING = 'visualization:enablePluginAugmentation';
const PLUGIN_AUGMENTATION_MAX_OBJECTS_SETTING = exports.PLUGIN_AUGMENTATION_MAX_OBJECTS_SETTING = 'visualization:enablePluginAugmentation.maxPluginObjects';