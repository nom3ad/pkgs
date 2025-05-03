"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setOsdFieldOverrides = exports.getOsdTypeNames = exports.getOsdFieldType = exports.getOsdFieldOverrides = exports.getFilterableOsdTypeNames = exports.castOpenSearchToOsdFieldTypeName = void 0;
var _osd_field_types_factory = require("./osd_field_types_factory");
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

/** @private */
const registeredOsdTypes = (0, _osd_field_types_factory.createOsdFieldTypes)();
let osdFieldOverrides = {};

/**
 *  Get a type object by name
 *
 *  @param  {string} typeName
 *  @return {OsdFieldType}
 */
const getOsdFieldType = typeName => registeredOsdTypes.find(t => t.name === typeName) || _osd_field_types_factory.OsdFieldTypeUnknown;

/**
 *  Get the esTypes known by all osdFieldTypes
 *
 *  @return {Array<string>}
 */
exports.getOsdFieldType = getOsdFieldType;
const getOsdTypeNames = () => registeredOsdTypes.filter(type => type.name).map(type => type.name);

/**
 *  Get the OsdFieldType name for an opensearchType string
 *
 *  @param {string} opensearchType
 *  @return {string}
 */
exports.getOsdTypeNames = getOsdTypeNames;
const castOpenSearchToOsdFieldTypeName = opensearchType => {
  const type = registeredOsdTypes.find(t => t.esTypes.includes(opensearchType));
  return type && type.name ? type.name : _types.OSD_FIELD_TYPES.UNKNOWN;
};

/**
 *  Get filterable osdFieldTypes
 *
 *  @return {Array<string>}
 */
exports.castOpenSearchToOsdFieldTypeName = castOpenSearchToOsdFieldTypeName;
const getFilterableOsdTypeNames = () => registeredOsdTypes.filter(type => type.filterable).map(type => type.name);
exports.getFilterableOsdTypeNames = getFilterableOsdTypeNames;
const setOsdFieldOverrides = newOverrides => {
  osdFieldOverrides = newOverrides ? Object.assign({}, osdFieldOverrides, newOverrides) : {};
};
exports.setOsdFieldOverrides = setOsdFieldOverrides;
const getOsdFieldOverrides = () => {
  return osdFieldOverrides;
};
exports.getOsdFieldOverrides = getOsdFieldOverrides;