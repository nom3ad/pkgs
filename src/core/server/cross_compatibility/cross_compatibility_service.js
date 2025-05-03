"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CrossCompatibilityService = void 0;
var _semver = _interopRequireDefault(require("semver"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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