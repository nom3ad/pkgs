"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTranslationPaths = getTranslationPaths;
var _util = require("util");
var _fs = require("fs");
var _path = require("path");
var _globby = _interopRequireDefault(require("globby"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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

const readFileAsync = (0, _util.promisify)(_fs.readFile);
async function getTranslationPaths({
  cwd,
  glob
}) {
  const entries = await (0, _globby.default)(glob, {
    cwd
  });
  const translationPaths = [];
  for (const entry of entries) {
    const entryFullPath = (0, _path.resolve)(cwd, entry);
    const pluginBasePath = (0, _path.dirname)(entryFullPath);
    try {
      const content = await readFileAsync(entryFullPath, 'utf8');
      const {
        translations
      } = JSON.parse(content);
      if (translations && translations.length) {
        translations.forEach(translation => {
          const translationFullPath = (0, _path.resolve)(pluginBasePath, translation);
          translationPaths.push(translationFullPath);
        });
      }
    } catch (err) {
      throw new Error(`Failed to parse .i18nrc.json file at ${entryFullPath}`);
    }
  }
  return translationPaths;
}