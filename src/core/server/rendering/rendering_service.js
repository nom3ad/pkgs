"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RenderingService = void 0;
var _react = _interopRequireDefault(require("react"));
var _server = require("react-dom/server");
var _operators = require("rxjs/operators");
var _i18n = require("@osd/i18n");
var _https = require("https");
var _uiSharedDeps = require("@osd/ui-shared-deps");
var _axios = _interopRequireDefault(require("axios"));
var _http = _interopRequireDefault(require("axios/lib/adapters/http"));
var _views = require("./views");
var _ssl_config = require("../http/ssl_config");
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
 */ // @ts-expect-error untyped internal module used to prevent axios from using xhr adapter in tests
const DEFAULT_TITLE = 'OpenSearch Dashboards';

/** @internal */
class RenderingService {
  constructor(coreContext) {
    this.coreContext = coreContext;
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "httpsAgent", void 0);
    /**
     * Assign values for branding related configurations based on branding validation
     * by calling checkBrandingValid(). For dark mode URLs, add additional validation
     * to see if there is a valid default mode URL exist first. If URL is valid, pass in
     * the actual URL; if not, pass in undefined.
     *
     * @param {boolean} darkMode
     * @param {Readonly<OpenSearchDashboardsConfigType>} opensearchDashboardsConfig
     * @returns {BrandingAssignment} valid URLs or undefined assigned for each branding configs
     */
    _defineProperty(this, "assignBrandingConfig", async (darkMode, opensearchDashboardsConfig) => {
      const brandingValidation = await this.checkBrandingValid(darkMode, opensearchDashboardsConfig);
      const branding = opensearchDashboardsConfig.branding;

      // assign default mode URL based on the brandingValidation function result
      const logoDefault = brandingValidation.isLogoDefaultValid ? branding.logo.defaultUrl : undefined;
      const markDefault = brandingValidation.isMarkDefaultValid ? branding.mark.defaultUrl : undefined;
      const loadingLogoDefault = brandingValidation.isLoadingLogoDefaultValid ? branding.loadingLogo.defaultUrl : undefined;

      // assign dark mode URLs based on brandingValidation function result
      let logoDarkmode = brandingValidation.isLogoDarkmodeValid ? branding.logo.darkModeUrl : undefined;
      let markDarkmode = brandingValidation.isMarkDarkmodeValid ? branding.mark.darkModeUrl : undefined;
      let loadingLogoDarkmode = brandingValidation.isLoadingLogoDarkmodeValid ? branding.loadingLogo.darkModeUrl : undefined;

      /**
       * For dark mode URLs, we added another validation:
       * user can only provide a dark mode URL after providing a valid default mode URL,
       * If user provides a valid dark mode URL but fails to provide a valid default mode URL,
       * return undefined for the dark mode URL
       */
      if (logoDarkmode && !logoDefault) {
        this.logger.get('branding').error('Must provide a valid logo default mode URL before providing a logo dark mode URL');
        logoDarkmode = undefined;
      }
      if (markDarkmode && !markDefault) {
        this.logger.get('branding').error('Must provide a valid mark default mode URL before providing a mark dark mode URL');
        markDarkmode = undefined;
      }
      if (loadingLogoDarkmode && !loadingLogoDefault) {
        this.logger.get('branding').error('Must provide a valid loading logo default mode URL before providing a loading logo dark mode URL');
        loadingLogoDarkmode = undefined;
      }

      // assign favicon based on brandingValidation function result
      const favicon = brandingValidation.isFaviconValid ? branding.faviconUrl : undefined;

      // assign application title based on brandingValidation function result
      const applicationTitle = brandingValidation.isTitleValid ? branding.applicationTitle : DEFAULT_TITLE;

      // use expanded menu by default unless explicitly set to false
      const {
        useExpandedHeader = true
      } = branding;
      const brandingAssignment = {
        logoDefault,
        logoDarkmode,
        markDefault,
        markDarkmode,
        loadingLogoDefault,
        loadingLogoDarkmode,
        favicon,
        applicationTitle,
        useExpandedHeader
      };
      return brandingAssignment;
    });
    /**
     * Assign boolean values for branding related configurations to indicate if
     * user inputs valid or invalid URLs by calling isUrlValid() function. Also
     * check if title is valid by calling isTitleValid() function.
     *
     * @param {boolean} darkMode
     * @param {Readonly<OpenSearchDashboardsConfigType>} opensearchDashboardsConfig
     * @returns {BrandingValidation} indicate valid/invalid URL for each branding config
     */
    _defineProperty(this, "checkBrandingValid", async (darkMode, opensearchDashboardsConfig) => {
      const branding = opensearchDashboardsConfig.branding;
      const isLogoDefaultValid = await this.isUrlValid(branding.logo.defaultUrl, 'logo default');
      const isLogoDarkmodeValid = darkMode ? await this.isUrlValid(branding.logo.darkModeUrl, 'logo darkMode') : false;
      const isMarkDefaultValid = await this.isUrlValid(branding.mark.defaultUrl, 'mark default');
      const isMarkDarkmodeValid = darkMode ? await this.isUrlValid(branding.mark.darkModeUrl, 'mark darkMode') : false;
      const isLoadingLogoDefaultValid = await this.isUrlValid(branding.loadingLogo.defaultUrl, 'loadingLogo default');
      const isLoadingLogoDarkmodeValid = darkMode ? await this.isUrlValid(branding.loadingLogo.darkModeUrl, 'loadingLogo darkMode') : false;
      const isFaviconValid = await this.isUrlValid(branding.faviconUrl, 'favicon');
      const isTitleValid = this.isTitleValid(branding.applicationTitle, 'applicationTitle');
      const brandingValidation = {
        isLogoDefaultValid,
        isLogoDarkmodeValid,
        isMarkDefaultValid,
        isMarkDarkmodeValid,
        isLoadingLogoDefaultValid,
        isLoadingLogoDarkmodeValid,
        isFaviconValid,
        isTitleValid
      };
      return brandingValidation;
    });
    /**
     * Validation function for URLs. Use Axios to call URL and check validity.
     * Also needs to be ended with png, svg, gif, PNG, SVG and GIF.
     *
     * @param {string} url
     * @param {string} configName
     * @returns {boolean} indicate if the URL is valid/invalid
     */
    _defineProperty(this, "isUrlValid", async (url, configName) => {
      if (url === '/') {
        return false;
      }
      if (url.match(/\.(png|svg|gif|PNG|SVG|GIF)$/) === null) {
        this.logger.get('branding').error(`${configName} config is invalid. Using default branding.`);
        return false;
      }
      if (url.startsWith('/')) {
        return true;
      }
      return await _axios.default.get(url, {
        httpsAgent: this.httpsAgent,
        adapter: _http.default,
        maxRedirects: 0
      }).then(() => {
        return true;
      }).catch(() => {
        this.logger.get('branding').error(`${configName} URL was not found or invalid. Using default branding.`);
        return false;
      });
    });
    /**
     * Validation function for applicationTitle config.
     * Title length needs to be between 1 to 36 letters.
     *
     * @param {string} title
     * @param {string} configName
     * @returns {boolean} indicate if user input title is valid/invalid
     */
    _defineProperty(this, "isTitleValid", (title, configName) => {
      if (!title) {
        return false;
      }
      if (title.length > 36) {
        this.logger.get('branding').error(`${configName} config is not found or invalid. Title length should be between 1 to 36 characters. Using default title.`);
        return false;
      }
      return true;
    });
    /**
     * Determines the color-scheme mode and version of the theme to be applied.
     *
     * The theme values are selected in the following order of precedence:
     *   1. A configured override from the YAML config file.
     *   2. A requested override from the `themeTag` parameter in the URL.
     *   3. A value configured by the user.
     *   4. The default value specified in the YAML file or the schema.
     *
     *   If `themeTag` is invalid, it is ignored.
     *   If any other extracted detail is invalid, the system default is used.
     */
    _defineProperty(this, "getThemeDetails", (userSettings, defaults, uiSettings, themeTagOverride) => {
      var _ref, _ref2, _defaults$darkMode2, _defaults$version2;
      const darkMode = ((_userSettings$darkMod, _defaults$darkMode) => {
        /* eslint-disable dot-notation */
        // 1. A configured override from the YAML config file
        if (uiSettings.isOverridden('theme:darkMode')) {
          // The override value is stored in `userValue`
          return uiSettings.getOverrideOrDefault('theme:darkMode');
        }

        // Check validity of `themeTagOverride` and get its details
        const themeTagDetail = themeTagOverride ? _uiSharedDeps.themeTagDetailMap.get(themeTagOverride) : undefined;

        // 2. A requested override from the `themeTag` parameter in the URL
        if ((themeTagDetail === null || themeTagDetail === void 0 ? void 0 : themeTagDetail.mode) !== undefined) return themeTagDetail.mode === 'dark';

        // 3. A value configured by the user
        if (((_userSettings$darkMod = userSettings.darkMode) === null || _userSettings$darkMod === void 0 ? void 0 : _userSettings$darkMod.userValue) !== undefined) return userSettings.darkMode.userValue;

        // 4. The default value specified in the YAML file or the schema
        return (_defaults$darkMode = defaults['darkMode']) === null || _defaults$darkMode === void 0 ? void 0 : _defaults$darkMode.value;
      })();
      const version = ((_userSettings$version, _defaults$version) => {
        /* eslint-disable dot-notation */
        // 1. A configured override from the YAML config file
        if (uiSettings.isOverridden('theme:version')) {
          // The override value is stored in `userValue`
          return uiSettings.getOverrideOrDefault('theme:version');
        }

        // Check validity of `themeTagOverride` and get its details
        const themeTagDetail = themeTagOverride ? _uiSharedDeps.themeTagDetailMap.get(themeTagOverride) : undefined;

        // The version is a `string` and the best test is `||`
        return (
          // 2. A requested override from the `themeTag` parameter in the URL
          (themeTagDetail === null || themeTagDetail === void 0 ? void 0 : themeTagDetail.version) || ( // 3. A value configured by the user
          (_userSettings$version = userSettings.version) === null || _userSettings$version === void 0 ? void 0 : _userSettings$version.userValue) || ( // 4. The default value specified in the YAML file or the schema
          (_defaults$version = defaults['version']) === null || _defaults$version === void 0 ? void 0 : _defaults$version.value)
        );
      })();
      return {
        /* eslint-disable dot-notation */
        // If the value for `darkMode` couldn't be deduced, system default is used.
        // The `false` is unreachable since schema will always have a default; set to accommodate tests.
        darkMode: (_ref = (_ref2 = darkMode) !== null && _ref2 !== void 0 ? _ref2 : (_defaults$darkMode2 = defaults['darkMode']) === null || _defaults$darkMode2 === void 0 ? void 0 : _defaults$darkMode2.value) !== null && _ref !== void 0 ? _ref : false,
        // Checking `themeVersionValueMap` makes sure the version is valid; if not system default is used
        version: _uiSharedDeps.themeVersionValueMap[version] || ((_defaults$version2 = defaults['version']) === null || _defaults$version2 === void 0 ? void 0 : _defaults$version2.value) ||
        // The `''` is unreachable since schema will always have a default; set to accommodate tests.
        ''
      };
    });
    this.logger = this.coreContext.logger;
  }
  async setup({
    http,
    status,
    uiPlugins,
    dynamicConfig
  }) {
    const [opensearchDashboardsConfig, serverConfig] = await Promise.all([this.coreContext.configService.atPath('opensearchDashboards').pipe((0, _operators.first)()).toPromise(), this.coreContext.configService.atPath('server').pipe((0, _operators.first)()).toPromise()]);
    this.setupHttpAgent(serverConfig);
    return {
      render: async (request, uiSettings, {
        includeUserSettings = true,
        vars
      } = {}) => {
        var _settings$user, _settings$user2, _settings$defaults, _settings$defaults2, _request$query, _request$query$trim;
        const env = {
          mode: this.coreContext.env.mode,
          packageInfo: this.coreContext.env.packageInfo
        };
        const basePath = http.basePath.get(request);
        const uiPublicUrl = `${basePath}/ui`;
        const serverBasePath = http.basePath.serverBasePath;
        const settings = {
          defaults: uiSettings.getRegistered(),
          user: includeUserSettings ? await uiSettings.getUserProvided() : {}
        };
        const themeTagOverride = request.query.themeTag;
        /* At the very least, the schema should define a default theme and darkMode;
         * the false and '' below will be unreachable.
         */
        const {
          darkMode = false,
          version: themeVersion = ''
        } = this.getThemeDetails(
        // Cannot use `uiSettings.get()` since a user might not be authenticated
        {
          darkMode: (_settings$user = settings.user) === null || _settings$user === void 0 ? void 0 : _settings$user['theme:darkMode'],
          version: (_settings$user2 = settings.user) === null || _settings$user2 === void 0 ? void 0 : _settings$user2['theme:version']
        }, {
          darkMode: (_settings$defaults = settings.defaults) === null || _settings$defaults === void 0 ? void 0 : _settings$defaults['theme:darkMode'],
          version: (_settings$defaults2 = settings.defaults) === null || _settings$defaults2 === void 0 ? void 0 : _settings$defaults2['theme:version']
        }, uiSettings, themeTagOverride);
        const brandingAssignment = await this.assignBrandingConfig(darkMode, opensearchDashboardsConfig);
        let locale = _i18n.i18n.getLocale();
        const localeOverride = (_request$query = request.query) === null || _request$query === void 0 || (_request$query = _request$query.locale) === null || _request$query === void 0 || (_request$query$trim = _request$query.trim) === null || _request$query$trim === void 0 ? void 0 : _request$query$trim.call(_request$query);
        if (localeOverride) {
          const normalizedLocale = _i18n.i18n.normalizeLocale(localeOverride);
          if (_i18n.i18nLoader.isRegisteredLocale(normalizedLocale)) {
            locale = normalizedLocale;
          }
        }
        const dynamicConfigStartServices = await dynamicConfig.getStartService();
        const metadata = {
          strictCsp: http.csp.strict,
          uiPublicUrl,
          bootstrapScriptUrl: `${basePath}/bootstrap.js`,
          i18n: _i18n.i18n.translate,
          locale,
          darkMode,
          themeVersion,
          injectedMetadata: {
            version: env.packageInfo.version,
            buildNumber: env.packageInfo.buildNum,
            branch: env.packageInfo.branch,
            basePath,
            serverBasePath,
            env,
            anonymousStatusPage: status.isStatusPageAnonymous(),
            i18n: {
              translationsUrl: `${basePath}/translations/${locale}.json`
            },
            csp: {
              warnLegacyBrowsers: http.csp.warnLegacyBrowsers
            },
            vars: vars !== null && vars !== void 0 ? vars : {},
            uiPlugins: await Promise.all([...uiPlugins.public].map(async ([id, plugin]) => ({
              id,
              plugin,
              // TODO Scope the client so that only exposedToBrowser configs are exposed
              config: this.coreContext.dynamicConfigService.hasDefaultConfigs({
                name: id
              }) ? await dynamicConfigStartServices.getClient().getConfig({
                name: id
              }, {
                asyncLocalStorageContext: dynamicConfigStartServices.getAsyncLocalStore()
              }) : await this.getUiConfig(uiPlugins, id)
            }))),
            legacyMetadata: {
              uiSettings: settings
            },
            branding: {
              darkMode,
              assetFolderUrl: `${uiPublicUrl}/default_branding`,
              logo: {
                defaultUrl: brandingAssignment.logoDefault,
                darkModeUrl: brandingAssignment.logoDarkmode
              },
              mark: {
                defaultUrl: brandingAssignment.markDefault,
                darkModeUrl: brandingAssignment.markDarkmode
              },
              loadingLogo: {
                defaultUrl: brandingAssignment.loadingLogoDefault,
                darkModeUrl: brandingAssignment.loadingLogoDarkmode
              },
              faviconUrl: brandingAssignment.favicon,
              applicationTitle: brandingAssignment.applicationTitle,
              useExpandedHeader: brandingAssignment.useExpandedHeader
            },
            survey: opensearchDashboardsConfig.survey.url
          }
        };
        return `<!DOCTYPE html>${(0, _server.renderToStaticMarkup)( /*#__PURE__*/_react.default.createElement(_views.Template, {
          metadata: metadata
        }))}`;
      }
    };
  }
  async stop() {}

  /**
   * Setups HTTP Agent if SSL is enabled to pass SSL config
   * values to Axios to make requests in while validating
   * resources.
   *
   * @param {Readonly<HttpConfigType>} httpConfig
   */
  setupHttpAgent(httpConfig) {
    var _httpConfig$ssl;
    if (!((_httpConfig$ssl = httpConfig.ssl) !== null && _httpConfig$ssl !== void 0 && _httpConfig$ssl.enabled)) return;
    try {
      const sslConfig = new _ssl_config.SslConfig(httpConfig.ssl);
      this.httpsAgent = new _https.Agent({
        ca: sslConfig.certificateAuthorities,
        cert: sslConfig.certificate,
        key: sslConfig.key,
        passphrase: sslConfig.keyPassphrase,
        rejectUnauthorized: false
      });
    } catch (e) {
      this.logger.get('branding').error('HTTP agent failed to setup for SSL.');
    }
  }
  async getUiConfig(uiPlugins, pluginId) {
    var _await$browserConfig$;
    const browserConfig = uiPlugins.browserConfigs.get(pluginId);
    return (_await$browserConfig$ = await (browserConfig === null || browserConfig === void 0 ? void 0 : browserConfig.pipe((0, _operators.take)(1)).toPromise())) !== null && _await$browserConfig$ !== void 0 ? _await$browserConfig$ : {};
  }
}
exports.RenderingService = RenderingService;