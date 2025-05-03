"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.i18nMixin = i18nMixin;
var _i18n = require("@osd/i18n");
var _utils = require("../../../core/server/utils");
var _get_translations_path = require("./get_translations_path");
var _constants = require("./constants");
var _localization = require("./localization");
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

async function i18nMixin(osdServer, server, config) {
  const locale = config.get('i18n.locale');
  const translationPaths = await Promise.all([(0, _get_translations_path.getTranslationPaths)({
    cwd: (0, _utils.fromRoot)('.'),
    glob: `*/${_constants.I18N_RC}`
  }), ...config.get('plugins.paths').map(cwd => (0, _get_translations_path.getTranslationPaths)({
    cwd,
    glob: _constants.I18N_RC
  })), ...config.get('plugins.scanDirs').map(cwd => (0, _get_translations_path.getTranslationPaths)({
    cwd,
    glob: `*/${_constants.I18N_RC}`
  })), (0, _get_translations_path.getTranslationPaths)({
    cwd: (0, _utils.fromRoot)('../opensearch-dashboards-extra'),
    glob: `*/${_constants.I18N_RC}`
  })]);

  // Flatten the array of arrays
  const allTranslationPaths = [].concat(...translationPaths);

  // Register all translation files, not just the ones for the current locale
  _i18n.i18nLoader.registerTranslationFiles(allTranslationPaths);
  const translations = await _i18n.i18nLoader.getTranslationsByLocale(locale);
  _i18n.i18n.init(Object.freeze({
    locale,
    ...translations
  }));
  const getTranslationsFilePaths = () => allTranslationPaths;
  server.decorate('server', 'getTranslationsFilePaths', getTranslationsFilePaths);
  if (osdServer.newPlatform.setup.plugins.usageCollection) {
    const {
      usageCollection
    } = osdServer.newPlatform.setup.plugins;
    (0, _localization.registerLocalizationUsageCollector)(usageCollection, {
      getLocale: () => config.get('i18n.locale'),
      getTranslationsFilePaths
    });
  }
}