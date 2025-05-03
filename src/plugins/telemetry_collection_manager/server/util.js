"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isClusterOptedIn = void 0;
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

const isClusterOptedIn = clusterUsage => {
  var _clusterUsage$stack_s;
  return (clusterUsage === null || clusterUsage === void 0 || (_clusterUsage$stack_s = clusterUsage.stack_stats) === null || _clusterUsage$stack_s === void 0 || (_clusterUsage$stack_s = _clusterUsage$stack_s.opensearch_dashboards) === null || _clusterUsage$stack_s === void 0 || (_clusterUsage$stack_s = _clusterUsage$stack_s.plugins) === null || _clusterUsage$stack_s === void 0 || (_clusterUsage$stack_s = _clusterUsage$stack_s.telemetry) === null || _clusterUsage$stack_s === void 0 ? void 0 : _clusterUsage$stack_s.opt_in_status) === true;
};
exports.isClusterOptedIn = isClusterOptedIn;