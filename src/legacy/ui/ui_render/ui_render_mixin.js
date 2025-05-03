"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uiRenderMixin = uiRenderMixin;
var _crypto = require("crypto");
var _boom = _interopRequireDefault(require("@hapi/boom"));
var _i18n = require("@osd/i18n");
var UiSharedDeps = _interopRequireWildcard(require("@osd/ui-shared-deps"));
var _server = require("../../../core/server");
var _bootstrap = require("./bootstrap");
var _apm = require("../apm");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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
 * @typedef {import('../../server/osd_server').default} OsdServer
 * @typedef {import('../../server/osd_server').ResponseToolkit} ResponseToolkit
 */

/**
 *
 * @param {OsdServer} osdServer
 * @param {OsdServer['server']} server
 * @param {OsdServer['config']} config
 */
function uiRenderMixin(osdServer, server, config) {
  const translationsCache = {
    translations: null,
    hash: null
  };
  const defaultLocale = _i18n.i18n.getLocale() || 'en'; // Fallback to 'en' if no default locale is set

  // Route handler for serving translation files.
  // This handler supports two scenarios:
  // 1. Serving translations for the default locale
  // 2. Serving translations for other registered locales
  server.route({
    path: '/translations/{locale}.json',
    method: 'GET',
    config: {
      auth: false
    },
    handler: async (request, h) => {
      const {
        locale
      } = request.params;
      const normalizedLocale = locale.toLowerCase();
      const registeredLocales = _i18n.i18nLoader.getRegisteredLocales().map(l => l.toLowerCase());
      let warning = null;

      // Function to get or create cached translations
      const getCachedTranslations = async (localeKey, getTranslationsFn) => {
        if (!translationsCache[localeKey]) {
          const translations = await getTranslationsFn();
          translationsCache[localeKey] = {
            translations: translations,
            hash: (0, _crypto.createHash)('sha1').update(JSON.stringify(translations)).digest('hex')
          };
        }
        return translationsCache[localeKey];
      };
      let cachedTranslations;
      if (normalizedLocale === defaultLocale.toLowerCase()) {
        // Default locale
        cachedTranslations = await getCachedTranslations(defaultLocale, () => _i18n.i18n.getTranslation());
      } else if (registeredLocales.includes(normalizedLocale)) {
        // Other registered locales
        cachedTranslations = await getCachedTranslations(normalizedLocale, () => _i18n.i18nLoader.getTranslationsByLocale(locale));
      } else {
        // Locale not found, fall back to en locale
        cachedTranslations = await getCachedTranslations('en', () => _i18n.i18nLoader.getTranslationsByLocale('en'));
        warning = {
          title: 'Unsupported Locale',
          text: `The requested locale "${locale}" is not supported. Falling back to English.`
        };
      }
      const response = {
        translations: cachedTranslations.translations,
        warning
      };
      return h.response(response).header('cache-control', 'must-revalidate').header('content-type', 'application/json').etag(cachedTranslations.hash);
    }
  });
  const authEnabled = !!server.auth.settings.default;
  server.route({
    path: '/bootstrap.js',
    method: 'GET',
    config: {
      tags: ['api'],
      auth: authEnabled ? {
        mode: 'try'
      } : false
    },
    async handler(request, h) {
      const soClient = osdServer.newPlatform.start.core.savedObjects.getScopedClient(_server.OpenSearchDashboardsRequest.from(request));
      const uiSettings = osdServer.newPlatform.start.core.uiSettings.asScopedToClient(soClient);
      const darkMode = !authEnabled || request.auth.isAuthenticated ? await uiSettings.get('theme:darkMode') : uiSettings.getOverrideOrDefault('theme:darkMode');
      const themeMode = darkMode ? 'dark' : 'light';
      const configuredThemeVersion = !authEnabled || request.auth.isAuthenticated ? await uiSettings.get('theme:version') : uiSettings.getOverrideOrDefault('theme:version');
      // Validate themeVersion is in valid format
      const themeVersion = UiSharedDeps.themeVersionValueMap[configuredThemeVersion] || uiSettings.getDefault('theme:version');

      // Next (preview) label is mapped to v8 here
      const themeTag = `${themeVersion}${themeMode}`;
      const buildHash = server.newPlatform.env.packageInfo.buildNum;
      const basePath = config.get('server.basePath');
      const regularBundlePath = `${basePath}/${buildHash}/bundles`;
      const styleSheetPaths = [`${regularBundlePath}/osd-ui-shared-deps/${UiSharedDeps.baseCssDistFilename}`, `${regularBundlePath}/osd-ui-shared-deps/${UiSharedDeps.themeCssDistFilenames[themeVersion][themeMode]}`, `${basePath}/node_modules/@osd/ui-framework/dist/${UiSharedDeps.kuiCssDistFilenames[themeVersion][themeMode]}`, `${basePath}/ui/legacy_${themeMode}_theme.css`];
      const kpUiPlugins = osdServer.newPlatform.__internals.uiPlugins;
      const kpPluginPublicPaths = new Map();
      const kpPluginBundlePaths = new Set();

      // recursively iterate over the kpUiPlugin ids and their required bundles
      // to populate kpPluginPublicPaths and kpPluginBundlePaths
      (function readKpPlugins(ids) {
        for (const id of ids) {
          if (kpPluginPublicPaths.has(id)) {
            continue;
          }
          kpPluginPublicPaths.set(id, `${regularBundlePath}/plugin/${id}/`);
          kpPluginBundlePaths.add(`${regularBundlePath}/plugin/${id}/${id}.plugin.js`);
          readKpPlugins(kpUiPlugins.internal.get(id).requiredBundles);
        }
      })(kpUiPlugins.public.keys());
      const jsDependencyPaths = [...UiSharedDeps.jsDepFilenames.map(filename => `${regularBundlePath}/osd-ui-shared-deps/${filename}`), `${regularBundlePath}/osd-ui-shared-deps/${UiSharedDeps.jsFilename}`, `${regularBundlePath}/core/core.entry.js`, ...kpPluginBundlePaths];

      // These paths should align with the bundle routes configured in
      // src/optimize/bundles_route/bundles_route.ts
      const publicPathMap = JSON.stringify({
        core: `${regularBundlePath}/core/`,
        'osd-ui-shared-deps': `${regularBundlePath}/osd-ui-shared-deps/`,
        ...Object.fromEntries(kpPluginPublicPaths)
      });
      const bootstrap = new _bootstrap.AppBootstrap({
        templateData: {
          themeTag,
          jsDependencyPaths,
          styleSheetPaths,
          publicPathMap
        }
      });
      const body = await bootstrap.getJsFile();
      const etag = await bootstrap.getJsFileHash();
      return h.response(body).header('cache-control', 'must-revalidate').header('content-type', 'application/javascript').etag(etag);
    }
  });
  server.route({
    path: '/app/{id}/{any*}',
    method: 'GET',
    async handler(req, h) {
      try {
        return await h.renderApp();
      } catch (err) {
        throw _boom.default.boomify(err);
      }
    }
  });
  async function renderApp(h) {
    const {
      http
    } = osdServer.newPlatform.setup.core;
    const {
      savedObjects
    } = osdServer.newPlatform.start.core;
    const {
      rendering
    } = osdServer.newPlatform.__internals;
    const req = _server.OpenSearchDashboardsRequest.from(h.request);
    const uiSettings = osdServer.newPlatform.start.core.uiSettings.asScopedToClient(savedObjects.getScopedClient(req));
    const vars = {
      apmConfig: (0, _apm.getApmConfig)(h.request.path)
    };
    const content = await rendering.render(h.request, uiSettings, {
      includeUserSettings: true,
      vars
    });
    return h.response(content).type('text/html').header('content-security-policy', http.csp.header);
  }
  server.decorate('toolkit', 'renderApp', function () {
    return renderApp(this);
  });
}