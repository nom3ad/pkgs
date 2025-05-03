"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLogos = exports.OPENSEARCH_THEMED = exports.OPENSEARCH_ON_LIGHT = exports.OPENSEARCH_ON_DARK = exports.OPENSEARCH_DASHBOARDS_THEMED = exports.OPENSEARCH_DASHBOARDS_ON_LIGHT = exports.OPENSEARCH_DASHBOARDS_ON_DARK = exports.MARK_THEMED = exports.MARK_ON_LIGHT = exports.MARK_ON_DARK = exports.CENTER_MARK_THEMED = exports.CENTER_MARK_ON_LIGHT = exports.CENTER_MARK_ON_DARK = exports.ANIMATED_MARK_THEMED = exports.ANIMATED_MARK_ON_LIGHT = exports.ANIMATED_MARK_ON_DARK = void 0;
var _std = require("@osd/std");
var _constants = require("./constants");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// The logos are stored at `src/core/server/core_app/assets/logos` to have a pretty URL
const OPENSEARCH_DASHBOARDS_THEMED = exports.OPENSEARCH_DASHBOARDS_THEMED = 'ui/logos/opensearch_dashboards.svg';
const OPENSEARCH_DASHBOARDS_ON_LIGHT = exports.OPENSEARCH_DASHBOARDS_ON_LIGHT = 'ui/logos/opensearch_dashboards_on_light.svg';
const OPENSEARCH_DASHBOARDS_ON_DARK = exports.OPENSEARCH_DASHBOARDS_ON_DARK = 'ui/logos/opensearch_dashboards_on_dark.svg';
const OPENSEARCH_THEMED = exports.OPENSEARCH_THEMED = 'ui/logos/opensearch.svg';
const OPENSEARCH_ON_LIGHT = exports.OPENSEARCH_ON_LIGHT = 'ui/logos/opensearch_on_light.svg';
const OPENSEARCH_ON_DARK = exports.OPENSEARCH_ON_DARK = 'ui/logos/opensearch_on_dark.svg';
const MARK_THEMED = exports.MARK_THEMED = 'ui/logos/opensearch_mark.svg';
const MARK_ON_LIGHT = exports.MARK_ON_LIGHT = 'ui/logos/opensearch_mark_on_light.svg';
const MARK_ON_DARK = exports.MARK_ON_DARK = 'ui/logos/opensearch_mark_on_dark.svg';
const CENTER_MARK_THEMED = exports.CENTER_MARK_THEMED = 'ui/logos/opensearch_center_mark.svg';
const CENTER_MARK_ON_LIGHT = exports.CENTER_MARK_ON_LIGHT = 'ui/logos/opensearch_center_mark_on_light.svg';
const CENTER_MARK_ON_DARK = exports.CENTER_MARK_ON_DARK = 'ui/logos/opensearch_center_mark_on_dark.svg';
const ANIMATED_MARK_THEMED = exports.ANIMATED_MARK_THEMED = 'ui/logos/opensearch_spinner.svg';
const ANIMATED_MARK_ON_LIGHT = exports.ANIMATED_MARK_ON_LIGHT = 'ui/logos/opensearch_spinner_on_light.svg';
const ANIMATED_MARK_ON_DARK = exports.ANIMATED_MARK_ON_DARK = 'ui/logos/opensearch_spinner_on_dark.svg';
/**
 * Loops through the assets to find one that has a `url` set. If dark color-scheme asset is needed,
 * light assets can be used for fallback but not vice vera.
 * Place defaults at the end of assets to use them as final fallbacks.
 * `assets` should have dark - light assets of each type, one after the other.
 */
const getFirstUsableAsset = (assets, requireDarkColorScheme = false) => {
  for (const {
    url,
    type,
    colorScheme
  } of assets) {
    if (url && (requireDarkColorScheme || colorScheme === 'light')) return {
      url,
      type
    };
  }

  // `assets` will contain the default assets so the code will never get here
  throw new Error('No default asset found');
};
const getLogo = (assets, requireDarkColorScheme = false) => {
  const lightAsset = getFirstUsableAsset(assets, false);
  const darkAsset = getFirstUsableAsset(assets, true);
  const colorSchemeAsset = requireDarkColorScheme ? darkAsset : lightAsset;
  return {
    light: lightAsset,
    dark: darkAsset,
    url: colorSchemeAsset.url,
    type: colorSchemeAsset.type
  };
};

/**
 * Generates all the combinations of logos based on the color-scheme and branding config
 *
 * Ideally, the default logos would point to color-scheme-aware (aka themed) imagery while the dark and light
 * subtypes reference the dark and light variants. Sadly, Safari doesn't support color-schemes in SVGs yet.
 * https://bugs.webkit.org/show_bug.cgi?id=199134
 */
