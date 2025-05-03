"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getApmConfig = getApmConfig;
var _apm = require("../../../apm");
var _elasticApmNode = _interopRequireDefault(require("elastic-apm-node"));
var _getConfig;
/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */
/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const apmEnabled = (_getConfig = (0, _apm.getConfig)()) === null || _getConfig === void 0 ? void 0 : _getConfig.active;
function getApmConfig(requestPath) {
  if (!apmEnabled) {
    return null;
  }
  const config = {
    ...(0, _apm.getConfig)('opensearch-dashboards-frontend'),
    pageLoadTransactionName: requestPath
  };

  /**
   * Get current active backend transaction to make distrubuted tracing
   * work for rendering the app
   */
  const backendTransaction = _elasticApmNode.default.currentTransaction;
  if (backendTransaction) {
    const {
      sampled,
      traceId
    } = backendTransaction;
    return {
      ...config,
      ...{
        pageLoadTraceId: traceId,
        pageLoadSampled: sampled,
        pageLoadSpanId: backendTransaction.ensureParentId()
      }
    };
  }
  return config;
}