"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteTypeMappingsFields = deleteTypeMappingsFields;
exports.disableUnknownTypeMappingFields = disableUnknownTypeMappingFields;
exports.migrationContext = migrationContext;
var _build_active_mappings = require("./build_active_mappings");
var Index = _interopRequireWildcard(require("./opensearch_index"));
var _migration_logger = require("./migration_logger");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
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
 * The MigrationOpts interface defines the minimum set of data required
 * in order to properly migrate an index. MigrationContext expands this
 * with computed values and values from the index being migrated, and is
 * serves as a central blueprint for what migrations will end up doing.
 */

/**
 * @internal
 */

/**
 * Builds up an uber object which has all of the config options, settings,
 * and various info needed to migrate the source index.
 */
async function migrationContext(opts) {
  const {
    log,
    client,
    opensearchDashboardsRawConfig
  } = opts;
  const alias = opts.index;
  const source = createSourceContext(await Index.fetchInfo(client, alias), alias);
  const dest = createDestContext(source, alias, opts.mappingProperties, opensearchDashboardsRawConfig);
  return {
    client,
    alias,
    source,
    dest,
    log: new _migration_logger.MigrationLogger(log),
    batchSize: opts.batchSize,
    documentMigrator: opts.documentMigrator,
    pollInterval: opts.pollInterval,
    scrollDuration: opts.scrollDuration,
    serializer: opts.serializer,
    obsoleteIndexTemplatePattern: opts.obsoleteIndexTemplatePattern,
    typesToDelete: opts.typesToDelete,
    convertToAliasScript: opts.convertToAliasScript
  };
}
function createSourceContext(source, alias) {
  if (source.exists && source.indexName === alias) {
    return {
      ...source,
      indexName: nextIndexName(alias, alias)
    };
  }
  return source;
}
function createDestContext(source, alias, typeMappingDefinitions, opensearchDashboardsRawConfig) {
  const targetMappings = deleteTypeMappingsFields(disableUnknownTypeMappingFields((0, _build_active_mappings.buildActiveMappings)(typeMappingDefinitions, opensearchDashboardsRawConfig), source.mappings), opensearchDashboardsRawConfig);
  return {
    aliases: {},
    exists: false,
    indexName: nextIndexName(source.indexName, alias),
    mappings: targetMappings
  };
}

/**
 * Merges the active mappings and the source mappings while disabling the
 * fields of any unknown Saved Object types present in the source index's
 * mappings.
 *
 * Since the Saved Objects index has `dynamic: strict` defined at the
 * top-level, only Saved Object types for which a mapping exists can be
 * inserted into the index. To ensure that we can continue to store Saved
 * Object documents belonging to a disabled plugin we define a mapping for all
 * the unknown Saved Object types that were present in the source index's
 * mappings. To limit the field count as much as possible, these unkwnown
 * type's mappings are set to `dynamic: false`.
 *
 * (Since we're using the source index mappings instead of looking at actual
 * document types in the index, we potentially add more "unknown types" than
 * what would be necessary to support migrating all the data over to the
 * target index.)
 *
 * @param activeMappings The mappings compiled from all the Saved Object types
 * known to this OpenSearch Dashboards node.
 * @param sourceMappings The mappings of index used as the migration source.
 * @returns The mappings that should be applied to the target index.
 */
function disableUnknownTypeMappingFields(activeMappings, sourceMappings) {
  const targetTypes = Object.keys(activeMappings.properties);
  const disabledTypesProperties = Object.keys(sourceMappings.properties).filter(sourceType => {
    const isObjectType = ('properties' in sourceMappings.properties[sourceType]);
    // Only Object/Nested datatypes can be excluded from the field count by
    // using `dynamic: false`.
    return !targetTypes.includes(sourceType) && isObjectType;
  }).reduce((disabledTypesAcc, sourceType) => {
    disabledTypesAcc[sourceType] = {
      dynamic: false,
      properties: {}
    };
    return disabledTypesAcc;
  }, {});
  return {
    ...activeMappings,
    properties: {
      ...sourceMappings.properties,
      ...disabledTypesProperties,
      ...activeMappings.properties
    }
  };
}

/**
 * This function is used to modify the target mappings object by deleting specified type mappings fields.
 *
 * The function operates under the following conditions:
 * - It checks if the 'migrations.delete.enabled' configuration is set to true.
 * - If true, it retrieves the 'migrations.delete.types' configuration
 * - For each type, it deletes the corresponding property from the target mappings object.
 *
 * The purpose of this function is to allow for dynamic modification of the target mappings object
 * based on the application's configuration. This can be useful in scenarios where certain type
 * mappings are no longer needed and should be removed from the target mappings.
 *
 * @param {Object} targetMappings - The target mappings object to be modified.
 * @param {Object} opensearchDashboardsRawConfig - The application's configuration object.
 * @returns The mappings that should be applied to the target index.
 */
function deleteTypeMappingsFields(targetMappings, opensearchDashboardsRawConfig) {
  if (opensearchDashboardsRawConfig !== null && opensearchDashboardsRawConfig !== void 0 && opensearchDashboardsRawConfig.get('migrations.delete.enabled')) {
    const deleteTypes = new Set(opensearchDashboardsRawConfig.get('migrations.delete.types'));
    const newProperties = Object.keys(targetMappings.properties).filter(key => !deleteTypes.has(key)).reduce((obj, key) => {
      return {
        ...obj,
        [key]: targetMappings.properties[key]
      };
    }, {});
    return {
      ...targetMappings,
      properties: newProperties
    };
  }
  return targetMappings;
}

/**
 * Gets the next index name in a sequence, based on specified current index's info.
 * We're using a numeric counter to create new indices. So, `.opensearch_dashboards_1`, `.opensearch_dashboards_2`, etc
 * There are downsides to this, but it seemed like a simple enough approach.
 */
function nextIndexName(indexName, alias) {
  const indexSuffix = (indexName.match(/[\d]+$/) || [])[0];
  const indexNum = parseInt(indexSuffix, 10) || 0;
  return `${alias}_${indexNum + 1}`;
}