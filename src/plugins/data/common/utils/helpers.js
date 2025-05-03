"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleQueryResults = exports.delay = void 0;
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

const delay = ms => new Promise(res => setTimeout(res, ms));
exports.delay = delay;
const handleQueryResults = async options => {
  const {
    pollQueryResults,
    interval = 5000
  } = options;
  let queryResultsRes;
  let queryStatus;
  do {
    var _queryResultsRes;
    // Wait for the given interval in ms before polling for the query status/results
    await delay(interval);
    queryResultsRes = await pollQueryResults();
    queryStatus = (_queryResultsRes = queryResultsRes) === null || _queryResultsRes === void 0 || (_queryResultsRes = _queryResultsRes.status) === null || _queryResultsRes === void 0 ? void 0 : _queryResultsRes.toUpperCase();
  } while (queryStatus !== 'SUCCESS' && queryStatus !== 'FAILED');
  if (queryStatus === 'FAILED') {
    var _queryResultsRes2;
    throw new Error((_queryResultsRes2 = queryResultsRes) === null || _queryResultsRes2 === void 0 ? void 0 : _queryResultsRes2.body.error);
  }
  return queryResultsRes;
};
exports.handleQueryResults = handleQueryResults;