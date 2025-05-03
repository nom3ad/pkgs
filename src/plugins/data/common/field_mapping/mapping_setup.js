"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expandShorthand = void 0;
var _lodash = require("lodash");
var _types = require("../../../data/common/types");
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

// import from ./common/types to prevent circular dependency of opensearch_dashboards_utils <-> data plugin

/** @private */

/** @public */
const expandShorthand = sh => {
  return (0, _lodash.mapValues)(sh, val => {
    const fieldMap = (0, _lodash.isString)(val) ? {
      type: val
    } : val;
    const json = {
      type: _types.OPENSEARCH_FIELD_TYPES.TEXT,
      _serialize(v) {
        if (v) return JSON.stringify(v);
      },
      _deserialize(v) {
        if (v) return JSON.parse(v);
      }
    };
    return fieldMap.type === 'json' ? json : fieldMap;
  });
};
exports.expandShorthand = expandShorthand;