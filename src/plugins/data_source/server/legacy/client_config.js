"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseClientOptions = parseClientOptions;
var _tls_settings_provider = require("../util/tls_settings_provider");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/** @internal */

/**
 * Parse the client options from given data source config and endpoint
 *
 * @param config The config to generate the client options from.
 * @param endpoint endpoint url of data source
 */
function parseClientOptions(
// TODO: will use client configs, that comes from a merge result of user config and default legacy client config,
config, endpoint, registeredSchema) {
  const sslConfig = {
    rejectUnauthorized: true
  };
  if (config.ssl) {
    var _config$ssl;
    const verificationMode = config.ssl.verificationMode;
    switch (verificationMode) {
      case 'none':
        sslConfig.rejectUnauthorized = false;
        break;
      case 'certificate':
        sslConfig.rejectUnauthorized = true;

        // by default, NodeJS is checking the server identify
        sslConfig.checkServerIdentity = () => undefined;
        break;
      case 'full':
        sslConfig.rejectUnauthorized = true;
        break;
      default:
        throw new Error(`Unknown ssl verificationMode: ${verificationMode}`);
    }
    const {
      certificateAuthorities
    } = (0, _tls_settings_provider.readCertificateAuthorities)((_config$ssl = config.ssl) === null || _config$ssl === void 0 ? void 0 : _config$ssl.certificateAuthorities);
    sslConfig.ca = certificateAuthorities;
  }
  const configOptions = {
    host: endpoint,
    ssl: sslConfig,
    plugins: registeredSchema
  };
  return configOptions;
}