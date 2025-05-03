"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNewPlatformPlugin = isNewPlatformPlugin;
exports.parseManifest = parseManifest;
var _promises = require("fs/promises");
var _semver = _interopRequireWildcard(require("semver"));
var _path = require("path");
var _lodash = require("lodash");
var _config = require("../../config");
var _plugin_discovery_error = require("./plugin_discovery_error");
var _is_camel_case = require("./is_camel_case");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
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
 * Name of the JSON manifest file that should be located in the plugin directory.
 */
const MANIFEST_FILE_NAME = 'opensearch_dashboards.json';

/**
 * The special "opensearchDashboards" version can be used by the plugins to be always compatible.
 */
const ALWAYS_COMPATIBLE_VERSION = 'opensearchDashboards';

/**
 * Names of the known manifest fields.
 */
const KNOWN_MANIFEST_FIELDS = (() => {
  // We use this trick to have type safety around the keys we use, if we forget to
  // add a new key here or misspell existing one, TypeScript compiler will complain.
  // We do this once at run time, so performance impact is negligible.
  const manifestFields = {
    id: true,
    opensearchDashboardsVersion: true,
    version: true,
    configPath: true,
    requiredPlugins: true,
    requiredEnginePlugins: true,
    optionalPlugins: true,
    ui: true,
    server: true,
    extraPublicDirs: true,
    requiredBundles: true,
    supportedOSDataSourceVersions: true,
    requiredOSDataSourcePlugins: true
  };
  return new Set(Object.keys(manifestFields));
})();

/**
 * Tries to load and parse the plugin manifest file located at the provided plugin
 * directory path and produces an error result if it fails to do so or plugin manifest
 * isn't valid.
 * @param pluginPath Path to the plugin directory where manifest should be loaded from.
 * @param packageInfo OpenSearch Dashboards package info.
 * @internal
 */
async function parseManifest(pluginPath, packageInfo, log) {
  const manifestPath = (0, _path.resolve)(pluginPath, MANIFEST_FILE_NAME);
  let manifestContent;
  try {
    manifestContent = await (0, _promises.readFile)(manifestPath);
  } catch (err) {
    throw _plugin_discovery_error.PluginDiscoveryError.missingManifest(manifestPath, err);
  }
  let manifest;
  try {
    manifest = JSON.parse(manifestContent.toString());
  } catch (err) {
    throw _plugin_discovery_error.PluginDiscoveryError.invalidManifest(manifestPath, err);
  }
  if (!manifest || typeof manifest !== 'object') {
    throw _plugin_discovery_error.PluginDiscoveryError.invalidManifest(manifestPath, new Error('Plugin manifest must contain a JSON encoded object.'));
  }
  if (!manifest.id || typeof manifest.id !== 'string') {
    throw _plugin_discovery_error.PluginDiscoveryError.invalidManifest(manifestPath, new Error('Plugin manifest must contain an "id" property.'));
  }

  // Plugin id can be used as a config path or as a logger context and having dots
  // in there may lead to various issues, so we forbid that.
  if (manifest.id.includes('.')) {
    throw _plugin_discovery_error.PluginDiscoveryError.invalidManifest(manifestPath, new Error('Plugin "id" must not include `.` characters.'));
  }
  if (!packageInfo.dist && !(0, _is_camel_case.isCamelCase)(manifest.id)) {
    log.warn(`Expect plugin "id" in camelCase, but found: ${manifest.id}`);
  }
  if (!manifest.version || typeof manifest.version !== 'string') {
    throw _plugin_discovery_error.PluginDiscoveryError.invalidManifest(manifestPath, new Error(`Plugin manifest for "${manifest.id}" must contain a "version" property.`));
  }
  if (manifest.configPath !== undefined && !(0, _config.isConfigPath)(manifest.configPath)) {
    throw _plugin_discovery_error.PluginDiscoveryError.invalidManifest(manifestPath, new Error(`The "configPath" in plugin manifest for "${manifest.id}" should either be a string or an array of strings.`));
  }
  if (manifest.extraPublicDirs && (!Array.isArray(manifest.extraPublicDirs) || !manifest.extraPublicDirs.every(dir => typeof dir === 'string'))) {
    throw _plugin_discovery_error.PluginDiscoveryError.invalidManifest(manifestPath, new Error(`The "extraPublicDirs" in plugin manifest for "${manifest.id}" should be an array of strings.`));
  }
  if ('requiredEnginePlugins' in manifest) {
    if (typeof manifest.requiredEnginePlugins !== 'object' || !Object.entries(manifest.requiredEnginePlugins).every(([pluginId, pluginVersion]) => typeof pluginId === 'string' && typeof pluginVersion === 'string')) {
      throw _plugin_discovery_error.PluginDiscoveryError.invalidManifest(manifestPath, new Error(`The "requiredEnginePlugins" in plugin manifest for "${manifest.id}" should be an object that maps a plugin name to a version range.`));
    }
    const invalidPluginVersions = [];
    for (const [pluginName, versionRange] of Object.entries(manifest.requiredEnginePlugins)) {
      log.info(`Plugin ${manifest.id} has a dependency on engine plugin: [${pluginName}@${versionRange}]`);
      if (!isOpenSearchPluginVersionRangeValid(versionRange)) {
        invalidPluginVersions.push(`${versionRange} for ${pluginName}`);
      }
    }
    if (invalidPluginVersions.length > 0) {
      throw _plugin_discovery_error.PluginDiscoveryError.invalidManifest(manifestPath, new Error(`The "requiredEnginePlugins" in the plugin manifest for "${manifest.id}" contains invalid version ranges: ${invalidPluginVersions.join(', ')}`));
    }
  }
  const expectedOpenSearchDashboardsVersion = typeof manifest.opensearchDashboardsVersion === 'string' && manifest.opensearchDashboardsVersion ? manifest.opensearchDashboardsVersion : manifest.version;
  if (!isVersionCompatible(expectedOpenSearchDashboardsVersion, packageInfo.version)) {
    throw _plugin_discovery_error.PluginDiscoveryError.incompatibleVersion(manifestPath, new Error(`Plugin "${manifest.id}" is only compatible with OpenSearch Dashboards version "${expectedOpenSearchDashboardsVersion}", but used OpenSearch Dashboards version is "${packageInfo.version}".`));
  }
  const includesServerPlugin = typeof manifest.server === 'boolean' ? manifest.server : false;
  const includesUiPlugin = typeof manifest.ui === 'boolean' ? manifest.ui : false;
  if (!includesServerPlugin && !includesUiPlugin) {
    throw _plugin_discovery_error.PluginDiscoveryError.invalidManifest(manifestPath, new Error(`Both "server" and "ui" are missing or set to "false" in plugin manifest for "${manifest.id}", but at least one of these must be set to "true".`));
  }
  const unknownManifestKeys = Object.keys(manifest).filter(key => !KNOWN_MANIFEST_FIELDS.has(key));
  if (unknownManifestKeys.length > 0) {
    throw _plugin_discovery_error.PluginDiscoveryError.invalidManifest(manifestPath, new Error(`Manifest for plugin "${manifest.id}" contains the following unrecognized properties: ${unknownManifestKeys}.`));
  }
  return {
    id: manifest.id,
    version: manifest.version,
    opensearchDashboardsVersion: expectedOpenSearchDashboardsVersion,
    configPath: manifest.configPath || (0, _lodash.snakeCase)(manifest.id),
    requiredPlugins: Array.isArray(manifest.requiredPlugins) ? manifest.requiredPlugins : [],
    requiredEnginePlugins: manifest.requiredEnginePlugins !== undefined ? manifest.requiredEnginePlugins : {},
    optionalPlugins: Array.isArray(manifest.optionalPlugins) ? manifest.optionalPlugins : [],
    requiredBundles: Array.isArray(manifest.requiredBundles) ? manifest.requiredBundles : [],
    ui: includesUiPlugin,
    server: includesServerPlugin,
    extraPublicDirs: manifest.extraPublicDirs,
    supportedOSDataSourceVersions: manifest.supportedOSDataSourceVersions !== undefined ? manifest.supportedOSDataSourceVersions : '',
    requiredOSDataSourcePlugins: Array.isArray(manifest.requiredOSDataSourcePlugins) ? manifest.requiredOSDataSourcePlugins : []
  };
}

