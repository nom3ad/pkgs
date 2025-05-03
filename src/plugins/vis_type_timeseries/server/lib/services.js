"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setDataSourceEnabled = exports.getDataSourceEnabled = void 0;
var _common = require("../../../opensearch_dashboards_utils/common");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const [getDataSourceEnabled, setDataSourceEnabled] = (0, _common.createGetterSetter)('DataSource');
exports.setDataSourceEnabled = setDataSourceEnabled;
exports.getDataSourceEnabled = getDataSourceEnabled;