"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCollectorFetch = createCollectorFetch;
exports.getTranslationCount = getTranslationCount;
exports.registerLocalizationUsageCollector = registerLocalizationUsageCollector;
var _i18n = require("@osd/i18n");
var _lodash = require("lodash");
var _file_integrity = require("./file_integrity");
var _constants = require("../constants");
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

async function getTranslationCount(loader, locale) {
  const translations = await loader.getTranslationsByLocale(locale);
  return (0, _lodash.size)(translations.messages);
}
function createCollectorFetch({
  getLocale,
  getTranslationsFilePaths
}) {
  return async function fetchUsageStats() {
    const locale = getLocale();
    const translationFilePaths = getTranslationsFilePaths();
    const [labelsCount, integrities] = await Promise.all([getTranslationCount(_i18n.i18nLoader, locale), (0, _file_integrity.getIntegrityHashes)(translationFilePaths)]);
    return {
      locale,
      integrities,
      labelsCount
    };
  };
}
function registerLocalizationUsageCollector(usageCollection, helpers) {
  const collector = usageCollection.makeUsageCollector({
    type: _constants.OPENSEARCH_DASHBOARDS_LOCALIZATION_STATS_TYPE,
    isReady: () => true,
    fetch: createCollectorFetch(helpers)
  });
  usageCollection.registerCollector(collector);
}