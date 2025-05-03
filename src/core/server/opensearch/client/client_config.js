"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseClientOptions = parseClientOptions;
var _url = require("url");
var _default_headers = require("../default_headers");
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
 * Configuration options to be used to create a {@link IClusterClient | cluster client} using the
 * {@link OpenSearchServiceStart.createClient | createClient API}
 *
 * @public
 */

/**
 * Parse the client options from given client config and `scoped` flag.
 *
 * @param config The config to generate the client options from.
 * @param scoped if true, will adapt the configuration to be used by a scoped client
 *        (will remove basic auth and ssl certificates)
 */
function parseClientOptions(config, scoped) {
  const clientOptions = {
    sniffOnStart: config.sniffOnStart,
    sniffOnConnectionFault: config.sniffOnConnectionFault,
    headers: {
      ..._default_headers.DEFAULT_HEADERS,
      ...config.customHeaders
    }
  };
  if (config.memoryCircuitBreaker != null) {
    clientOptions.memoryCircuitBreaker = config.memoryCircuitBreaker;
  }
  if (config.pingTimeout != null) {
    clientOptions.pingTimeout = getDurationAsMs(config.pingTimeout);
  }
  if (config.requestTimeout != null) {
    clientOptions.requestTimeout = getDurationAsMs(config.requestTimeout);
  }
  if (config.sniffInterval != null) {
    clientOptions.sniffInterval = typeof config.sniffInterval === 'boolean' ? config.sniffInterval : getDurationAsMs(config.sniffInterval);
  }
  if (config.keepAlive) {
    clientOptions.agent = {
      keepAlive: config.keepAlive
    };
  }
  if (config.username && config.password && !scoped) {
    clientOptions.auth = {
      username: config.username,
      password: config.password
    };
  }
  clientOptions.nodes = config.hosts.map(host => convertHost(host));
  if (config.ssl) {
    clientOptions.ssl = generateSslConfig(config.ssl, scoped && !config.ssl.alwaysPresentCertificate);
  }
  if (config.disablePrototypePoisoningProtection != null) {
    clientOptions.disablePrototypePoisoningProtection = config.disablePrototypePoisoningProtection;
  }
  return clientOptions;
}
const generateSslConfig = (sslConfig, ignoreCertAndKey) => {
  const ssl = {
    ca: sslConfig.certificateAuthorities
  };
  const verificationMode = sslConfig.verificationMode;
  switch (verificationMode) {
    case 'none':
      ssl.rejectUnauthorized = false;
      break;
    case 'certificate':
      ssl.rejectUnauthorized = true;
      // by default, NodeJS is checking the server identify
      ssl.checkServerIdentity = () => undefined;
      break;
    case 'full':
      ssl.rejectUnauthorized = true;
      break;
    default:
      throw new Error(`Unknown ssl verificationMode: ${verificationMode}`);
  }

  // Add client certificate and key if required by opensearch
  if (!ignoreCertAndKey && sslConfig.certificate && sslConfig.key) {
    ssl.cert = sslConfig.certificate;
    ssl.key = sslConfig.key;
    ssl.passphrase = sslConfig.keyPassphrase;
  }
  return ssl;
};
const convertHost = host => {
  const url = new _url.URL(host);
  const isHTTPS = url.protocol === 'https:';
  url.port = url.port || (isHTTPS ? '443' : '80');
  return {
    url
  };
};
const getDurationAsMs = duration => typeof duration === 'number' ? duration : duration.asMilliseconds();