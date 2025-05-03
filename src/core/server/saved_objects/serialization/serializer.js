"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SavedObjectsSerializer = void 0;
var _uuid = _interopRequireDefault(require("uuid"));
var _version = require("../version");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */ /*
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
 * A serializer that can be used to manually convert {@link SavedObjectsRawDoc | raw} or
 * {@link SavedObjectSanitizedDoc | sanitized} documents to the other kind.
 *
 * @remarks Serializer instances should only be created and accessed by calling {@link SavedObjectsServiceStart.createSerializer}
 *
 * @public
 */
class SavedObjectsSerializer {
  /**
   * @internal
   */
  constructor(registry) {
    _defineProperty(this, "registry", void 0);
    this.registry = registry;
  }
  /**
   * Determines whether or not the raw document can be converted to a saved object.
   *
   * @param {SavedObjectsRawDoc} rawDoc - The raw OpenSearch document to be tested
   */
  isRawSavedObject(rawDoc) {
    const {
      type,
      namespace
    } = rawDoc._source;
    const namespacePrefix = namespace && this.registry.isSingleNamespace(type) ? `${namespace}:` : '';
    return Boolean(type && rawDoc._id.startsWith(`${namespacePrefix}${type}:`) && rawDoc._source.hasOwnProperty(type));
  }

  /**
   * Converts a document from the format that is stored in opensearch to the saved object client format.
   *
   *  @param {SavedObjectsRawDoc} doc - The raw OpenSearch document to be converted to saved object format.
   */
  rawToSavedObject(doc) {
    const {
      _id,
      _source,
      _seq_no,
      _primary_term
    } = doc;
    const {
      type,
      namespace,
      namespaces,
      originId,
      workspaces,
      permissions
    } = _source;
    const version = _seq_no != null || _primary_term != null ? (0, _version.encodeVersion)(_seq_no, _primary_term) : undefined;
    return {
      type,
      id: this.trimIdPrefix(namespace, type, _id),
      ...(namespace && this.registry.isSingleNamespace(type) && {
        namespace
      }),
      ...(namespaces && this.registry.isMultiNamespace(type) && {
        namespaces
      }),
      ...(originId && {
        originId
      }),
      ...(permissions && {
        permissions
      }),
      attributes: _source[type],
      references: _source.references || [],
      ...(_source.migrationVersion && {
        migrationVersion: _source.migrationVersion
      }),
      ...(_source.updated_at && {
        updated_at: _source.updated_at
      }),
      ...(version && {
        version
      }),
      ...(workspaces && {
        workspaces
      })
    };
  }

  /**
   * Converts a document from the saved object client format to the format that is stored in opensearch.
   *
   * @param {SavedObjectSanitizedDoc} savedObj - The saved object to be converted to raw OpenSearch format.
   */
  savedObjectToRaw(savedObj) {
    const {
      id,
      type,
      namespace,
      namespaces,
      originId,
      attributes,
      migrationVersion,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      updated_at,
      version,
      references,
      workspaces,
      permissions
    } = savedObj;
    const source = {
      [type]: attributes,
      type,
      references,
      ...(namespace && this.registry.isSingleNamespace(type) && {
        namespace
      }),
      ...(namespaces && this.registry.isMultiNamespace(type) && {
        namespaces
      }),
      ...(originId && {
        originId
      }),
      ...(migrationVersion && {
        migrationVersion
      }),
      ...(updated_at && {
        updated_at
      }),
      ...(workspaces && {
        workspaces
      }),
      ...(permissions && {
        permissions
      })
    };
    return {
      _id: this.generateRawId(namespace, type, id),
      _source: source,
      ...(version != null && (0, _version.decodeVersion)(version))
    };
  }

  /**
   * Given a saved object type and id, generates the compound id that is stored in the raw document.
   *
   * @param {string} namespace - The namespace of the saved object
   * @param {string} type - The saved object type
   * @param {string} id - The id of the saved object
   */
  generateRawId(namespace, type, id) {
    const namespacePrefix = namespace && this.registry.isSingleNamespace(type) ? `${namespace}:` : '';
    return `${namespacePrefix}${type}:${id || _uuid.default.v1()}`;
  }
  trimIdPrefix(namespace, type, id) {
    assertNonEmptyString(id, 'document id');
    assertNonEmptyString(type, 'saved object type');
    const namespacePrefix = namespace && this.registry.isSingleNamespace(type) ? `${namespace}:` : '';
    const prefix = `${namespacePrefix}${type}:`;
    if (!id.startsWith(prefix)) {
      return id;
    }
    return id.slice(prefix.length);
  }
}
exports.SavedObjectsSerializer = SavedObjectsSerializer;
function assertNonEmptyString(value, name) {
  if (!value || typeof value !== 'string') {
    throw new TypeError(`Expected "${value}" to be a ${name}`);
  }
}