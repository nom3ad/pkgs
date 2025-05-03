"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createOsdFieldTypes = exports.OsdFieldTypeUnknown = void 0;
var _osd_field_type = require("./osd_field_type");
var _types = require("./types");
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

const OsdFieldTypeUnknown = exports.OsdFieldTypeUnknown = new _osd_field_type.OsdFieldType({
  name: _types.OSD_FIELD_TYPES.UNKNOWN
});
const createOsdFieldTypes = () => [new _osd_field_type.OsdFieldType({
  name: _types.OSD_FIELD_TYPES.STRING,
  sortable: true,
  filterable: true,
  esTypes: [_types.OPENSEARCH_FIELD_TYPES.STRING, _types.OPENSEARCH_FIELD_TYPES.TEXT, _types.OPENSEARCH_FIELD_TYPES.KEYWORD, _types.OPENSEARCH_FIELD_TYPES._TYPE, _types.OPENSEARCH_FIELD_TYPES._ID]
}), new _osd_field_type.OsdFieldType({
  name: _types.OSD_FIELD_TYPES.NUMBER,
  sortable: true,
  filterable: true,
  esTypes: [_types.OPENSEARCH_FIELD_TYPES.FLOAT, _types.OPENSEARCH_FIELD_TYPES.HALF_FLOAT, _types.OPENSEARCH_FIELD_TYPES.SCALED_FLOAT, _types.OPENSEARCH_FIELD_TYPES.DOUBLE, _types.OPENSEARCH_FIELD_TYPES.INTEGER, _types.OPENSEARCH_FIELD_TYPES.LONG, _types.OPENSEARCH_FIELD_TYPES.UNSIGNED_LONG, _types.OPENSEARCH_FIELD_TYPES.SHORT, _types.OPENSEARCH_FIELD_TYPES.BYTE, _types.OPENSEARCH_FIELD_TYPES.TOKEN_COUNT]
}), new _osd_field_type.OsdFieldType({
  name: _types.OSD_FIELD_TYPES.DATE,
  sortable: true,
  filterable: true,
  esTypes: [_types.OPENSEARCH_FIELD_TYPES.DATE, _types.OPENSEARCH_FIELD_TYPES.DATE_NANOS]
}), new _osd_field_type.OsdFieldType({
  name: _types.OSD_FIELD_TYPES.IP,
  sortable: true,
  filterable: true,
  esTypes: [_types.OPENSEARCH_FIELD_TYPES.IP]
}), new _osd_field_type.OsdFieldType({
  name: _types.OSD_FIELD_TYPES.BOOLEAN,
  sortable: true,
  filterable: true,
  esTypes: [_types.OPENSEARCH_FIELD_TYPES.BOOLEAN]
}), new _osd_field_type.OsdFieldType({
  name: _types.OSD_FIELD_TYPES.OBJECT,
  esTypes: [_types.OPENSEARCH_FIELD_TYPES.OBJECT]
}), new _osd_field_type.OsdFieldType({
  name: _types.OSD_FIELD_TYPES.NESTED,
  esTypes: [_types.OPENSEARCH_FIELD_TYPES.NESTED]
}), new _osd_field_type.OsdFieldType({
  name: _types.OSD_FIELD_TYPES.GEO_POINT,
  esTypes: [_types.OPENSEARCH_FIELD_TYPES.GEO_POINT]
}), new _osd_field_type.OsdFieldType({
  name: _types.OSD_FIELD_TYPES.GEO_SHAPE,
  esTypes: [_types.OPENSEARCH_FIELD_TYPES.GEO_SHAPE]
}), new _osd_field_type.OsdFieldType({
  name: _types.OSD_FIELD_TYPES.ATTACHMENT,
  esTypes: [_types.OPENSEARCH_FIELD_TYPES.ATTACHMENT]
}), new _osd_field_type.OsdFieldType({
  name: _types.OSD_FIELD_TYPES.MURMUR3,
  esTypes: [_types.OPENSEARCH_FIELD_TYPES.MURMUR3]
}), new _osd_field_type.OsdFieldType({
  name: _types.OSD_FIELD_TYPES._SOURCE,
  esTypes: [_types.OPENSEARCH_FIELD_TYPES._SOURCE]
}), new _osd_field_type.OsdFieldType({
  name: _types.OSD_FIELD_TYPES.HISTOGRAM,
  filterable: true,
  esTypes: [_types.OPENSEARCH_FIELD_TYPES.HISTOGRAM]
}), new _osd_field_type.OsdFieldType({
  name: _types.OSD_FIELD_TYPES.CONFLICT
}), OsdFieldTypeUnknown];
exports.createOsdFieldTypes = createOsdFieldTypes;