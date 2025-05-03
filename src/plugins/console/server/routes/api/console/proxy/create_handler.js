"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createHandler = void 0;
var _lodash = require("lodash");
var _stream = require("stream");
var _std = require("@osd/std");
var _router = require("../../../../../../../core/server/http/router");
var _errors = require("../../../../../../../core/server/opensearch/client/errors");
var _utils = require("./utils");
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

// eslint-disable-next-line @osd/eslint/no-restricted-paths

// eslint-disable-next-line @osd/eslint/no-restricted-paths

function getProxyHeaders(req) {
  var _req$info, _req$info2;
  const headers = Object.create(null);

  // Scope this proto-unsafe functionality to where it is being used.
  function extendCommaList(obj, property, value) {
    obj[property] = (obj[property] ? obj[property] + ',' : '') + value;
  }
  const _req = (0, _router.ensureRawRequest)(req);
  if (_req !== null && _req !== void 0 && (_req$info = _req.info) !== null && _req$info !== void 0 && _req$info.remotePort && _req !== null && _req !== void 0 && (_req$info2 = _req.info) !== null && _req$info2 !== void 0 && _req$info2.remoteAddress) {
    // see https://git.io/vytQ7
    extendCommaList(headers, 'x-forwarded-for', _req.info.remoteAddress);
    extendCommaList(headers, 'x-forwarded-port', _req.info.remotePort);
    extendCommaList(headers, 'x-forwarded-proto', _req.server.info.protocol);
    extendCommaList(headers, 'x-forwarded-host', _req.info.host);
  }
  const contentType = req.headers['content-type'];
  if (contentType) {
    headers['content-type'] = contentType;
  }
  return headers;
}
function toUrlPath(path) {
  const FAKE_BASE = 'http://localhost';
  const urlWithFakeBase = new URL(`${FAKE_BASE}/${(0, _lodash.trimStart)(path, '/')}`);
  // Appending pretty here to have OpenSearch do the JSON formatting, as doing
  // in JS can lead to data loss (7.0 will get munged into 7, thus losing indication of
  // measurement precision)
  if (!urlWithFakeBase.searchParams.get('pretty')) {
    urlWithFakeBase.searchParams.append('pretty', 'true');
  }
  const urlPath = urlWithFakeBase.href.replace(urlWithFakeBase.origin, '');
  return urlPath;
}
const createHandler = ({
  log,
  proxy: {
    readLegacyOpenSearchConfig,
    pathFilters,
    proxyConfigCollection
  }
}) => async (ctx, request, response) => {
  const {
    body,
    query
  } = request;
  const {
    path,
    method,
    dataSourceId
  } = query;
  if (!pathFilters.some(re => re.test(path))) {
    return response.forbidden({
      body: `Error connecting to '${path}':\n\nUnable to send requests to that path.`,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
  try {
    const client = dataSourceId ? await ctx.dataSource.opensearch.getClient(dataSourceId) : ctx.core.opensearch.client.asCurrentUserWithLongNumeralsSupport;

    // TODO: proxy header will fail sigv4 auth type in data source, need create issue in opensearch-js repo to track
    const requestHeaders = dataSourceId ? {} : {
      ...getProxyHeaders(request)
    };
    const bufferedBody = await (0, _utils.buildBufferedBody)(body);
    const opensearchResponse = await client.transport.request({
      path: toUrlPath(path),
      method,
      body: bufferedBody
    }, {
      headers: requestHeaders
    });
    const {
      statusCode,
      body: responseContent,
      warnings,
      headers: responseHeaders
    } = opensearchResponse;
    if (method.toUpperCase() !== 'HEAD') {
      var _responseHeaders$cont, _responseHeaders$cont2;
      /* If a response is a parse JSON object, we need to use a custom `stringify` to handle BigInt
       * values.
       */
      const isJSONResponse = responseHeaders === null || responseHeaders === void 0 || (_responseHeaders$cont = responseHeaders['content-type']) === null || _responseHeaders$cont === void 0 || (_responseHeaders$cont2 = _responseHeaders$cont.includes) === null || _responseHeaders$cont2 === void 0 ? void 0 : _responseHeaders$cont2.call(_responseHeaders$cont, 'application/json');
      return response.custom({
        statusCode: statusCode,
        body: isJSONResponse ? (0, _std.stringify)(responseContent) : responseContent,
        headers: {
          warning: warnings || '',
          ...(isJSONResponse ? {
            'Content-Type': 'application/json; charset=utf-8'
          } : {})
        }
      });
    }
    return response.custom({
      statusCode: statusCode,
      body: `${statusCode} - ${responseContent}`,
      headers: {
        warning: warnings || '',
        'Content-Type': 'text/plain'
      }
    });
  } catch (e) {
    const isResponseErrorFlag = (0, _errors.isResponseError)(e);
    if (!isResponseErrorFlag) log.error(e);
    const errorMessage = isResponseErrorFlag ? (0, _std.stringify)(e.meta.body) : e.message;
    // core http route handler has special logic that asks for stream readable input to pass error opaquely
    const errorResponseBody = new _stream.Readable({
      read() {
        this.push(errorMessage);
        this.push(null);
      }
    });
    return response.customError({
      statusCode: e.statusCode || 502,
      body: errorResponseBody,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
exports.createHandler = createHandler;