"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SavedObjectNotFound = exports.OsdError = exports.InvalidJSONProperty = exports.DuplicateField = void 0;
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

/* eslint-disable max-classes-per-file */

// abstract error class
class OsdError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * when a mapping already exists for a field the user is attempting to add
 * @param {String} name - the field name
 */
exports.OsdError = OsdError;
class DuplicateField extends OsdError {
  constructor(name) {
    super(`The field "${name}" already exists in this mapping`);
  }
}

/**
 * A saved object was not found
 */
exports.DuplicateField = DuplicateField;
class SavedObjectNotFound extends OsdError {
  constructor(type, id, link) {
    const idMsg = id ? ` (id: ${id})` : '';
    let message = `Could not locate that ${type}${idMsg}`;
    if (link) {
      message += `, [click here to re-create it](${link})`;
    }
    super(message);
    _defineProperty(this, "savedObjectType", void 0);
    _defineProperty(this, "savedObjectId", void 0);
    this.savedObjectType = type;
    this.savedObjectId = id;
  }
}

/**
 * This error is for scenarios where a saved object is detected that has invalid JSON properties.
 * There was a scenario where we were importing objects with double-encoded JSON, and the system
 * was silently failing. This error is now thrown in those scenarios.
 */
exports.SavedObjectNotFound = SavedObjectNotFound;
class InvalidJSONProperty extends OsdError {
  constructor(message) {
    super(message);
  }
}
exports.InvalidJSONProperty = InvalidJSONProperty;