const getLogos = (branding = {}, serverBasePath) => {
  const {
    logo: {
      defaultUrl: customLogoUrl,
      darkModeUrl: customDarkLogoUrl
    } = {},
    mark: {
      defaultUrl: customMarkUrl,
      darkModeUrl: customDarkMarkUrl
    } = {},
    loadingLogo: {
      defaultUrl: customAnimatedUrl,
      darkModeUrl: customDarkAnimatedMarkUrl
    } = {},
    darkMode = false
  } = branding;

  // OSD logos
  const defaultLightColorSchemeOpenSearchDashboards = `${serverBasePath}/${OPENSEARCH_DASHBOARDS_ON_LIGHT}`;
  const defaultDarkColorSchemeOpenSearchDashboards = `${serverBasePath}/${OPENSEARCH_DASHBOARDS_ON_DARK}`;
  // OS logos
  const defaultLightColorSchemeOpenSearch = `${serverBasePath}/${OPENSEARCH_ON_LIGHT}`;
  const defaultDarkColorSchemeOpenSearch = `${serverBasePath}/${OPENSEARCH_ON_DARK}`;
  // OS marks
  const defaultLightColorSchemeMark = `${serverBasePath}/${MARK_ON_LIGHT}`;
  const defaultDarkColorSchemeMark = `${serverBasePath}/${MARK_ON_DARK}`;
  // OS marks variant padded (but not centered) within the container
  // ToDo: This naming is misleading; figure out if the distinction could be handled with CSS padding alone
  // https://github.com/opensearch-project/OpenSearch-Dashboards/issues/4714
  const defaultLightColorSchemeCenterMark = `${serverBasePath}/${CENTER_MARK_ON_LIGHT}`;
  const defaultDarkColorSchemeCenterMark = `${serverBasePath}/${CENTER_MARK_ON_DARK}`;
  // OS animated marks
  const defaultLightColorSchemeAnimatedMark = `${serverBasePath}/${ANIMATED_MARK_ON_LIGHT}`;
  const defaultDarkColorSchemeAnimatedMark = `${serverBasePath}/${ANIMATED_MARK_ON_DARK}`;
  const colorScheme = darkMode ? _constants.ColorScheme.DARK : _constants.ColorScheme.LIGHT;

  // It is easier to read the lines unwrapped, so
  // prettier-ignore
  return (0, _std.deepFreeze)({
    OpenSearch: getLogo([{
      url: customDarkLogoUrl,
      type: _constants.ImageType.CUSTOM,
      colorScheme: _constants.ColorScheme.DARK
    }, {
      url: customLogoUrl,
      type: _constants.ImageType.CUSTOM,
      colorScheme: _constants.ColorScheme.LIGHT
    }, {
      url: defaultDarkColorSchemeOpenSearch,
      type: _constants.ImageType.DEFAULT,
      colorScheme: _constants.ColorScheme.DARK
    }, {
      url: defaultLightColorSchemeOpenSearch,
      type: _constants.ImageType.DEFAULT,
      colorScheme: _constants.ColorScheme.LIGHT
    }], darkMode),
    Application: getLogo([{
      url: customDarkLogoUrl,
      type: _constants.ImageType.CUSTOM,
      colorScheme: _constants.ColorScheme.DARK
    }, {
      url: customLogoUrl,
      type: _constants.ImageType.CUSTOM,
      colorScheme: _constants.ColorScheme.LIGHT
    }, {
      url: defaultDarkColorSchemeOpenSearchDashboards,
      type: _constants.ImageType.DEFAULT,
      colorScheme: _constants.ColorScheme.DARK
    }, {
      url: defaultLightColorSchemeOpenSearchDashboards,
      type: _constants.ImageType.DEFAULT,
      colorScheme: _constants.ColorScheme.LIGHT
    }], darkMode),
    Mark: getLogo([{
      url: customDarkMarkUrl,
      type: _constants.ImageType.CUSTOM,
      colorScheme: _constants.ColorScheme.DARK
    }, {
      url: customMarkUrl,
      type: _constants.ImageType.CUSTOM,
      colorScheme: _constants.ColorScheme.LIGHT
    }, {
      url: defaultDarkColorSchemeMark,
      type: _constants.ImageType.DEFAULT,
      colorScheme: _constants.ColorScheme.DARK
    }, {
      url: defaultLightColorSchemeMark,
      type: _constants.ImageType.DEFAULT,
      colorScheme: _constants.ColorScheme.LIGHT
    }], darkMode),
    CenterMark: getLogo([{
      url: customDarkMarkUrl,
      type: _constants.ImageType.CUSTOM,
      colorScheme: _constants.ColorScheme.DARK
    }, {
      url: customMarkUrl,
      type: _constants.ImageType.CUSTOM,
      colorScheme: _constants.ColorScheme.LIGHT
    }, {
      url: defaultDarkColorSchemeCenterMark,
      type: _constants.ImageType.DEFAULT,
      colorScheme: _constants.ColorScheme.DARK
    }, {
      url: defaultLightColorSchemeCenterMark,
      type: _constants.ImageType.DEFAULT,
      colorScheme: _constants.ColorScheme.LIGHT
    }], darkMode),
    AnimatedMark: getLogo([{
      url: customDarkAnimatedMarkUrl,
      type: _constants.ImageType.CUSTOM,
      colorScheme: _constants.ColorScheme.DARK
    }, {
      url: customAnimatedUrl,
      type: _constants.ImageType.CUSTOM,
      colorScheme: _constants.ColorScheme.LIGHT
    }, {
      url: customDarkMarkUrl,
      type: _constants.ImageType.ALTERNATIVE,
      colorScheme: _constants.ColorScheme.DARK
    }, {
      url: customMarkUrl,
      type: _constants.ImageType.ALTERNATIVE,
      colorScheme: _constants.ColorScheme.LIGHT
    }, {
      url: defaultDarkColorSchemeAnimatedMark,
      type: _constants.ImageType.DEFAULT,
      colorScheme: _constants.ColorScheme.DARK
    }, {
      url: defaultLightColorSchemeAnimatedMark,
      type: _constants.ImageType.DEFAULT,
      colorScheme: _constants.ColorScheme.LIGHT
    }], darkMode),
    colorScheme
  });
};
exports.getLogos = getLogos;