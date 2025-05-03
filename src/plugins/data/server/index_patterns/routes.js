"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerRoutes = registerRoutes;
var _configSchema = require("@osd/config-schema");
var _fetcher = require("./fetcher");
var _util = require("../../../data_source/common/util/");
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

function registerRoutes(http) {
  const parseMetaFields = metaFields => {
    let parsedFields = [];
    if (typeof metaFields === 'string') {
      parsedFields = JSON.parse(metaFields);
    } else {
      parsedFields = metaFields;
    }
    return parsedFields;
  };
  const router = http.createRouter();
  router.get({
    path: '/api/index_patterns/_fields_for_wildcard',
    validate: {
      query: _configSchema.schema.object({
        pattern: _configSchema.schema.string(),
        meta_fields: _configSchema.schema.oneOf([_configSchema.schema.string(), _configSchema.schema.arrayOf(_configSchema.schema.string())], {
          defaultValue: []
        }),
        data_source: _configSchema.schema.maybe(_configSchema.schema.string())
      })
    }
  }, async (context, request, response) => {
    const callAsCurrentUser = await (0, _util.decideLegacyClient)(context, request);
    const indexPatterns = new _fetcher.IndexPatternsFetcher(callAsCurrentUser);
    const {
      pattern,
      meta_fields: metaFields
    } = request.query;
    let parsedFields = [];
    try {
      parsedFields = parseMetaFields(metaFields);
    } catch (error) {
      return response.badRequest();
    }
    try {
      const fields = await indexPatterns.getFieldsForWildcard({
        pattern,
        metaFields: parsedFields
      });
      return response.ok({
        body: {
          fields
        },
        headers: {
          'content-type': 'application/json'
        }
      });
    } catch (error) {
      var _error$output, _error$output2;
      if (typeof error === 'object' && !!(error !== null && error !== void 0 && error.isBoom) && !!(error !== null && error !== void 0 && (_error$output = error.output) !== null && _error$output !== void 0 && _error$output.payload) && typeof (error === null || error === void 0 || (_error$output2 = error.output) === null || _error$output2 === void 0 ? void 0 : _error$output2.payload) === 'object') {
        var _error$output3;
        const payload = error === null || error === void 0 || (_error$output3 = error.output) === null || _error$output3 === void 0 ? void 0 : _error$output3.payload;
        return response.notFound({
          body: {
            message: payload.message,
            attributes: payload
          }
        });
      } else {
        return response.notFound();
      }
    }
  });
  router.get({
    path: '/api/index_patterns/_fields_for_time_pattern',
    validate: {
      query: _configSchema.schema.object({
        pattern: _configSchema.schema.string(),
        interval: _configSchema.schema.maybe(_configSchema.schema.string()),
        look_back: _configSchema.schema.number({
          min: 1
        }),
        meta_fields: _configSchema.schema.oneOf([_configSchema.schema.string(), _configSchema.schema.arrayOf(_configSchema.schema.string())], {
          defaultValue: []
        }),
        data_source: _configSchema.schema.maybe(_configSchema.schema.string())
      })
    }
  }, async (context, request, response) => {
    const callAsCurrentUser = await (0, _util.decideLegacyClient)(context, request);
    const indexPatterns = new _fetcher.IndexPatternsFetcher(callAsCurrentUser);
    const {
      pattern,
      interval,
      look_back: lookBack,
      meta_fields: metaFields
    } = request.query;
    let parsedFields = [];
    try {
      parsedFields = parseMetaFields(metaFields);
    } catch (error) {
      return response.badRequest();
    }
    try {
      const fields = await indexPatterns.getFieldsForTimePattern({
        pattern,
        interval: interval ? interval : '',
        lookBack,
        metaFields: parsedFields
      });
      return response.ok({
        body: {
          fields
        },
        headers: {
          'content-type': 'application/json'
        }
      });
    } catch (error) {
      return response.notFound();
    }
  });
}