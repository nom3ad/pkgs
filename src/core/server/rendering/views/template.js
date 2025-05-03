"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Template = void 0;
var _react = _interopRequireWildcard(require("react"));
var _fonts = require("./fonts");
var _styles = require("./styles");
var _common = require("../../../common");
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

const Template = ({
  metadata: {
    uiPublicUrl,
    locale,
    darkMode,
    themeVersion,
    injectedMetadata,
    i18n,
    bootstrapScriptUrl,
    strictCsp
  }
}) => {
  const logos = (0, _common.getLogos)(injectedMetadata.branding, injectedMetadata.serverBasePath);
  const favicon = injectedMetadata.branding.faviconUrl;
  const applicationTitle = injectedMetadata.branding.applicationTitle || 'OpenSearch Dashboards';
  return /*#__PURE__*/_react.default.createElement("html", {
    lang: locale
  }, /*#__PURE__*/_react.default.createElement("head", null, /*#__PURE__*/_react.default.createElement("meta", {
    charSet: "utf-8"
  }), /*#__PURE__*/_react.default.createElement("meta", {
    httpEquiv: "X-UA-Compatible",
    content: "IE=edge,chrome=1"
  }), /*#__PURE__*/_react.default.createElement("meta", {
    name: "viewport",
    content: "width=device-width"
  }), /*#__PURE__*/_react.default.createElement("title", null, applicationTitle), /*#__PURE__*/_react.default.createElement("link", {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: favicon !== null && favicon !== void 0 ? favicon : `${uiPublicUrl}/favicons/apple-touch-icon.png`
  }), /*#__PURE__*/_react.default.createElement("link", {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: favicon !== null && favicon !== void 0 ? favicon : `${uiPublicUrl}/favicons/favicon-32x32.png`
  }), /*#__PURE__*/_react.default.createElement("link", {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: favicon !== null && favicon !== void 0 ? favicon : `${uiPublicUrl}/favicons/favicon-16x16.png`
  }), /*#__PURE__*/_react.default.createElement("link", {
    rel: "manifest",
    href: favicon ? `` : `${uiPublicUrl}/favicons/manifest.json`
  }), /*#__PURE__*/_react.default.createElement("link", {
    rel: "mask-icon",
    color: "#003553",
    href: favicon !== null && favicon !== void 0 ? favicon : `${uiPublicUrl}/favicons/safari-pinned-tab.svg`
  }), /*#__PURE__*/_react.default.createElement("link", {
    rel: "shortcut icon",
    href: favicon !== null && favicon !== void 0 ? favicon : `${uiPublicUrl}/favicons/favicon.ico`
  }), /*#__PURE__*/_react.default.createElement("meta", {
    name: "msapplication-config",
    content: favicon ? `` : `${uiPublicUrl}/favicons/browserconfig.xml`
  }), /*#__PURE__*/_react.default.createElement("meta", {
    name: "theme-color",
    content: "#ffffff"
  }), /*#__PURE__*/_react.default.createElement(_styles.Styles, {
    darkMode: darkMode,
    theme: themeVersion
  }), /*#__PURE__*/_react.default.createElement("meta", {
    name: "add-styles-here"
  }), /*#__PURE__*/_react.default.createElement("meta", {
    name: "add-scripts-here"
  }), /*#__PURE__*/_react.default.createElement(_fonts.Fonts, {
    url: uiPublicUrl,
    theme: themeVersion
  })), /*#__PURE__*/_react.default.createElement("body", null, /*#__PURE__*/(0, _react.createElement)('osd-csp', {
    data: JSON.stringify({
      strictCsp
    })
  }), /*#__PURE__*/(0, _react.createElement)('osd-injected-metadata', {
    data: JSON.stringify(injectedMetadata)
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "osdWelcomeView",
    id: "osd_loading_message",
    style: {
      display: 'none'
    },
    "data-test-subj": "osdLoadingMessage"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "osdLoaderWrap",
    "data-test-subj": "loadingLogo"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "loadingLogoContainer"
  }, /*#__PURE__*/_react.default.createElement("img", {
    className: "loadingLogo",
    src: logos.AnimatedMark.url,
    alt: `${applicationTitle} logo`,
    "data-test-subj": `${logos.AnimatedMark.type}Logo`,
    "data-test-image-url": logos.AnimatedMark.url,
    loading: "eager"
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "osdWelcomeText",
    "data-error-message": i18n('core.ui.welcomeErrorMessage', {
      defaultMessage: `${applicationTitle} did not load properly. Check the server output for more information.`
    })
  }, i18n('core.ui.welcomeMessage', {
    defaultMessage: `Loading ${applicationTitle}`
  })), logos.AnimatedMark.type === _common.ImageType.ALTERNATIVE && /*#__PURE__*/_react.default.createElement("div", {
    className: "osdProgress"
  }))), /*#__PURE__*/_react.default.createElement("div", {
    className: "osdWelcomeView",
    id: "osd_legacy_browser_error",
    style: {
      display: 'none'
    }
  }, /*#__PURE__*/_react.default.createElement("img", {
    "data-test-subj": logos.Mark.type + ' logo',
    "data-test-image-url": logos.Mark.url,
    src: logos.Mark.url,
    alt: `${applicationTitle} logo`,
    className: "legacyBrowserErrorLogo"
  }), /*#__PURE__*/_react.default.createElement("h2", {
    className: "osdWelcomeTitle"
  }, i18n('core.ui.legacyBrowserTitle', {
    defaultMessage: 'Please upgrade your browser'
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "osdWelcomeText"
  }, i18n('core.ui.legacyBrowserMessage', {
    defaultMessage: 'This OpenSearch installation has strict security requirements enabled that your current browser does not meet.'
  }))), /*#__PURE__*/_react.default.createElement("script", null, `
            // Since this is an unsafe inline script, this code will not run
            // in browsers that support content security policy(CSP). This is
            // intentional as we check for the existence of __osdCspNotEnforced__ in
            // bootstrap.
            window.__osdCspNotEnforced__ = true;
          `), /*#__PURE__*/_react.default.createElement("script", {
    src: bootstrapScriptUrl
  })));
};
exports.Template = Template;