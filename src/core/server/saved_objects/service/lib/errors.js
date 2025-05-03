"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SavedObjectsErrorHelpers = void 0;
var _boom = _interopRequireDefault(require("@hapi/boom"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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

// 400 - badRequest
const CODE_BAD_REQUEST = 'SavedObjectsClient/badRequest';
// 400 - invalid version
const CODE_INVALID_VERSION = 'SavedObjectsClient/invalidVersion';
// 401 - Not Authorized
const CODE_NOT_AUTHORIZED = 'SavedObjectsClient/notAuthorized';
// 403 - Forbidden
const CODE_FORBIDDEN = 'SavedObjectsClient/forbidden';
// 413 - Request Entity Too Large
const CODE_REQUEST_ENTITY_TOO_LARGE = 'SavedObjectsClient/requestEntityTooLarge';
// 404 - Not Found
const CODE_NOT_FOUND = 'SavedObjectsClient/notFound';
// 409 - Conflict
const CODE_CONFLICT = 'SavedObjectsClient/conflict';
// 429 - Too Many Requests
const CODE_TOO_MANY_REQUESTS = 'SavedObjectsClient/tooManyRequests';
// 400 - OpenSearch Cannot Execute Script
const CODE_OPENSEARCH_CANNOT_EXECUTE_SCRIPT = 'SavedObjectsClient/opensearchCannotExecuteScript';
// 503 - OpenSearch Unavailable
const CODE_OPENSEARCH_UNAVAILABLE = 'SavedObjectsClient/opensearchUnavailable';
// 500 - General Error
const CODE_GENERAL_ERROR = 'SavedObjectsClient/generalError';
const code = Symbol('SavedObjectsClientErrorCode');
function decorate(error, errorCode, statusCode, message) {
  if (isSavedObjectsClientError(error)) {
    return error;
  }
  const boom = _boom.default.boomify(error, {
    statusCode,
    message,
    override: false
  });
  boom[code] = errorCode;
  return boom;
}
function isSavedObjectsClientError(error) {
  return Boolean(error && error[code]);
}
function decorateBadRequestError(error, reason) {
  return decorate(error, CODE_BAD_REQUEST, 400, reason);
}

/**
 * @public
 */
class SavedObjectsErrorHelpers {
  static isSavedObjectsClientError(error) {
    return isSavedObjectsClientError(error);
  }
  static decorateBadRequestError(error, reason) {
    return decorateBadRequestError(error, reason);
  }
  static createBadRequestError(reason) {
    return decorateBadRequestError(new Error('Bad Request'), reason);
  }
  static createUnsupportedTypeError(type) {
    return decorateBadRequestError(new Error('Bad Request'), `Unsupported saved object type: '${type}'`);
  }
  static isBadRequestError(error) {
    return isSavedObjectsClientError(error) && error[code] === CODE_BAD_REQUEST;
  }
  static createInvalidVersionError(versionInput) {
    return decorate(_boom.default.badRequest(`Invalid version [${versionInput}]`), CODE_INVALID_VERSION, 400);
  }
  static isInvalidVersionError(error) {
    return isSavedObjectsClientError(error) && error[code] === CODE_INVALID_VERSION;
  }
  static decorateNotAuthorizedError(error, reason) {
    return decorate(error, CODE_NOT_AUTHORIZED, 401, reason);
  }
  static isNotAuthorizedError(error) {
    return isSavedObjectsClientError(error) && error[code] === CODE_NOT_AUTHORIZED;
  }
  static decorateForbiddenError(error, reason) {
    return decorate(error, CODE_FORBIDDEN, 403, reason);
  }
  static isForbiddenError(error) {
    return isSavedObjectsClientError(error) && error[code] === CODE_FORBIDDEN;
  }
  static decorateRequestEntityTooLargeError(error, reason) {
    return decorate(error, CODE_REQUEST_ENTITY_TOO_LARGE, 413, reason);
  }
  static isRequestEntityTooLargeError(error) {
    return isSavedObjectsClientError(error) && error[code] === CODE_REQUEST_ENTITY_TOO_LARGE;
  }
  static createGenericNotFoundError(type = null, id = null) {
    if (type && id) {
      return decorate(_boom.default.notFound(`Saved object [${type}/${id}] not found`), CODE_NOT_FOUND, 404);
    }
    return decorate(_boom.default.notFound(), CODE_NOT_FOUND, 404);
  }
  static isNotFoundError(error) {
    return isSavedObjectsClientError(error) && error[code] === CODE_NOT_FOUND;
  }
  static decorateConflictError(error, reason) {
    return decorate(error, CODE_CONFLICT, 409, reason);
  }
  static createConflictError(type, id) {
    return SavedObjectsErrorHelpers.decorateConflictError(_boom.default.conflict(`Saved object [${type}/${id}] conflict`));
  }
  static isConflictError(error) {
    return isSavedObjectsClientError(error) && error[code] === CODE_CONFLICT;
  }
  static decorateTooManyRequestsError(error, reason) {
    return decorate(error, CODE_TOO_MANY_REQUESTS, 429, reason);
  }
  static createTooManyRequestsError(type, id) {
    return SavedObjectsErrorHelpers.decorateTooManyRequestsError(_boom.default.tooManyRequests());
  }
  static isTooManyRequestsError(error) {
    return isSavedObjectsClientError(error) && error[code] === CODE_TOO_MANY_REQUESTS;
  }
  static decorateOpenSearchCannotExecuteScriptError(error, reason) {
    return decorate(error, CODE_OPENSEARCH_CANNOT_EXECUTE_SCRIPT, 400, reason);
  }
  static isOpenSearchCannotExecuteScriptError(error) {
    return isSavedObjectsClientError(error) && error[code] === CODE_OPENSEARCH_CANNOT_EXECUTE_SCRIPT;
  }
  static decorateOpenSearchUnavailableError(error, reason) {
    return decorate(error, CODE_OPENSEARCH_UNAVAILABLE, 503, reason);
  }
  static isOpenSearchUnavailableError(error) {
    return isSavedObjectsClientError(error) && error[code] === CODE_OPENSEARCH_UNAVAILABLE;
  }
  static decorateGeneralError(error, reason) {
    return decorate(error, CODE_GENERAL_ERROR, 500, reason);
  }
}
exports.SavedObjectsErrorHelpers = SavedObjectsErrorHelpers;