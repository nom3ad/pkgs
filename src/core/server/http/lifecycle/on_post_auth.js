"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adoptToHapiOnPostAuthFormat = adoptToHapiOnPostAuthFormat;
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
  return ResultType;
}(ResultType || {});
const postAuthResult = {
  next() {
    return {
      type: ResultType.next
    };
  },
  isNext(result) {
    return result && result.type === ResultType.next;
  }
};

/**
 * @public
 * A tool set defining an outcome of OnPostAuth interceptor for incoming request.
 */

/**
 * See {@link OnPostAuthToolkit}.
 * @public
 */

const toolkit = {
  next: postAuthResult.next
};

/**
 * @public
 * Adopt custom request interceptor to Hapi lifecycle system.
 * @param fn - an extension point allowing to perform custom logic for
 * incoming HTTP requests.
 */
function adoptToHapiOnPostAuthFormat(fn, log) {
  return async function interceptRequest(request, responseToolkit) {
    const hapiResponseAdapter = new _router.HapiResponseAdapter(responseToolkit);
    try {
      const result = await fn(_router.OpenSearchDashboardsRequest.from(request), _router.lifecycleResponseFactory, toolkit);
      if (result instanceof _router.OpenSearchDashboardsResponse) {
        return hapiResponseAdapter.handle(result);
      }
      if (postAuthResult.isNext(result)) {
        return responseToolkit.continue;
      }
      throw new Error(`Unexpected result from OnPostAuth. Expected OnPostAuthResult or OpenSearchDashboardsResponse, but given: ${result}.`);
    } catch (error) {
      log.error(error);
      return hapiResponseAdapter.toInternalError();
    }
  };
}