/**
 * Checks whether specified folder contains OpenSearch Dashboards new platform plugin. It's only
 * intended to be used by the legacy systems when they need to check whether specific
 * plugin path is handled by the core plugin system or not.
 * @param pluginPath Path to the plugin.
 * @internal
 */
async function isNewPlatformPlugin(pluginPath) {
  try {
    return (await (0, _promises.stat)((0, _path.resolve)(pluginPath, MANIFEST_FILE_NAME))).isFile();
  } catch (err) {
    return false;
  }
}

/**
 * Checks whether plugin expected OpenSearch Dashboards version is compatible with the used OpenSearch Dashboards version.
 * @param expectedOpenSearchDashboardsVersion OpenSearch Dashboards version expected by the plugin.
 * @param actualOpenSearchDashboardsVersion Used OpenSearch Dashboards version.
 */
function isVersionCompatible(expectedOpenSearchDashboardsVersion, actualOpenSearchDashboardsVersion) {
  if (expectedOpenSearchDashboardsVersion === ALWAYS_COMPATIBLE_VERSION) {
    return true;
  }
  const coercedActualOpenSearchDashboardsVersion = (0, _semver.coerce)(actualOpenSearchDashboardsVersion);
  if (coercedActualOpenSearchDashboardsVersion == null) {
    return false;
  }
  const coercedExpectedOpenSearchDashboardsVersion = (0, _semver.coerce)(expectedOpenSearchDashboardsVersion);
  if (coercedExpectedOpenSearchDashboardsVersion == null) {
    return false;
  }

  // Compare coerced versions, e.g. `1.2.3` ---> `1.2.3` and `7.0.0-alpha1` ---> `7.0.0`.
  return coercedActualOpenSearchDashboardsVersion.compare(coercedExpectedOpenSearchDashboardsVersion) === 0;
}
/**
 * Checks whether specified version range is valid.
 * @param versionRange Version range to be checked.
 */
function isOpenSearchPluginVersionRangeValid(versionRange) {
  try {
    return _semver.default.validRange(versionRange);
  } catch (err) {
    return false;
  }
}