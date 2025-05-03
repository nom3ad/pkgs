"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.homepageSavedObjectType = void 0;
var _constants = require("../../common/constants");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const homepageSavedObjectType = exports.homepageSavedObjectType = {
  name: 'homepage',
  hidden: false,
  namespaceType: 'single',
  management: {
    icon: 'home',
    importableAndExportable: true,
    getTitle() {
      // TODO: currently, this is hardcoded to the application-level homepage. Update this logic to support
      // workspace and user level homepages.
      return 'Home [application]';
    },
    getEditUrl(obj) {
      return `/management/opensearch-dashboards/objects/savedHomepage/${encodeURIComponent(obj.id)}`;
    },
    getInAppUrl() {
      return {
        path: `/app/${_constants.PLUGIN_ID}`,
        uiCapabilitiesPath: `${_constants.PLUGIN_ID}.show`
      };
    }
  },
  mappings: {
    properties: {
      kibanaSavedObjectMeta: {
        properties: {
          searchSourceJSON: {
            type: 'text',
            index: false
          }
        }
      },
      heroes: {
        type: 'object',
        properties: {
          id: {
            type: 'keyword'
          }
        }
      },
      sections: {
        type: 'object',
        properties: {
          id: {
            type: 'keyword'
          }
        }
      }
    }
  }
};