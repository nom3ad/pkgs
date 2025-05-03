"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fieldWildcardFilter = fieldWildcardFilter;
exports.fieldWildcardMatcher = fieldWildcardMatcher;
exports.makeRegEx = void 0;
var _lodash = require("lodash");
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

// @internal
const makeRegEx = exports.makeRegEx = (0, _lodash.memoize)(function makeRegEx(glob) {
  const globRegex = glob.split('*').map(_lodash.escapeRegExp).join('.*');
  return new RegExp(`^${globRegex}$`);
});

// Note that this will return an essentially noop function if globs is undefined.
function fieldWildcardMatcher(globs = [], metaFields = []) {
  return function matcher(val) {
    // do not test metaFields or keyword
    if (metaFields.indexOf(val) !== -1) {
      return false;
    }
    return globs.some(p => makeRegEx(p).test(`${val}`));
  };
}

// Note that this will return an essentially noop function if globs is undefined.
function fieldWildcardFilter(globs = [], metaFields = []) {
  const matcher = fieldWildcardMatcher(globs, metaFields);
  return function filter(val) {
    return !matcher(val);
  };
}