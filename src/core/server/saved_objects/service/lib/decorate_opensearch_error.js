"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decorateOpenSearchError = decorateOpenSearchError;
var _opensearch = require("@opensearch-project/opensearch");
var _lodash = require("lodash");
var _errors = require("./errors");
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

const responseErrors = {
  isServiceUnavailable: statusCode => statusCode === 503,
  isConflict: statusCode => statusCode === 409,
  isNotAuthorized: statusCode => statusCode === 401,
  isForbidden: statusCode => statusCode === 403,
  isRequestEntityTooLarge: statusCode => statusCode === 413,
  isNotFound: statusCode => statusCode === 404,
  isBadRequest: statusCode => statusCode === 400,
  isTooManyRequests: statusCode => statusCode === 429
};
const {
  ConnectionError,
  NoLivingConnectionsError,
  TimeoutError
} = _opensearch.errors;
const SCRIPT_CONTEXT_DISABLED_REGEX = /(?:cannot execute scripts using \[)([a-z]*)(?:\] context)/;
const INLINE_SCRIPTS_DISABLED_MESSAGE = 'cannot execute [inline] scripts';
function decorateOpenSearchError(error) {
  if (!(error instanceof Error)) {
    throw new Error('Expected an instance of Error');
  }
  const {
    reason
  } = (0, _lodash.get)(error, 'body.error', {
    reason: undefined
  });
  if (error instanceof ConnectionError || error instanceof NoLivingConnectionsError || error instanceof TimeoutError || responseErrors.isServiceUnavailable(error.statusCode)) {
    return _errors.SavedObjectsErrorHelpers.decorateOpenSearchUnavailableError(error, reason);
  }
  if (responseErrors.isConflict(error.statusCode)) {
    return _errors.SavedObjectsErrorHelpers.decorateConflictError(error, reason);
  }
  if (responseErrors.isNotAuthorized(error.statusCode)) {
    return _errors.SavedObjectsErrorHelpers.decorateNotAuthorizedError(error, reason);
  }
  if (responseErrors.isForbidden(error.statusCode)) {
    return _errors.SavedObjectsErrorHelpers.decorateForbiddenError(error, reason);
  }
  if (responseErrors.isRequestEntityTooLarge(error.statusCode)) {
    return _errors.SavedObjectsErrorHelpers.decorateRequestEntityTooLargeError(error, reason);
  }
  if (responseErrors.isNotFound(error.statusCode)) {
    return _errors.SavedObjectsErrorHelpers.createGenericNotFoundError();
  }
  if (responseErrors.isTooManyRequests(error.statusCode)) {
    return _errors.SavedObjectsErrorHelpers.decorateTooManyRequestsError(error, reason);
  }
  if (responseErrors.isBadRequest(error.statusCode)) {
    if (SCRIPT_CONTEXT_DISABLED_REGEX.test(reason || '') || reason === INLINE_SCRIPTS_DISABLED_MESSAGE) {
      return _errors.SavedObjectsErrorHelpers.decorateOpenSearchCannotExecuteScriptError(error, reason);
    }
    return _errors.SavedObjectsErrorHelpers.decorateBadRequestError(error, reason);
  }
  return _errors.SavedObjectsErrorHelpers.decorateGeneralError(error, reason);
}