"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shortUrlLookupProvider = shortUrlLookupProvider;
var _crypto = _interopRequireDefault(require("crypto"));
var _lodash = require("lodash");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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

function shortUrlLookupProvider({
  logger
}) {
  async function updateMetadata(doc, {
    savedObjects
  }) {
    try {
      await savedObjects.update('url', doc.id, {
        accessDate: new Date().valueOf(),
        accessCount: (0, _lodash.get)(doc, 'attributes.accessCount', 0) + 1
      });
    } catch (error) {
      logger.warn('Warning: Error updating url metadata');
      logger.warn(error);
      // swallow errors. It isn't critical if there is no update.
    }
  }

  return {
    async generateUrlId(url, {
      savedObjects
    }) {
      const id = _crypto.default.createHash('md5').update(url).digest('hex');
      const {
        isConflictError
      } = savedObjects.errors;
      try {
        const doc = await savedObjects.create('url', {
          url,
          accessCount: 0,
          createDate: new Date().valueOf(),
          accessDate: new Date().valueOf()
        }, {
          id
        });
        return doc.id;
      } catch (error) {
        if (isConflictError(error)) {
          return id;
        }
        throw error;
      }
    },
    async getUrl(id, {
      savedObjects
    }) {
      const doc = await savedObjects.get('url', id);
      updateMetadata(doc, {
        savedObjects
      });
      return doc.attributes.url;
    }
  };
}