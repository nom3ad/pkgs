"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.migrateDataSource = exports.dataSource = void 0;
var _lodash = require("lodash");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// create a migration function which return the doc without any changes
const migrateDataSource = doc => ({
  ...doc
});
exports.migrateDataSource = migrateDataSource;
const dataSource = exports.dataSource = {
  name: 'data-source',
  namespaceType: 'agnostic',
  hidden: false,
  management: {
    icon: 'database',
    defaultSearchField: 'title',
    importableAndExportable: true,
    getTitle(obj) {
      return obj.attributes.title;
    },
    getEditUrl(obj) {
      return `/management/opensearch-dashboards/dataSources/${encodeURIComponent(obj.id)}`;
    },
    getInAppUrl(obj) {
      return {
        path: `/app/management/opensearch-dashboards/dataSources/${encodeURIComponent(obj.id)}`,
        uiCapabilitiesPath: 'management.opensearchDashboards.dataSources'
      };
    }
  },
  mappings: {
    dynamic: false,
    properties: {
      title: {
        type: 'text'
      }
    }
  },
  migrations: {
    '2.4.0': (0, _lodash.flow)(migrateDataSource) // 2.4.0 is the version that introduces the datasource
  }
};