"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.concatDataSourceWithIndexPattern = void 0;
exports.findByTitle = findByTitle;
exports.validateDataSourceReference = exports.getIndexPatternTitle = exports.getDataSourceReference = void 0;
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
 * Returns an object matching a given title
 *
 * @param client {SavedObjectsClientCommon}
 * @param title {string}
 * @param dataSourceId {string}{optional}
 * @returns {Promise<SavedObject|undefined>}
 */
async function findByTitle(client, title, dataSourceId) {
  if (title) {
    const savedObjects = (await client.find({
      type: 'index-pattern',
      perPage: 10,
      search: `"${title}"`,
      searchFields: ['title'],
      fields: ['title']
    })).filter(obj => {
      return obj && obj.attributes && validateDataSourceReference(obj, dataSourceId);
    });
    return savedObjects.find(obj => obj.attributes.title.toLowerCase() === title.toLowerCase());
  }
}

// This is used to validate datasource reference of index pattern
const validateDataSourceReference = (indexPattern, dataSourceId) => {
  const references = indexPattern.references;
  if (dataSourceId) {
    return references.some(ref => ref.id === dataSourceId && ref.type === 'data-source');
  } else {
    // No datasource id passed as input meaning we are getting index pattern from default cluster,
    // and it's supposed to be an empty array
    return references.length === 0;
  }
};
exports.validateDataSourceReference = validateDataSourceReference;
const getIndexPatternTitle = async (indexPatternTitle, references, getDataSource) => {
  let dataSourceTitle;
  const dataSourceReference = getDataSourceReference(references);

  // If an index-pattern references datasource, prepend data source name with index pattern name for display purpose
  if (dataSourceReference) {
    const dataSourceId = dataSourceReference.id;
    try {
      const {
        attributes: {
          title
        },
        error
      } = await getDataSource(dataSourceId);
      dataSourceTitle = error ? dataSourceId : title;
    } catch (e) {
      // use datasource id as title when failing to fetch datasource
      dataSourceTitle = dataSourceId;
    }
    return concatDataSourceWithIndexPattern(dataSourceTitle, indexPatternTitle);
  } else {
    // if index pattern doesn't reference datasource, return as it is.
    return indexPatternTitle;
  }
};
exports.getIndexPatternTitle = getIndexPatternTitle;
const concatDataSourceWithIndexPattern = (dataSourceTitle, indexPatternTitle) => {
  const DATA_SOURCE_INDEX_PATTERN_DELIMITER = '::';
  return dataSourceTitle.concat(DATA_SOURCE_INDEX_PATTERN_DELIMITER).concat(indexPatternTitle);
};
exports.concatDataSourceWithIndexPattern = concatDataSourceWithIndexPattern;
const getDataSourceReference = references => {
  return references.find(ref => ref.type === 'data-source');
};
exports.getDataSourceReference = getDataSourceReference;