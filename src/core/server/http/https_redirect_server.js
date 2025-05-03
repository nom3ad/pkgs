"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HttpsRedirectServer = void 0;
var _url = require("url");
var _http_tools = require("./http_tools");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */ /*
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
class HttpsRedirectServer {
  constructor(log) {
    this.log = log;
    _defineProperty(this, "server", void 0);
  }
  async start(config) {
    this.log.debug('starting http --> https redirect server');
    if (!config.ssl.enabled || config.ssl.redirectHttpFromPort === undefined) {
      throw new Error('Redirect server cannot be started when [ssl.enabled] is set to `false`' + ' or [ssl.redirectHttpFromPort] is not specified.');
    }

    // Redirect server is configured in the same way as any other HTTP server
    // within the platform with the only exception that it should always be a
    // plain HTTP server, so we just ignore `tls` part of options.
    this.server = (0, _http_tools.createServer)({
      ...(0, _http_tools.getServerOptions)(config, {
        configureTLS: false
      }),
      port: config.ssl.redirectHttpFromPort
    }, (0, _http_tools.getListenerOptions)(config));
    this.server.ext('onRequest', (request, responseToolkit) => {
      return responseToolkit.redirect((0, _url.format)({
        hostname: config.host,
        pathname: request.url.pathname,
        port: config.port,
        protocol: 'https',
        search: request.url.search
      })).takeover();
    });
    try {
      await this.server.start();
      this.log.debug(`http --> https redirect server running at ${this.server.info.uri}`);
    } catch (err) {
      if (err.code === 'EADDRINUSE') {
        throw new Error('The redirect server failed to start up because port ' + `${config.ssl.redirectHttpFromPort} is already in use. Ensure the port specified ` + 'in `server.ssl.redirectHttpFromPort` is available.');
      } else {
        throw err;
      }
    }
  }
  async stop() {
    if (this.server === undefined) {
      return;
    }
    this.log.debug('stopping http --> https redirect server');
    await this.server.stop();
    this.server = undefined;
  }
}
exports.HttpsRedirectServer = HttpsRedirectServer;