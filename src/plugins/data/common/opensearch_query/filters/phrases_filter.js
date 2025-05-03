"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPhrasesFilter = exports.getPhrasesFilterField = exports.buildPhrasesFilter = void 0;
var _phrase_filter = require("./phrase_filter");
var _index = require("./index");
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

const isPhrasesFilter = filter => {
  var _filter$meta;
  return (filter === null || filter === void 0 || (_filter$meta = filter.meta) === null || _filter$meta === void 0 ? void 0 : _filter$meta.type) === _index.FILTERS.PHRASES;
};
exports.isPhrasesFilter = isPhrasesFilter;
const getPhrasesFilterField = filter => {
  // Phrases is a newer filter type that has always been created via a constructor that ensures
  // `meta.key` is set to the field name
  return filter.meta.key;
};

// Creates a filter where the given field matches one or more of the given values
// params should be an array of values
exports.getPhrasesFilterField = getPhrasesFilterField;
const buildPhrasesFilter = (field, params, indexPattern) => {
  const index = indexPattern.id;
  const type = _index.FILTERS.PHRASES;
  const key = field.name;
  const format = (f, value) => f && f.format && f.format.convert ? f.format.convert(value) : value;
  const value = params.map(v => format(field, v)).join(', ');
  let should;
  if (field.scripted) {
    should = params.map(v => ({
      script: (0, _phrase_filter.getPhraseScript)(field, v)
    }));
  } else {
    should = params.map(v => ({
      match_phrase: {
        [field.name]: v
      }
    }));
  }
  return {
    meta: {
      index,
      type,
      key,
      value,
      params
    },
    query: {
      bool: {
        should,
        minimum_should_match: 1
      }
    }
  };
};
exports.buildPhrasesFilter = buildPhrasesFilter;