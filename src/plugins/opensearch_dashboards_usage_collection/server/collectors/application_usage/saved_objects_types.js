"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SAVED_OBJECTS_TRANSACTIONAL_TYPE = exports.SAVED_OBJECTS_TOTAL_TYPE = exports.SAVED_OBJECTS_DAILY_TYPE = void 0;
exports.registerMappings = registerMappings;
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

/**
 * Used for accumulating the totals of all the stats older than 90d
 */

const SAVED_OBJECTS_TOTAL_TYPE = exports.SAVED_OBJECTS_TOTAL_TYPE = 'application_usage_totals';

/**
 * Used for storing each of the reports received from the users' browsers
 */

const SAVED_OBJECTS_TRANSACTIONAL_TYPE = exports.SAVED_OBJECTS_TRANSACTIONAL_TYPE = 'application_usage_transactional';

/**
 * Used to aggregate the transactional events into daily summaries so we can purge the granular events
 */

const SAVED_OBJECTS_DAILY_TYPE = exports.SAVED_OBJECTS_DAILY_TYPE = 'application_usage_daily';
function registerMappings(registerType) {
  // Type for storing ApplicationUsageTotal
  registerType({
    name: SAVED_OBJECTS_TOTAL_TYPE,
    hidden: false,
    namespaceType: 'agnostic',
    mappings: {
      // Not indexing any of its contents because we use them "as-is" and don't search by these fields
      // for more info, see the README.md for application_usage
      dynamic: false,
      properties: {}
    }
  });

  // Type for storing ApplicationUsageDaily
  registerType({
    name: SAVED_OBJECTS_DAILY_TYPE,
    hidden: false,
    namespaceType: 'agnostic',
    mappings: {
      dynamic: false,
      properties: {
        // This type requires `timestamp` to be indexed so we can use it when rolling up totals (timestamp < now-90d)
        timestamp: {
          type: 'date'
        }
      }
    }
  });

  // Type for storing ApplicationUsageTransactional (declaring empty mappings because we don't use the internal fields for query/aggregations)
  registerType({
    name: SAVED_OBJECTS_TRANSACTIONAL_TYPE,
    hidden: false,
    namespaceType: 'agnostic',
    mappings: {
      dynamic: false,
      properties: {}
    }
  });
}