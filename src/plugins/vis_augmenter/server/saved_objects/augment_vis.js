"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.augmentVisSavedObjectType = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const augmentVisSavedObjectType = exports.augmentVisSavedObjectType = {
  name: 'augment-vis',
  hidden: false,
  namespaceType: 'single',
  management: {
    importableAndExportable: true,
    getTitle(obj) {
      var _obj$attributes;
      return `augment-vis-${obj === null || obj === void 0 || (_obj$attributes = obj.attributes) === null || _obj$attributes === void 0 ? void 0 : _obj$attributes.originPlugin}`;
    },
    getEditUrl(obj) {
      return `/management/opensearch-dashboards/objects/savedAugmentVis/${encodeURIComponent(obj.id)}`;
    }
  },
  mappings: {
    properties: {
      title: {
        type: 'text'
      },
      description: {
        type: 'text'
      },
      originPlugin: {
        type: 'text'
      },
      pluginResource: {
        properties: {
          type: {
            type: 'text'
          },
          id: {
            type: 'text'
          }
        }
      },
      visName: {
        type: 'keyword',
        index: false,
        doc_values: false
      },
      visLayerExpressionFn: {
        properties: {
          type: {
            type: 'text'
          },
          name: {
            type: 'text'
          },
          // keeping generic to not limit what users may pass as args to their fns
          // users may not have this field at all, if no args are needed
          args: {
            type: 'object',
            dynamic: true
          }
        }
      },
      version: {
        type: 'integer'
      }
    }
  }
};