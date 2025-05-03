"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getThemeDefinitionSource = exports.getThemeDefinition = exports.ThemeColorSchemes = exports.THEME_SOURCES = void 0;
var _std = require("@osd/std");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
let ThemeColorSchemes = exports.ThemeColorSchemes = /*#__PURE__*/function (ThemeColorSchemes) {
  ThemeColorSchemes["LIGHT"] = "light";
  ThemeColorSchemes["DARK"] = "dark";
  return ThemeColorSchemes;
}({});
const THEME_SOURCES = exports.THEME_SOURCES = (0, _std.deepFreeze)({
  v7: {
    [ThemeColorSchemes.LIGHT]: '@elastic/eui/dist/eui_theme_light.json',
    [ThemeColorSchemes.DARK]: '@elastic/eui/dist/eui_theme_dark.json'
  },
  v9: {
    [ThemeColorSchemes.LIGHT]: '@elastic/eui/dist/eui_theme_v9_light.json',
    [ThemeColorSchemes.DARK]: '@elastic/eui/dist/eui_theme_v9_dark.json'
  },
  default: {
    [ThemeColorSchemes.LIGHT]: '@elastic/eui/dist/eui_theme_next_light.json',
    [ThemeColorSchemes.DARK]: '@elastic/eui/dist/eui_theme_next_dark.json'
  }
});
const getThemeDefinitionSource = (theme, colorScheme = ThemeColorSchemes.LIGHT) => {
  const themeName = theme in THEME_SOURCES ? theme : 'default';
  return THEME_SOURCES[themeName][colorScheme];
};
exports.getThemeDefinitionSource = getThemeDefinitionSource;
const getThemeDefinition = (theme, colorScheme = ThemeColorSchemes.LIGHT) => {
  const file = getThemeDefinitionSource(theme, colorScheme);
  return require(file);
};
exports.getThemeDefinition = getThemeDefinition;