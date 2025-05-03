"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SavedObjectsUtils = exports.FIND_DEFAULT_PER_PAGE = exports.FIND_DEFAULT_PAGE = exports.DEFAULT_NAMESPACE_STRING = exports.ALL_NAMESPACES_STRING = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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

const DEFAULT_NAMESPACE_STRING = exports.DEFAULT_NAMESPACE_STRING = 'default';
const ALL_NAMESPACES_STRING = exports.ALL_NAMESPACES_STRING = '*';
const FIND_DEFAULT_PAGE = exports.FIND_DEFAULT_PAGE = 1;
const FIND_DEFAULT_PER_PAGE = exports.FIND_DEFAULT_PER_PAGE = 20;

/**
 * @public
 */
class SavedObjectsUtils {}
exports.SavedObjectsUtils = SavedObjectsUtils;
/**
 * Converts a given saved object namespace ID to its string representation. All namespace IDs have an identical string representation, with
 * the exception of the `undefined` namespace ID (which has a namespace string of `'default'`).
 *
 * @param namespace The namespace ID, which must be either a non-empty string or `undefined`.
 */
_defineProperty(SavedObjectsUtils, "namespaceIdToString", namespace => {
  if (namespace === '') {
    throw new TypeError('namespace cannot be an empty string');
  }
  return namespace !== null && namespace !== void 0 ? namespace : DEFAULT_NAMESPACE_STRING;
});
/**
 * Converts a given saved object namespace string to its ID representation. All namespace strings have an identical ID representation, with
 * the exception of the `'default'` namespace string (which has a namespace ID of `undefined`).
 *
 * @param namespace The namespace string, which must be non-empty.
 */
_defineProperty(SavedObjectsUtils, "namespaceStringToId", namespace => {
  if (!namespace) {
    throw new TypeError('namespace must be a non-empty string');
  }
  return namespace !== DEFAULT_NAMESPACE_STRING ? namespace : undefined;
});
/**
 * Creates an empty response for a find operation. This is only intended to be used by saved objects client wrappers.
 */
_defineProperty(SavedObjectsUtils, "createEmptyFindResponse", ({
  page = FIND_DEFAULT_PAGE,
  perPage = FIND_DEFAULT_PER_PAGE
}) => ({
  page,
  per_page: perPage,
  total: 0,
  saved_objects: []
}));