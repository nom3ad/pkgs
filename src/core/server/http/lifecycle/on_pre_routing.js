"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adoptToHapiOnRequest = adoptToHapiOnRequest;
var _router = require("../router");
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
var ResultType = /*#__PURE__*/function (ResultType) {
  ResultType["next"] = "next";
  ResultType["rewriteUrl"] = "rewriteUrl";
  return ResultType;
}(ResultType || {});
const preRoutingResult = {
  next() {
    return {
      type: ResultType.next
    };
  },
  rewriteUrl(url) {
    return {
      type: ResultType.rewriteUrl,
      url
    };
  },
  isNext(result) {
    return result && result.type === ResultType.next;
  },
  isRewriteUrl(result) {
    return result && result.type === ResultType.rewriteUrl;
  }
};

/**
 * @public
 * A tool set defining an outcome of OnPreRouting interceptor for incoming request.
 */

const toolkit = {
  next: preRoutingResult.next,
  rewriteUrl: preRoutingResult.rewriteUrl
};

/**
 * See {@link OnPreRoutingToolkit}.
 * @public
 */

/**
 * @public
 * Adopt custom request interceptor to Hapi lifecycle system.
 * @param fn - an extension point allowing to perform custom logic for
 * incoming HTTP requests.
 */
function adoptToHapiOnRequest(fn, log) {
  return async function interceptPreRoutingRequest(request, responseToolkit) {
    const hapiResponseAdapter = new _router.HapiResponseAdapter(responseToolkit);
    try {
      const result = await fn(_router.OpenSearchDashboardsRequest.from(request), _router.lifecycleResponseFactory, toolkit);
      if (result instanceof _router.OpenSearchDashboardsResponse) {
        return hapiResponseAdapter.handle(result);
      }
      if (preRoutingResult.isNext(result)) {
        return responseToolkit.continue;
      }
      if (preRoutingResult.isRewriteUrl(result)) {
        const {
          url
        } = result;
        request.setUrl(url);
        // We should update raw request as well since it can be proxied to the old platform
        request.raw.req.url = url;
        return responseToolkit.continue;
      }
      throw new Error(`Unexpected result from OnPreRouting. Expected OnPreRoutingResult or OpenSearchDashboardsResponse, but given: ${result}.`);
    } catch (error) {
      log.error(error);
      return hapiResponseAdapter.toInternalError();
    }
  };
}