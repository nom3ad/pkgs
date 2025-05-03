"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOpenSearchProxyConfig = void 0;
var _lodash = _interopRequireDefault(require("lodash"));
var _http = _interopRequireDefault(require("http"));
var _https = _interopRequireDefault(require("https"));
var _url = _interopRequireDefault(require("url"));
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

const createAgent = legacyConfig => {
  var _legacyConfig$ssl, _legacyConfig$ssl2, _legacyConfig$ssl3, _legacyConfig$ssl4;
  const target = _url.default.parse(_lodash.default.head(legacyConfig.hosts));
  if (!/^https/.test(target.protocol || '')) return new _http.default.Agent();
  const agentOptions = {};
  const verificationMode = legacyConfig.ssl && legacyConfig.ssl.verificationMode;
  switch (verificationMode) {
    case 'none':
      agentOptions.rejectUnauthorized = false;
      break;
    case 'certificate':
      agentOptions.rejectUnauthorized = true;

      // by default, NodeJS is checking the server identify
      agentOptions.checkServerIdentity = _lodash.default.noop;
      break;
    case 'full':
      agentOptions.rejectUnauthorized = true;
      break;
    default:
      throw new Error(`Unknown ssl verificationMode: ${verificationMode}`);
  }
  agentOptions.ca = (_legacyConfig$ssl = legacyConfig.ssl) === null || _legacyConfig$ssl === void 0 ? void 0 : _legacyConfig$ssl.certificateAuthorities;
  const ignoreCertAndKey = !((_legacyConfig$ssl2 = legacyConfig.ssl) !== null && _legacyConfig$ssl2 !== void 0 && _legacyConfig$ssl2.alwaysPresentCertificate);
  if (!ignoreCertAndKey && (_legacyConfig$ssl3 = legacyConfig.ssl) !== null && _legacyConfig$ssl3 !== void 0 && _legacyConfig$ssl3.certificate && (_legacyConfig$ssl4 = legacyConfig.ssl) !== null && _legacyConfig$ssl4 !== void 0 && _legacyConfig$ssl4.key) {
    agentOptions.cert = legacyConfig.ssl.certificate;
    agentOptions.key = legacyConfig.ssl.key;
    agentOptions.passphrase = legacyConfig.ssl.keyPassphrase;
  }
  return new _https.default.Agent(agentOptions);
};
const getOpenSearchProxyConfig = legacyConfig => {
  return {
    timeout: legacyConfig.requestTimeout.asMilliseconds(),
    agent: createAgent(legacyConfig)
  };
};
exports.getOpenSearchProxyConfig = getOpenSearchProxyConfig;