"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerSearchRoute = registerSearchRoute;
var _configSchema = require("@osd/config-schema");
var _lib = require("../../lib");
var _shim_hits_total = require("./shim_hits_total");
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

function registerSearchRoute(router, {
  getStartServices
}) {
  router.post({
    path: '/internal/search/{strategy}/{id?}',
    validate: {
      params: _configSchema.schema.object({
        strategy: _configSchema.schema.string(),
        id: _configSchema.schema.maybe(_configSchema.schema.string())
      }),
      query: _configSchema.schema.object({}, {
        unknowns: 'allow'
      }),
      body: _configSchema.schema.object({}, {
        unknowns: 'allow'
      })
    }
  }, async (context, request, res) => {
    const searchRequest = request.body;
    const {
      strategy,
      id
    } = request.params;
    const abortSignal = (0, _lib.getRequestAbortedSignal)(request.events.aborted$);
    const [,, selfStart] = await getStartServices();
    try {
      const {
        withLongNumeralsSupport,
        ...response
      } = await selfStart.search.search(context, {
        ...searchRequest,
        id,
        rawRequest: request
      }, {
        abortSignal,
        strategy
      });
      return res.ok({
        body: {
          ...response,
          ...{
            rawResponse: (0, _shim_hits_total.shimHitsTotal)(response.rawResponse)
          }
        },
        withLongNumeralsSupport
      });
    } catch (err) {
      var _err$body;
      return res.customError({
        statusCode: err.statusCode || 500,
        body: {
          message: err.message,
          attributes: {
            error: ((_err$body = err.body) === null || _err$body === void 0 ? void 0 : _err$body.error) || err.message
          }
        }
      });
    }
  });
  router.delete({
    path: '/internal/search/{strategy}/{id}',
    validate: {
      params: _configSchema.schema.object({
        strategy: _configSchema.schema.string(),
        id: _configSchema.schema.string()
      }),
      query: _configSchema.schema.object({}, {
        unknowns: 'allow'
      })
    }
  }, async (context, request, res) => {
    const {
      strategy,
      id
    } = request.params;
    const [,, selfStart] = await getStartServices();
    const searchStrategy = selfStart.search.getSearchStrategy(strategy);
    if (!searchStrategy.cancel) return res.ok();
    try {
      await searchStrategy.cancel(context, id);
      return res.ok();
    } catch (err) {
      return res.customError({
        statusCode: err.statusCode,
        body: {
          message: err.message,
          attributes: {
            error: err.body.error
          }
        }
      });
    }
  });
}