"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proxyRequest = void 0;
var _http = _interopRequireDefault(require("http"));
var _https = _interopRequireDefault(require("https"));
var _boom = _interopRequireDefault(require("@hapi/boom"));
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

/**
 * Node http request library does not expect there to be trailing "[" or "]"
 * characters in ipv6 host names.
 */
const sanitizeHostname = hostName => hostName.trim().replace(/^\[/, '').replace(/\]$/, '');

// We use a modified version of Hapi's Wreck because Hapi, Axios, and Superagent don't support GET requests
// with bodies, but OpenSearch APIs do. Similarly with DELETE requests with bodies. Another library, `request`
// diverged too much from current behaviour.
const proxyRequest = ({
  method,
  headers,
  agent,
  uri,
  timeout,
  payload,
  rejectUnauthorized
}) => {
  const {
    hostname,
    port,
    protocol,
    pathname,
    search
  } = uri;
  const client = uri.protocol === 'https:' ? _https.default : _http.default;
  let resolved = false;
  let resolve;
  let reject;
  const reqPromise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const finalUserHeaders = {
    ...headers
  };
  const hasHostHeader = Object.keys(finalUserHeaders).some(key => key.toLowerCase() === 'host');
  if (!hasHostHeader) {
    finalUserHeaders.host = hostname;
  }
  const req = client.request({
    method: method.toUpperCase(),
    // We support overriding this on a per request basis to support legacy proxy config. See ./proxy_config.
    rejectUnauthorized: typeof rejectUnauthorized === 'boolean' ? rejectUnauthorized : undefined,
    host: sanitizeHostname(hostname),
    port: port === '' ? undefined : parseInt(port, 10),
    protocol,
    path: `${pathname}${search || ''}`,
    headers: {
      ...finalUserHeaders,
      'content-type': 'application/json',
      'transfer-encoding': 'chunked'
    },
    agent
  });
  req.once('response', res => {
    resolved = true;
    resolve(res);
  });
  req.once('socket', socket => {
    if (!socket.connecting) {
      payload.pipe(req);
    } else {
      socket.once('connect', () => {
        payload.pipe(req);
      });
    }
  });
  const onError = e => reject(e);
  req.once('error', onError);
  const timeoutPromise = new Promise((timeoutResolve, timeoutReject) => {
    setTimeout(() => {
      if (!req.aborted && !req.socket) req.abort();
      if (!resolved) {
        timeoutReject(_boom.default.gatewayTimeout('Client request timeout'));
      } else {
        timeoutResolve('Success');
      }
    }, timeout);
  });
  return Promise.race([reqPromise, timeoutPromise]);
};
exports.proxyRequest = proxyRequest;