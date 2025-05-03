"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFilterField = void 0;
var _exists_filter = require("./exists_filter");
var _geo_bounding_box_filter = require("./geo_bounding_box_filter");
var _geo_polygon_filter = require("./geo_polygon_filter");
var _phrase_filter = require("./phrase_filter");
var _phrases_filter = require("./phrases_filter");
var _range_filter = require("./range_filter");
var _missing_filter = require("./missing_filter");
var _geo_shape_filter = require("./geo_shape_filter");
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

const getFilterField = filter => {
  if ((0, _exists_filter.isExistsFilter)(filter)) {
    return (0, _exists_filter.getExistsFilterField)(filter);
  }
  if ((0, _geo_bounding_box_filter.isGeoBoundingBoxFilter)(filter)) {
    return (0, _geo_bounding_box_filter.getGeoBoundingBoxFilterField)(filter);
  }
  if ((0, _geo_polygon_filter.isGeoPolygonFilter)(filter)) {
    return (0, _geo_polygon_filter.getGeoPolygonFilterField)(filter);
  }
  if ((0, _phrase_filter.isPhraseFilter)(filter)) {
    return (0, _phrase_filter.getPhraseFilterField)(filter);
  }
  if ((0, _phrases_filter.isPhrasesFilter)(filter)) {
    return (0, _phrases_filter.getPhrasesFilterField)(filter);
  }
  if ((0, _range_filter.isRangeFilter)(filter)) {
    return (0, _range_filter.getRangeFilterField)(filter);
  }
  if ((0, _missing_filter.isMissingFilter)(filter)) {
    return (0, _missing_filter.getMissingFilterField)(filter);
  }
  if ((0, _geo_shape_filter.isGeoShapeFilter)(filter)) {
    return (0, _geo_shape_filter.getGeoShapeFilterField)(filter);
  }
  return;
};
exports.getFilterField = getFilterField;