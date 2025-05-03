"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PLUGIN_NAME = exports.PLUGIN_ID = exports.EDIT_PATH = void 0;
Object.defineProperty(exports, "VISBUILDER_SAVED_OBJECT", {
  enumerable: true,
  get: function () {
    return _vis_builder_saved_object_attributes.VISBUILDER_SAVED_OBJECT;
  }
});
exports.VIS_BUILDER_CHART_TYPE = exports.VISUALIZE_ID = void 0;
Object.defineProperty(exports, "VisBuilderSavedObjectAttributes", {
  enumerable: true,
  get: function () {
    return _vis_builder_saved_object_attributes.VisBuilderSavedObjectAttributes;
  }
});
var _vis_builder_saved_object_attributes = require("./vis_builder_saved_object_attributes");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const PLUGIN_ID = exports.PLUGIN_ID = 'vis-builder';
const PLUGIN_NAME = exports.PLUGIN_NAME = 'VisBuilder';
const VISUALIZE_ID = exports.VISUALIZE_ID = 'visualize';
const EDIT_PATH = exports.EDIT_PATH = '/edit';
const VIS_BUILDER_CHART_TYPE = exports.VIS_BUILDER_CHART_TYPE = 'VisBuilder';