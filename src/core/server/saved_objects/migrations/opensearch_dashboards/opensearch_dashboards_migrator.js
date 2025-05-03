"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenSearchDashboardsMigrator = void 0;
exports.mergeTypes = mergeTypes;
var _rxjs = require("rxjs");
var _serialization = require("../../serialization");
var _core = require("../core");
var _document_migrator = require("../core/document_migrator");
var _build_index_map = require("../core/build_index_map");
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
 */ /*
 * This file contains the logic for managing the OpenSearch Dashboards index version
 * (the shape of the mappings and documents in the index).
 */
/**
 * Manages the shape of mappings and documents in the OpenSearch Dashboards index.
 */
class OpenSearchDashboardsMigrator {
  /**
   * Creates an instance of OpenSearchDashboardsMigrator.
   */
  constructor({
    client,
    typeRegistry,
    opensearchDashboardsConfig,
    savedObjectsConfig,
    opensearchDashboardsVersion,
    logger,
    opensearchDashboardsRawConfig
  }) {
    _defineProperty(this, "client", void 0);
    _defineProperty(this, "savedObjectsConfig", void 0);
    _defineProperty(this, "documentMigrator", void 0);
    _defineProperty(this, "opensearchDashboardsConfig", void 0);
    _defineProperty(this, "log", void 0);
    _defineProperty(this, "mappingProperties", void 0);
    _defineProperty(this, "typeRegistry", void 0);
    _defineProperty(this, "serializer", void 0);
    _defineProperty(this, "migrationResult", void 0);
    _defineProperty(this, "status$", new _rxjs.BehaviorSubject({
      status: 'waiting'
    }));
    _defineProperty(this, "activeMappings", void 0);
    _defineProperty(this, "opensearchDashboardsRawConfig", void 0);
    this.client = client;
    this.opensearchDashboardsConfig = opensearchDashboardsConfig;
    this.savedObjectsConfig = savedObjectsConfig;
    this.typeRegistry = typeRegistry;
    this.serializer = new _serialization.SavedObjectsSerializer(this.typeRegistry);
    this.mappingProperties = mergeTypes(this.typeRegistry.getAllTypes());
    this.log = logger;
    this.documentMigrator = new _document_migrator.DocumentMigrator({
      opensearchDashboardsVersion,
      typeRegistry,
      log: this.log
    });
    this.opensearchDashboardsRawConfig = opensearchDashboardsRawConfig;
    // Building the active mappings (and associated md5sums) is an expensive
    // operation so we cache the result
    this.activeMappings = (0, _core.buildActiveMappings)(this.mappingProperties, this.opensearchDashboardsRawConfig);
  }

  /**
   * Migrates the mappings and documents in the OpenSearch Dashboards index. By default, this will run only
   * once and subsequent calls will return the result of the original call.
   *
   * @param rerun - If true, method will run a new migration when called again instead of
   * returning the result of the initial migration. This should only be used when factors external
   * to OpenSearch Dashboards itself alter the .kibana index causing the saved objects mappings or data to change
   * after the OpenSearch Dashboards server performed the initial migration.
   *
   * @remarks When the `rerun` parameter is set to true, no checks are performed to ensure that no migration
   * is currently running. Chained or concurrent calls to `runMigrations({ rerun: true })` can lead to
   * multiple migrations running at the same time. When calling with this parameter, it's expected that the calling
   * code should ensure that the initial call resolves before calling the function again.
   *
   * @returns - A promise which resolves once all migrations have been applied.
   *    The promise resolves with an array of migration statuses, one for each
   *    opensearch index which was migrated.
   */
  runMigrations({
    rerun = false
  } = {}) {
    if (this.migrationResult === undefined || rerun) {
      // Reruns are only used by CI / OpenSearchArchiver. Publishing status updates on reruns results in slowing down CI
      // unnecessarily, so we skip it in this case.
      if (!rerun) {
        this.status$.next({
          status: 'running'
        });
      }
      this.migrationResult = this.runMigrationsInternal().then(result => {
        // Similar to above, don't publish status updates when rerunning in CI.
        if (!rerun) {
          this.status$.next({
            status: 'completed',
            result
          });
        }
        return result;
      });
    }
    return this.migrationResult;
  }
  getStatus$() {
    return this.status$.asObservable();
  }
  runMigrationsInternal() {
    const opensearchDashboardsIndexName = this.opensearchDashboardsConfig.index;
    const indexMap = (0, _build_index_map.createIndexMap)({
      opensearchDashboardsIndexName,
      indexMap: this.mappingProperties,
      registry: this.typeRegistry
    });
    const migrators = Object.keys(indexMap).map(index => {
      return new _core.IndexMigrator({
        batchSize: this.savedObjectsConfig.batchSize,
        client: this.client,
        documentMigrator: this.documentMigrator,
        index,
        log: this.log,
        mappingProperties: indexMap[index].typeMappings,
        pollInterval: this.savedObjectsConfig.pollInterval,
        scrollDuration: this.savedObjectsConfig.scrollDuration,
        serializer: this.serializer,
        // Only necessary for the migrator of the opensearch-dashboards index.
        obsoleteIndexTemplatePattern: index === opensearchDashboardsIndexName ? 'opensearch_dashboards_index_template*' : undefined,
        typesToDelete: this.savedObjectsConfig.delete.enabled ? this.savedObjectsConfig.delete.types : undefined,
        convertToAliasScript: indexMap[index].script,
        opensearchDashboardsRawConfig: this.opensearchDashboardsRawConfig
      });
    });
    return Promise.all(migrators.map(migrator => migrator.migrate()));
  }

  /**
   * Gets all the index mappings defined by OpenSearchDashboards's enabled plugins.
   *
   */
  getActiveMappings() {
    return this.activeMappings;
  }

  /**
   * Migrates an individual doc to the latest version, as defined by the plugin migrations.
   *
   * @param doc - The saved object to migrate
   * @returns `doc` with all registered migrations applied.
   */
  migrateDocument(doc) {
    return this.documentMigrator.migrate(doc);
  }
}

/**
 * Merges savedObjectMappings properties into a single object, verifying that
 * no mappings are redefined.
 */
exports.OpenSearchDashboardsMigrator = OpenSearchDashboardsMigrator;
function mergeTypes(types) {
  return types.reduce((acc, {
    name: type,
    mappings
  }) => {
    const duplicate = acc.hasOwnProperty(type);
    if (duplicate) {
      throw new Error(`Type ${type} is already defined.`);
    }
    return {
      ...acc,
      [type]: mappings
    };
  }, {});
}