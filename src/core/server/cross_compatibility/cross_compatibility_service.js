"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CrossCompatibilityService = void 0;
var _semver = _interopRequireDefault(require("semver"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class CrossCompatibilityService {
  constructor(coreContext) {
    _defineProperty(this, "log", void 0);
    this.log = coreContext.logger.get('cross-compatibility-service');
  }
  start({
    opensearch,
    plugins
  }) {
    this.log.warn('Starting cross compatibility service');
    return {
      verifyOpenSearchPluginsState: pluginName => {
        const pluginOpenSearchDeps = plugins.get(pluginName) || {};
        return this.verifyOpenSearchPluginsState(opensearch, pluginOpenSearchDeps, pluginName);
      }
    };
  }
  async getOpenSearchPlugins(opensearch) {
    // Makes cat.plugin api call to fetch list of OpenSearch plugins installed on the cluster
    try {
      const {
        body
      } = await opensearch.client.asInternalUser.cat.plugins({
        format: 'JSON'
      });
      return body;
    } catch (error) {
      this.log.warn(`Cat API call to OpenSearch to get list of plugins installed on the cluster has failed: ${error}`);
      return [];
    }
  }
  checkPluginVersionCompatibility(pluginOpenSearchDeps, opensearchInstalledPlugins, dashboardsPluginName) {
    const results = [];
    for (const [pluginName, versionRange] of Object.entries(pluginOpenSearchDeps)) {
      // add check to see if the Dashboards plugin version is compatible with installed OpenSearch plugin
      const {
        isCompatible,
        installedPluginVersions
      } = this.isVersionCompatibleOSPluginInstalled(opensearchInstalledPlugins, pluginName, versionRange);
      results.push({
        pluginName,
        isCompatible: !isCompatible ? false : true,
        incompatibilityReason: !isCompatible ? `OpenSearch plugin "${pluginName}" in the version range "${versionRange}" is not installed on the OpenSearch for the OpenSearch Dashboards plugin to function as expected.` : '',
        installedVersions: installedPluginVersions
      });
      if (!isCompatible) {
        this.log.warn(`OpenSearch plugin "${pluginName}" is not installed on the cluster for the OpenSearch Dashboards plugin "${dashboardsPluginName}" to function as expected.`);
      }
    }
    return results;
  }
  async verifyOpenSearchPluginsState(opensearch, pluginOpenSearchDeps, pluginName) {
    this.log.info('Checking OpenSearch Plugin version compatibility');
    // make _cat/plugins?format=json call to the OpenSearch instance
    const opensearchInstalledPlugins = await this.getOpenSearchPlugins(opensearch);
    const results = this.checkPluginVersionCompatibility(pluginOpenSearchDeps, opensearchInstalledPlugins, pluginName);
    return results;
  }
  isVersionCompatibleOSPluginInstalled(opensearchInstalledPlugins, depPluginName, depPluginVersionRange) {
    let isCompatible = false;
    const installedPluginVersions = new Set();
    opensearchInstalledPlugins.forEach(obj => {
      if (obj.component === depPluginName && obj.version) {
        installedPluginVersions.add(obj.version);
        if (_semver.default.satisfies(_semver.default.coerce(obj.version).version, depPluginVersionRange)) {
          isCompatible = true;
        }
      }
    });
    return {
      isCompatible,
      installedPluginVersions: [...installedPluginVersions]
    };
  }
}
exports.CrossCompatibilityService = CrossCompatibilityService;