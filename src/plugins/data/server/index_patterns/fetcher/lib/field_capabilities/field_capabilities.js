"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFieldCapabilities = getFieldCapabilities;
var _lodash = require("lodash");
var _opensearch_api = require("../opensearch_api");
var _field_caps_response = require("./field_caps_response");
var _overrides = require("./overrides");
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

/**
 *  Get the field capabilities for field in `indices`, excluding
 *  all internal/underscore-prefixed fields that are not in `metaFields`
 *
 *  @param  {Function} callCluster bound function for accessing an opensearch client
 *  @param  {Array}  [indices=[]]  the list of indexes to check
 *  @param  {Array}  [metaFields=[]] the list of internal fields to include
 *  @param  {Object} fieldCapsOptions
 *  @return {Promise<Array<FieldDescriptor>>}
 */
async function getFieldCapabilities(callCluster, indices = [], metaFields = [], fieldCapsOptions) {
  const opensearchFieldCaps = await (0, _opensearch_api.callFieldCapsApi)(callCluster, indices, fieldCapsOptions);
  const fieldsFromFieldCapsByName = (0, _lodash.keyBy)((0, _field_caps_response.readFieldCapsResponse)(opensearchFieldCaps), 'name');
  const allFieldsUnsorted = Object.keys(fieldsFromFieldCapsByName).filter(name => !name.startsWith('_')).concat(metaFields).reduce((agg, value) => {
    // This is intentionally using a "hash" and a "push" to be highly optimized with very large indexes
    if (agg.hash[value] != null) {
      return agg;
    } else {
      agg.hash[value] = value;
      agg.names.push(value);
      return agg;
    }
  }, {
    names: [],
    hash: {}
  }).names.map(name => (0, _lodash.defaults)({}, fieldsFromFieldCapsByName[name], {
    name,
    type: 'string',
    searchable: false,
    aggregatable: false,
    readFromDocValues: false
  })).map(_overrides.mergeOverrides);
  return (0, _lodash.sortBy)(allFieldsUnsorted, 'name');
}