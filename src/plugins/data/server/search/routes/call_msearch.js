"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertRequestBody = convertRequestBody;
exports.getCallMsearch = getCallMsearch;
var _operators = require("rxjs/operators");
var _shim_hits_total = require("./shim_hits_total");
var _ = require("..");
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

/** @internal */
function convertRequestBody(requestBody, {
  timeout
}) {
  return requestBody.searches.reduce((req, curr) => {
    const header = JSON.stringify({
      ignore_unavailable: true,
      ...curr.header
    });
    const body = JSON.stringify({
      timeout,
      ...curr.body
    });
    return `${req}${header}\n${body}\n`;
  }, '');
}
/**
 * Helper for the `/internal/_msearch` route, exported separately here
 * so that it can be reused elsewhere in the data plugin on the server,
 * e.g. SearchSource
 *
 * @internal
 */
function getCallMsearch(dependencies) {
  return async params => {
    var _response$body$respon;
    const {
      opensearchClient,
      globalConfig$,
      uiSettings
    } = dependencies;

    // get shardTimeout
    const config = await globalConfig$.pipe((0, _operators.first)()).toPromise();
    const timeout = (0, _.getShardTimeout)(config);

    // trackTotalHits and dataFrameHydrationStrategy is not supported by msearch
    const {
      trackTotalHits,
      dataFrameHydrationStrategy,
      ...defaultParams
    } = await (0, _.getDefaultSearchParams)(uiSettings);
    const body = convertRequestBody(params.body, timeout);
    const promise = (0, _.shimAbortSignal)(opensearchClient.asCurrentUser.msearch({
      body
    }, {
      querystring: (0, _.toSnakeCase)(defaultParams)
    }), params.signal);
    const response = await promise;
    return {
      body: {
        ...response,
        body: {
          responses: (_response$body$respon = response.body.responses) === null || _response$body$respon === void 0 ? void 0 : _response$body$respon.map(r => (0, _shim_hits_total.shimHitsTotal)(r))
        }
      }
    };
  };
}