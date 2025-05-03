"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProxyConfig = void 0;
var _lodash = require("lodash");
var _url = require("url");
var _https = require("https");
var _wildcard_matcher = require("./wildcard_matcher");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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
class ProxyConfig {
  constructor(config) {
    // @ts-ignore
    _defineProperty(this, "id", void 0);
    _defineProperty(this, "matchers", void 0);
    _defineProperty(this, "timeout", void 0);
    _defineProperty(this, "sslAgent", void 0);
    _defineProperty(this, "verifySsl", void 0);
    config = {
      ...config
    };

    // -----
    // read "match" info
    // -----
    const rawMatches = {
      ...config.match
    };
    this.id = (0, _url.format)({
      protocol: rawMatches.protocol,
      hostname: rawMatches.host,
      port: rawMatches.port,
      pathname: rawMatches.path
    }) || '*';
    this.matchers = {
      protocol: new _wildcard_matcher.WildcardMatcher(rawMatches.protocol),
      host: new _wildcard_matcher.WildcardMatcher(rawMatches.host),
      port: new _wildcard_matcher.WildcardMatcher(rawMatches.port),
      path: new _wildcard_matcher.WildcardMatcher(rawMatches.path, '/')
    };

    // -----
    // read config vars
    // -----
    this.timeout = config.timeout;
    this.sslAgent = this._makeSslAgent(config);
  }
  _makeSslAgent(config) {
    const ssl = config.ssl || {};
    this.verifySsl = ssl.verify;
    const sslAgentOpts = {
      ca: ssl.ca,
      cert: ssl.cert,
      key: ssl.key
    };
    if ((0, _lodash.values)(sslAgentOpts).filter(Boolean).length) {
      sslAgentOpts.rejectUnauthorized = this.verifySsl == null ? true : this.verifySsl;
      return new _https.Agent(sslAgentOpts);
    }
  }
  getForParsedUri({
    protocol,
    hostname,
    port,
    pathname
  }) {
    let match = this.matchers.protocol.match(protocol.slice(0, -1));
    match = match && this.matchers.host.match(hostname);
    match = match && this.matchers.port.match(port);
    match = match && this.matchers.path.match(pathname);
    if (!match) return {};
    return {
      timeout: this.timeout,
      rejectUnauthorized: this.sslAgent ? undefined : this.verifySsl,
      agent: protocol === 'https:' ? this.sslAgent : undefined
    };
  }
}
exports.ProxyConfig = ProxyConfig;