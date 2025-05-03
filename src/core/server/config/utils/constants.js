"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DYNAMIC_APP_CONFIG_MAX_RESULT_SIZE = exports.DYNAMIC_APP_CONFIG_INDEX_PREFIX = exports.DYNAMIC_APP_CONFIG_ALIAS = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// TODO Once the migration logic is added, refactor the index name to some function that returns the Nth version
const DYNAMIC_APP_CONFIG_INDEX_PREFIX = exports.DYNAMIC_APP_CONFIG_INDEX_PREFIX = '.opensearch_dashboards_dynamic_config';
const DYNAMIC_APP_CONFIG_ALIAS = exports.DYNAMIC_APP_CONFIG_ALIAS = '.opensearch_dashboards_dynamic_config';
const DYNAMIC_APP_CONFIG_MAX_RESULT_SIZE = exports.DYNAMIC_APP_CONFIG_MAX_RESULT_SIZE = 1000;