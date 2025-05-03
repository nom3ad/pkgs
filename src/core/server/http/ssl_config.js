"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sslSchema = exports.SslConfig = void 0;
var _configSchema = require("@osd/config-schema");
var _crypto = _interopRequireDefault(require("crypto"));
var _fs = require("fs");
var _utils = require("../utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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
// `crypto` type definitions doesn't currently include `crypto.constants`, see
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/fa5baf1733f49cf26228a4e509914572c1b74adf/types/node/v6/index.d.ts#L3412
const cryptoConstants = _crypto.default.constants;
const protocolMap = new Map([['TLSv1', cryptoConstants.SSL_OP_NO_TLSv1], ['TLSv1.1', cryptoConstants.SSL_OP_NO_TLSv1_1], ['TLSv1.2', cryptoConstants.SSL_OP_NO_TLSv1_2], ['TLSv1.3', cryptoConstants.SSL_OP_NO_TLSv1_3]]);
const sslSchema = exports.sslSchema = _configSchema.schema.object({
  certificate: _configSchema.schema.maybe(_configSchema.schema.string()),
  certificateAuthorities: _configSchema.schema.maybe(_configSchema.schema.oneOf([_configSchema.schema.arrayOf(_configSchema.schema.string()), _configSchema.schema.string()])),
  cipherSuites: _configSchema.schema.arrayOf(_configSchema.schema.string(), {
    defaultValue: cryptoConstants.defaultCoreCipherList.split(':')
  }),
  enabled: _configSchema.schema.boolean({
    defaultValue: false
  }),
  key: _configSchema.schema.maybe(_configSchema.schema.string()),
  keyPassphrase: _configSchema.schema.maybe(_configSchema.schema.string()),
  keystore: _configSchema.schema.object({
    path: _configSchema.schema.maybe(_configSchema.schema.string()),
    password: _configSchema.schema.maybe(_configSchema.schema.string())
  }),
  truststore: _configSchema.schema.object({
    path: _configSchema.schema.maybe(_configSchema.schema.string()),
    password: _configSchema.schema.maybe(_configSchema.schema.string())
  }),
  redirectHttpFromPort: _configSchema.schema.maybe(_configSchema.schema.number()),
  supportedProtocols: _configSchema.schema.arrayOf(_configSchema.schema.oneOf([_configSchema.schema.literal('TLSv1'), _configSchema.schema.literal('TLSv1.1'), _configSchema.schema.literal('TLSv1.2'), _configSchema.schema.literal('TLSv1.3')]), {
    defaultValue: ['TLSv1.1', 'TLSv1.2', 'TLSv1.3'],
    minSize: 1
  }),
  clientAuthentication: _configSchema.schema.oneOf([_configSchema.schema.literal('none'), _configSchema.schema.literal('optional'), _configSchema.schema.literal('required')], {
    defaultValue: 'none'
  })
}, {
  validate: ssl => {
    if (ssl.key && ssl.keystore.path) {
      return 'cannot use [key] when [keystore.path] is specified';
    }
    if (ssl.certificate && ssl.keystore.path) {
      return 'cannot use [certificate] when [keystore.path] is specified';
    }
    if (ssl.enabled && (!ssl.key || !ssl.certificate) && !ssl.keystore.path) {
      return 'must specify [certificate] and [key] -- or [keystore.path] -- when ssl is enabled';
    }
    if (!ssl.enabled && ssl.clientAuthentication !== 'none') {
      return 'must enable ssl to use [clientAuthentication]';
    }
  }
});
class SslConfig {
  /**
   * @internal
   */
  constructor(config) {
    var _config$keystore, _config$truststore;
    _defineProperty(this, "enabled", void 0);
    _defineProperty(this, "redirectHttpFromPort", void 0);
    _defineProperty(this, "key", void 0);
    _defineProperty(this, "certificate", void 0);
    _defineProperty(this, "certificateAuthorities", void 0);
    _defineProperty(this, "keyPassphrase", void 0);
    _defineProperty(this, "requestCert", void 0);
    _defineProperty(this, "rejectUnauthorized", void 0);
    _defineProperty(this, "cipherSuites", void 0);
    _defineProperty(this, "supportedProtocols", void 0);
    this.enabled = config.enabled;
    this.redirectHttpFromPort = config.redirectHttpFromPort;
    this.cipherSuites = config.cipherSuites;
    this.supportedProtocols = config.supportedProtocols;
    this.requestCert = config.clientAuthentication !== 'none';
    this.rejectUnauthorized = config.clientAuthentication === 'required';
    const addCAs = ca => {
      if (ca && ca.length) {
        this.certificateAuthorities = [...(this.certificateAuthorities || []), ...ca];
      }
    };
    if ((_config$keystore = config.keystore) !== null && _config$keystore !== void 0 && _config$keystore.path) {
      const {
        key,
        cert,
        ca
      } = (0, _utils.readPkcs12Keystore)(config.keystore.path, config.keystore.password);
      if (!key) {
        throw new Error(`Did not find private key in keystore at [keystore.path].`);
      } else if (!cert) {
        throw new Error(`Did not find certificate in keystore at [keystore.path].`);
      }
      this.key = key;
      this.certificate = cert;
      addCAs(ca);
    } else if (config.key && config.certificate) {
      this.key = readFile(config.key);
      this.keyPassphrase = config.keyPassphrase;
      this.certificate = readFile(config.certificate);
    }
    if ((_config$truststore = config.truststore) !== null && _config$truststore !== void 0 && _config$truststore.path) {
      const ca = (0, _utils.readPkcs12Truststore)(config.truststore.path, config.truststore.password);
      addCAs(ca);
    }
    const ca = config.certificateAuthorities;
    if (ca) {
      const parsed = [];
      const paths = Array.isArray(ca) ? ca : [ca];
      if (paths.length > 0) {
        for (const path of paths) {
          parsed.push(readFile(path));
        }
        addCAs(parsed);
      }
    }
  }

  /**
   * Options that affect the OpenSSL protocol behavior via numeric bitmask of the SSL_OP_* options from OpenSSL Options.
   */
  getSecureOptions() {
    // our validation should ensure that this.supportedProtocols is at least an empty array,
    // which the following logic depends upon.
    if (this.supportedProtocols == null || this.supportedProtocols.length === 0) {
      throw new Error(`supportedProtocols should be specified`);
    }
    const supportedProtocols = this.supportedProtocols;
    return Array.from(protocolMap).reduce((secureOptions, [protocolAlias, secureOption]) => {
      // `secureOption` is the option that turns *off* support for a particular protocol,
      // so if protocol is supported, we should not enable this option.
      return supportedProtocols.includes(protocolAlias) ? secureOptions : secureOptions | secureOption; // eslint-disable-line no-bitwise
    }, 0);
  }
}
exports.SslConfig = SslConfig;
const readFile = file => {
  return (0, _fs.readFileSync)(file, 'utf8');
};