"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SavedObjectsClient = void 0;
var _errors = require("./lib/errors");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
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
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 * Return type of the Saved Objects `find()` method.
 *
 * *Note*: this type is different between the Public and Server Saved Objects
 * clients.
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */

/**
 *
 * @public
 */
class SavedObjectsClient {
  /** @internal */
  constructor(repository) {
    _defineProperty(this, "errors", _errors.SavedObjectsErrorHelpers);
    _defineProperty(this, "_repository", void 0);
    /**
     * delete saved objects by workspace id
     * @param workspace
     * @param options
     */
    _defineProperty(this, "deleteByWorkspace", async (workspace, options = {}) => {
      return await this._repository.deleteByWorkspace(workspace, options);
    });
    /**
     * Remove a saved object from workspaces
     * @param type
     * @param id
     * @param targetWorkspaces
     * @param options
     */
    _defineProperty(this, "deleteFromWorkspaces", async (type, id, targetWorkspaces, options = {}) => {
      var _object$workspaces;
      if (!targetWorkspaces || targetWorkspaces.length === 0) {
        throw new TypeError(`Workspaces is required.`);
      }
      if ('workspaces' in options && options.workspaces) {
        throw new TypeError('Invalid options, options.workspaces should not exist.');
      }
      const object = await this.get(type, id, options);
      const existingWorkspaces = (_object$workspaces = object.workspaces) !== null && _object$workspaces !== void 0 ? _object$workspaces : [];
      const newWorkspaces = existingWorkspaces.filter(item => {
        return targetWorkspaces.indexOf(item) === -1;
      });
      return await this.update(type, id, object.attributes, {
        ...options,
        workspaces: newWorkspaces,
        version: object.version
      });
    });
    /**
     * Add a saved object to workspaces
     * @param type
     * @param id
     * @param targetWorkspaces
     * @param options
     */
    _defineProperty(this, "addToWorkspaces", async (type, id, targetWorkspaces, options = {}) => {
      var _object$workspaces2;
      if (!targetWorkspaces || targetWorkspaces.length === 0) {
        throw new TypeError(`Workspaces is required.`);
      }
      const object = await this.get(type, id, options);
      const existingWorkspaces = (_object$workspaces2 = object.workspaces) !== null && _object$workspaces2 !== void 0 ? _object$workspaces2 : [];
      const mergedWorkspaces = existingWorkspaces.concat(targetWorkspaces);
      const nonDuplicatedWorkspaces = Array.from(new Set(mergedWorkspaces));
      return await this.update(type, id, object.attributes, {
        ...options,
        workspaces: nonDuplicatedWorkspaces,
        version: object.version
      });
    });
    this._repository = repository;
  }

  /**
   * Persists a SavedObject
   *
   * @param type
   * @param attributes
   * @param options
   */
  async create(type, attributes, options) {
    return await this._repository.create(type, attributes, options);
  }

  /**
   * Persists multiple documents batched together as a single request
   *
   * @param objects
   * @param options
   */
  async bulkCreate(objects, options) {
    return await this._repository.bulkCreate(objects, options);
  }

  /**
   * Check what conflicts will result when creating a given array of saved objects. This includes "unresolvable conflicts", which are
   * multi-namespace objects that exist in a different namespace; such conflicts cannot be resolved/overwritten.
   *
   * @param objects
   * @param options
   */
  async checkConflicts(objects = [], options = {}) {
    return await this._repository.checkConflicts(objects, options);
  }

  /**
   * Deletes a SavedObject
   *
   * @param type
   * @param id
   * @param options
   */
  async delete(type, id, options = {}) {
    return await this._repository.delete(type, id, options);
  }

  /**
   * Find all SavedObjects matching the search query
   *
   * @param options
   */
  async find(options) {
    return await this._repository.find(options);
  }

  /**
   * Returns an array of objects by id
   *
   * @param objects - an array of ids, or an array of objects containing id, type and optionally fields
   * @example
   *
   * bulkGet([
   *   { id: 'one', type: 'config' },
   *   { id: 'foo', type: 'index-pattern' }
   * ])
   */
  async bulkGet(objects = [], options = {}) {
    return await this._repository.bulkGet(objects, options);
  }

  /**
   * Retrieves a single object
   *
   * @param type - The type of SavedObject to retrieve
   * @param id - The ID of the SavedObject to retrieve
   * @param options
   */
  async get(type, id, options = {}) {
    return await this._repository.get(type, id, options);
  }

  /**
   * Updates an SavedObject
   *
   * @param type
   * @param id
   * @param options
   */
  async update(type, id, attributes, options = {}) {
    return await this._repository.update(type, id, attributes, options);
  }

  /**
   * Adds namespaces to a SavedObject
   *
   * @param type
   * @param id
   * @param namespaces
   * @param options
   */
  async addToNamespaces(type, id, namespaces, options = {}) {
    return await this._repository.addToNamespaces(type, id, namespaces, options);
  }

  /**
   * Removes namespaces from a SavedObject
   *
   * @param type
   * @param id
   * @param namespaces
   * @param options
   */
  async deleteFromNamespaces(type, id, namespaces, options = {}) {
    return await this._repository.deleteFromNamespaces(type, id, namespaces, options);
  }
  /**
   * Bulk Updates multiple SavedObject at once
   *
   * @param objects
   */
  async bulkUpdate(objects, options) {
    return await this._repository.bulkUpdate(objects, options);
  }
}
exports.SavedObjectsClient = SavedObjectsClient;
_defineProperty(SavedObjectsClient, "errors", _errors.SavedObjectsErrorHelpers);