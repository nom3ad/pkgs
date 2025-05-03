"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dataConnection = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const dataConnection = exports.dataConnection = {
  name: 'data-connection',
  namespaceType: 'agnostic',
  hidden: false,
  management: {
    icon: 'apps',
    defaultSearchField: 'connectionId',
    importableAndExportable: true
  },
  mappings: {
    dynamic: false,
    properties: {
      connectionId: {
        type: 'text'
      },
      type: {
        type: 'text'
      },
      meta: {
        type: 'text'
      }
    }
  },
  migrations: {}
};