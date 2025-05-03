"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OSD_FIELD_TYPES = exports.OPENSEARCH_FIELD_TYPES = void 0;
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
/** @public **/
/** @public **/
let OPENSEARCH_FIELD_TYPES = exports.OPENSEARCH_FIELD_TYPES = /*#__PURE__*/function (OPENSEARCH_FIELD_TYPES) {
  OPENSEARCH_FIELD_TYPES["_ID"] = "_id";
  OPENSEARCH_FIELD_TYPES["_INDEX"] = "_index";
  OPENSEARCH_FIELD_TYPES["_SOURCE"] = "_source";
  OPENSEARCH_FIELD_TYPES["_TYPE"] = "_type";
  OPENSEARCH_FIELD_TYPES["STRING"] = "string";
  OPENSEARCH_FIELD_TYPES["TEXT"] = "text";
  OPENSEARCH_FIELD_TYPES["KEYWORD"] = "keyword";
  OPENSEARCH_FIELD_TYPES["BOOLEAN"] = "boolean";
  OPENSEARCH_FIELD_TYPES["OBJECT"] = "object";
  OPENSEARCH_FIELD_TYPES["DATE"] = "date";
  OPENSEARCH_FIELD_TYPES["DATE_NANOS"] = "date_nanos";
  OPENSEARCH_FIELD_TYPES["GEO_POINT"] = "geo_point";
  OPENSEARCH_FIELD_TYPES["GEO_SHAPE"] = "geo_shape";
  OPENSEARCH_FIELD_TYPES["FLOAT"] = "float";
  OPENSEARCH_FIELD_TYPES["HALF_FLOAT"] = "half_float";
  OPENSEARCH_FIELD_TYPES["SCALED_FLOAT"] = "scaled_float";
  OPENSEARCH_FIELD_TYPES["DOUBLE"] = "double";
  OPENSEARCH_FIELD_TYPES["INTEGER"] = "integer";
  OPENSEARCH_FIELD_TYPES["LONG"] = "long";
  OPENSEARCH_FIELD_TYPES["SHORT"] = "short";
  OPENSEARCH_FIELD_TYPES["UNSIGNED_LONG"] = "unsigned_long";
  OPENSEARCH_FIELD_TYPES["NESTED"] = "nested";
  OPENSEARCH_FIELD_TYPES["BYTE"] = "byte";
  OPENSEARCH_FIELD_TYPES["IP"] = "ip";
  OPENSEARCH_FIELD_TYPES["ATTACHMENT"] = "attachment";
  OPENSEARCH_FIELD_TYPES["TOKEN_COUNT"] = "token_count";
  OPENSEARCH_FIELD_TYPES["MURMUR3"] = "murmur3";
  OPENSEARCH_FIELD_TYPES["HISTOGRAM"] = "histogram";
  return OPENSEARCH_FIELD_TYPES;
}({});
/** @public **/
let OSD_FIELD_TYPES = exports.OSD_FIELD_TYPES = /*#__PURE__*/function (OSD_FIELD_TYPES) {
  OSD_FIELD_TYPES["_SOURCE"] = "_source";
  OSD_FIELD_TYPES["ATTACHMENT"] = "attachment";
  OSD_FIELD_TYPES["BOOLEAN"] = "boolean";
  OSD_FIELD_TYPES["DATE"] = "date";
  OSD_FIELD_TYPES["GEO_POINT"] = "geo_point";
  OSD_FIELD_TYPES["GEO_SHAPE"] = "geo_shape";
  OSD_FIELD_TYPES["IP"] = "ip";
  OSD_FIELD_TYPES["MURMUR3"] = "murmur3";
  OSD_FIELD_TYPES["NUMBER"] = "number";
  OSD_FIELD_TYPES["STRING"] = "string";
  OSD_FIELD_TYPES["UNKNOWN"] = "unknown";
  OSD_FIELD_TYPES["CONFLICT"] = "conflict";
  OSD_FIELD_TYPES["OBJECT"] = "object";
  OSD_FIELD_TYPES["NESTED"] = "nested";
  OSD_FIELD_TYPES["HISTOGRAM"] = "histogram";
  return OSD_FIELD_TYPES;
}({});