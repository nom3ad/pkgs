"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateStatus$ = void 0;
var _rxjs = require("rxjs");
var _operators = require("rxjs/operators");
var _status = require("../status");
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

const calculateStatus$ = opensearchNodesCompatibility$ => (0, _rxjs.merge)((0, _rxjs.of)({
  level: _status.ServiceStatusLevels.unavailable,
  summary: `Waiting for OpenSearch`,
  meta: {
    warningNodes: [],
    incompatibleNodes: []
  }
}), opensearchNodesCompatibility$.pipe((0, _operators.map)(({
  isCompatible,
  message,
  incompatibleNodes,
  warningNodes
}) => {
  if (!isCompatible) {
    return {
      level: _status.ServiceStatusLevels.critical,
      summary: // Message should always be present, but this is a safe fallback
      message !== null && message !== void 0 ? message : `Some OpenSearch nodes are not compatible with this version of OpenSearch Dashboards`,
      meta: {
        warningNodes,
        incompatibleNodes
      }
    };
  } else if (warningNodes.length > 0) {
    return {
      level: _status.ServiceStatusLevels.available,
      summary: // Message should always be present, but this is a safe fallback
      message !== null && message !== void 0 ? message : `Some OpenSearch nodes are running different versions than this version of OpenSearch Dashboards`,
      meta: {
        warningNodes,
        incompatibleNodes
      }
    };
  }
  return {
    level: _status.ServiceStatusLevels.available,
    summary: (message !== null && message !== void 0 ? message : `OpenSearch is available`) || `Unknown`,
    meta: {
      warningNodes: [],
      incompatibleNodes: []
    }
  };
})));
exports.calculateStatus$ = calculateStatus$;