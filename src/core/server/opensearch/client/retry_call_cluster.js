"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.retryCallCluster = exports.migrationRetryCallCluster = void 0;
var _rxjs = require("rxjs");
var _operators = require("rxjs/operators");
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

const retryResponseStatuses = [503,
// ServiceUnavailable
401,
// AuthorizationException
403,
// AuthenticationException
408,
// RequestTimeout
410 // Gone
];

/**
 * Retries the provided OpenSearch API call when a `NoLivingConnectionsError` error is
 * encountered. The API call will be retried once a second, indefinitely, until
 * a successful response or a different error is received.
 *
 * @example
 * ```ts
 * const response = await retryCallCluster(() => client.ping());
 * ```
 *
 * @internal
 */
const retryCallCluster = apiCaller => {
  return (0, _rxjs.defer)(() => apiCaller()).pipe((0, _operators.retryWhen)(errors => errors.pipe((0, _operators.concatMap)(error => (0, _rxjs.iif)(() => error.name === 'NoLivingConnectionsError', (0, _rxjs.timer)(1000), (0, _rxjs.throwError)(error)))))).toPromise();
};

/**
 * Retries the provided OpenSearch API call when an error such as
 * `AuthenticationException` `NoConnections`, `ConnectionFault`,
 * `ServiceUnavailable` or `RequestTimeout` are encountered. The API call will
 * be retried once a second, indefinitely, until a successful response or a
 * different error is received.
 *
 * @example
 * ```ts
 * const response = await migrationRetryCallCluster(() => client.ping(), logger);
 * ```
 *
 * @internal
 */
exports.retryCallCluster = retryCallCluster;
const migrationRetryCallCluster = (apiCaller, log, delay = 2500) => {
  const previousErrors = [];
  return (0, _rxjs.defer)(() => apiCaller()).pipe((0, _operators.retryWhen)(errors => errors.pipe((0, _operators.concatMap)(error => {
    if (!previousErrors.includes(error.message)) {
      log.warn(`Unable to connect to OpenSearch. Error: ${error.message}`);
      previousErrors.push(error.message);
    }
    return (0, _rxjs.iif)(() => {
      var _error$body;
      return error.name === 'NoLivingConnectionsError' || error.name === 'ConnectionError' || error.name === 'TimeoutError' || error.name === 'ResponseError' && retryResponseStatuses.includes(error.statusCode) || (error === null || error === void 0 || (_error$body = error.body) === null || _error$body === void 0 || (_error$body = _error$body.error) === null || _error$body === void 0 ? void 0 : _error$body.type) === 'snapshot_in_progress_exception';
    }, (0, _rxjs.timer)(delay), (0, _rxjs.throwError)(error));
  })))).toPromise();
};
exports.migrationRetryCallCluster = migrationRetryCallCluster;