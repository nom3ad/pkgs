"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerValueSuggestionsRoute = registerValueSuggestionsRoute;
var _lodash = require("lodash");
var _configSchema = require("@osd/config-schema");
var _operators = require("rxjs/operators");
var _index_patterns = require("../index_patterns");
var _lib = require("../lib");
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

function registerValueSuggestionsRoute(router, config$) {
  router.post({
    path: '/api/opensearch-dashboards/suggestions/values/{index}',
    validate: {
      params: _configSchema.schema.object({
        index: _configSchema.schema.string()
      }, {
        unknowns: 'allow'
      }),
      body: _configSchema.schema.object({
        field: _configSchema.schema.string(),
        query: _configSchema.schema.string(),
        boolFilter: _configSchema.schema.maybe(_configSchema.schema.any())
      }, {
        unknowns: 'allow'
      })
    }
  }, async (context, request, response) => {
    const config = await config$.pipe((0, _operators.first)()).toPromise();
    const {
      field: fieldName,
      query,
      boolFilter
    } = request.body;
    const {
      index
    } = request.params;
    const {
      client
    } = context.core.opensearch.legacy;
    const signal = (0, _lib.getRequestAbortedSignal)(request.events.aborted$);
    const autocompleteSearchOptions = {
      timeout: `${config.opensearchDashboards.autocompleteTimeout.asMilliseconds()}ms`,
      terminate_after: config.opensearchDashboards.autocompleteTerminateAfter.asMilliseconds()
    };
    const indexPattern = await (0, _index_patterns.findIndexPatternById)(context.core.savedObjects.client, index);
    const field = indexPattern && (0, _index_patterns.getFieldByName)(fieldName, indexPattern);
    const body = await getBody(autocompleteSearchOptions, field || fieldName, query, boolFilter);
    try {
      const result = await client.callAsCurrentUser('search', {
        index,
        body
      }, {
        signal
      });
      const buckets = (0, _lodash.get)(result, 'aggregations.suggestions.buckets') || (0, _lodash.get)(result, 'aggregations.nestedSuggestions.suggestions.buckets');
      return response.ok({
        body: (0, _lodash.map)(buckets || [], 'key')
      });
    } catch (error) {
      return response.internalError({
        body: error
      });
    }
  });
}
async function getBody(
// eslint-disable-next-line @typescript-eslint/naming-convention
{
  timeout,
  terminate_after
}, field, query, boolFilter = []) {
  const isFieldObject = f => Boolean(f && f.name);

  // See https://opensearch.org/docs/latest/opensearch/query-dsl/term/#regex
  const getEscapedQuery = (q = '') => q.replace(/[.?+*|{}[\]()"\\#@&<>~]/g, match => `\\${match}`);

  // Helps ensure that the regex is not evaluated eagerly against the terms dictionary
  const executionHint = 'map';

  // We don't care about the accuracy of the counts, just the content of the terms, so this reduces
  // the amount of information that needs to be transmitted to the coordinating node
  const shardSize = 10;
  const body = {
    size: 0,
    timeout,
    terminate_after,
    query: {
      bool: {
        filter: boolFilter
      }
    },
    aggs: {
      suggestions: {
        terms: {
          field: isFieldObject(field) ? field.name : field,
          include: `${getEscapedQuery(query)}.*`,
          execution_hint: executionHint,
          shard_size: shardSize
        }
      }
    }
  };
  if (isFieldObject(field) && field.subType && field.subType.nested) {
    return {
      ...body,
      aggs: {
        nestedSuggestions: {
          nested: {
            path: field.subType.nested.path
          },
          aggs: body.aggs
        }
      }
    };
  }
  return body;
}