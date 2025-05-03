"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServerMetricsCollector = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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

class ServerMetricsCollector {
  constructor(server) {
    this.server = server;
    _defineProperty(this, "requests", {
      disconnects: 0,
      total: 0,
      statusCodes: {}
    });
    _defineProperty(this, "responseTimes", {
      count: 0,
      total: 0,
      max: 0
    });
    this.server.ext('onRequest', (request, h) => {
      this.requests.total++;
      request.events.once('disconnect', () => {
        this.requests.disconnects++;
      });
      return h.continue;
    });
    this.server.events.on('response', request => {
      var _request$response;
      const statusCode = (_request$response = request.response) === null || _request$response === void 0 ? void 0 : _request$response.statusCode;
      if (statusCode) {
        if (!this.requests.statusCodes[statusCode]) {
          this.requests.statusCodes[statusCode] = 0;
        }
        this.requests.statusCodes[statusCode]++;
      }
      const duration = Date.now() - request.info.received;
      this.responseTimes.count++;
      this.responseTimes.total += duration;
      this.responseTimes.max = Math.max(this.responseTimes.max, duration);
    });
  }
  async collect() {
    const connections = await new Promise(resolve => {
      this.server.listener.getConnections((_, count) => {
        resolve(count);
      });
    });
    return {
      requests: this.requests,
      response_times: {
        avg_in_millis: this.responseTimes.total / Math.max(this.responseTimes.count, 1),
        max_in_millis: this.responseTimes.max
      },
      concurrent_connections: connections
    };
  }
  reset() {
    this.requests = {
      disconnects: 0,
      total: 0,
      statusCodes: {}
    };
    this.responseTimes = {
      count: 0,
      total: 0,
      max: 0
    };
  }
}
exports.ServerMetricsCollector = ServerMetricsCollector;