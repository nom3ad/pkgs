"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authRegistryCredentialProvider = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const authRegistryCredentialProvider = async (authenticationMethod, options) => {
  const clientParameters = await authenticationMethod.credentialProvider(options);
  return clientParameters;
};
exports.authRegistryCredentialProvider = authRegistryCredentialProvider;