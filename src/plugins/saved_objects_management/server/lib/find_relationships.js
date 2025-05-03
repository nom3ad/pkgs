"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findRelationships = findRelationships;
var _inject_meta_attributes = require("./inject_meta_attributes");
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

async function findRelationships({
  type,
  id,
  size,
  client,
  referenceTypes,
  savedObjectsManagement
}) {
  const {
    references = []
  } = await client.get(type, id);

  // Use a map to avoid duplicates, it does happen but have a different "name" in the reference
  const referencedToBulkGetOpts = new Map(references.map(ref => [`${ref.type}:${ref.id}`, {
    id: ref.id,
    type: ref.type
  }]));
  const [childReferencesResponse, parentReferencesResponse] = await Promise.all([referencedToBulkGetOpts.size > 0 ? client.bulkGet([...referencedToBulkGetOpts.values()]) : Promise.resolve({
    saved_objects: []
  }), client.find({
    hasReference: {
      type,
      id
    },
    perPage: size,
    type: referenceTypes
  })]);
  return childReferencesResponse.saved_objects.map(obj => (0, _inject_meta_attributes.injectMetaAttributes)(obj, savedObjectsManagement)).map(extractCommonProperties).map(obj => ({
    ...obj,
    relationship: 'child'
  })).concat(parentReferencesResponse.saved_objects.map(obj => (0, _inject_meta_attributes.injectMetaAttributes)(obj, savedObjectsManagement)).map(extractCommonProperties).map(obj => ({
    ...obj,
    relationship: 'parent'
  })));
}
function extractCommonProperties(savedObject) {
  return {
    id: savedObject.id,
    type: savedObject.type,
    meta: savedObject.meta,
    workspaces: savedObject.workspaces
  };
}