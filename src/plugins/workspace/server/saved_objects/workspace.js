"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.workspace = void 0;
var _server = require("../../../../core/server");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const workspace = exports.workspace = {
  name: _server.WORKSPACE_TYPE,
  namespaceType: 'agnostic',
  /**
   * Disable operation by using saved objects APIs on workspace metadata
   */
  hidden: true,
  /**
   * workspace won't appear in management page.
   */
  mappings: {
    dynamic: false,
    properties: {
      name: {
        type: 'keyword'
      },
      description: {
        type: 'text'
      },
      features: {
        type: 'keyword'
      },
      color: {
        type: 'keyword'
      },
      icon: {
        type: 'keyword'
      },
      defaultVISTheme: {
        type: 'keyword'
      },
      reserved: {
        type: 'boolean'
      },
      uiSettings: {
        dynamic: false,
        properties: {}
      }
    }
  }
};