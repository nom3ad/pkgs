"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configureClient = void 0;
var _buffer = require("buffer");
var _querystring = require("querystring");
var _opensearch = require("@opensearch-project/opensearch");
var _opensearchNext = require("@opensearch-project/opensearch-next");
var _client_config = require("./client_config");
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

const configureClient = (config, {
  logger,
  scoped = false,
  withLongNumeralsSupport = false
}) => {
  const clientOptions = (0, _client_config.parseClientOptions)(config, scoped);
  const client = withLongNumeralsSupport ? new _opensearchNext.Client({
    ...clientOptions,
    enableLongNumeralSupport: true
  }) : new _opensearch.Client(clientOptions);
  addLogging(client, logger, config.logQueries);
  return client;
};
exports.configureClient = configureClient;
const addLogging = (client, logger, logQueries) => {
  client.on('response', (error, event) => {
    if (error) {
      var _event$body$error$typ, _event$body, _event$body$error$rea, _event$body2;
      const errorMessage =
      // error details for response errors provided by opensearch, defaults to error name/message
      `[${(_event$body$error$typ = (_event$body = event.body) === null || _event$body === void 0 || (_event$body = _event$body.error) === null || _event$body === void 0 ? void 0 : _event$body.type) !== null && _event$body$error$typ !== void 0 ? _event$body$error$typ : error.name}]: ${(_event$body$error$rea = (_event$body2 = event.body) === null || _event$body2 === void 0 || (_event$body2 = _event$body2.error) === null || _event$body2 === void 0 ? void 0 : _event$body2.reason) !== null && _event$body$error$rea !== void 0 ? _event$body$error$rea : error.message}`;
      logger.error(errorMessage);
    }
    if (event && logQueries) {
      const params = event.meta.request.params;

      // definition is wrong, `params.querystring` can be either a string or an object
      const querystring = convertQueryString(params.querystring);
      const url = `${params.path}${querystring ? `?${querystring}` : ''}`;
      const body = params.body ? `\n${ensureString(params.body)}` : '';
      logger.debug(`${event.statusCode}\n${params.method} ${url}${body}`, {
        tags: ['query']
      });
    }
  });
};
const convertQueryString = qs => {
  if (qs === undefined || typeof qs === 'string') {
    return qs !== null && qs !== void 0 ? qs : '';
  }
  return (0, _querystring.stringify)(qs);
};
function ensureString(body) {
  if (typeof body === 'string') return body;
  if (_buffer.Buffer.isBuffer(body)) return '[buffer]';
  if ('readable' in body && body.readable && typeof body._read === 'function') return '[stream]';
  return JSON.stringify(body);
}