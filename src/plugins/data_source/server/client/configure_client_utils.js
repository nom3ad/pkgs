"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRootClient = exports.getDataSource = exports.getCredential = exports.getAuthenticationMethod = exports.getAWSCredential = exports.generateCacheKey = void 0;
var _common = require("../../common");
var _error = require("../lib/error");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Get the root client of datasource from
 * client cache. If there's a cache miss, return undefined.
 *
 * @param dataSourceAttr data source saved objects attributes
 * @param dataSourceId id of data source saved Object
 * @param addClientToPool function to get client from client pool
 * @returns cached OpenSearch client, or undefined if cache miss
 */
const getRootClient = (dataSourceAttr, getClientFromPool, clientParams) => {
  let cacheKeySuffix;
  let {
    auth: {
      type
    },
    endpoint
  } = dataSourceAttr;
  if (clientParams !== undefined) {
    endpoint = clientParams.endpoint;
    cacheKeySuffix = clientParams.cacheKeySuffix;
    type = clientParams.authType;
  }
  const cacheKey = generateCacheKey(endpoint, cacheKeySuffix);
  return getClientFromPool(cacheKey, type);
};
exports.getRootClient = getRootClient;
const getDataSource = async (dataSourceId, savedObjects) => {
  const dataSourceSavedObject = await savedObjects.get(_common.DATA_SOURCE_SAVED_OBJECT_TYPE, dataSourceId);
  const dataSourceAttr = {
    ...dataSourceSavedObject.attributes,
    lastUpdatedTime: dataSourceSavedObject.updated_at
  };
  return dataSourceAttr;
};
exports.getDataSource = getDataSource;
const getCredential = async (dataSource, cryptography) => {
  const {
    endpoint
  } = dataSource;
  const {
    username,
    password
  } = dataSource.auth.credentials;
  const {
    decryptedText,
    encryptionContext
  } = await cryptography.decodeAndDecrypt(password);
  if (encryptionContext.endpoint !== endpoint) {
    throw new Error('Data source "endpoint" contaminated. Please delete and create another data source.');
  }
  const credential = {
    username,
    password: decryptedText
  };
  return credential;
};
exports.getCredential = getCredential;
const getAWSCredential = async (dataSource, cryptography) => {
  const {
    endpoint
  } = dataSource;
  const {
    accessKey,
    secretKey,
    region,
    service
  } = dataSource.auth.credentials;
  const {
    decryptedText: accessKeyText,
    encryptionContext: accessKeyEncryptionContext
  } = await cryptography.decodeAndDecrypt(accessKey).catch(err => {
    // Re-throw as DataSourceError
    throw (0, _error.createDataSourceError)(err);
  });
  const {
    decryptedText: secretKeyText,
    encryptionContext: secretKeyEncryptionContext
  } = await cryptography.decodeAndDecrypt(secretKey).catch(err => {
    // Re-throw as DataSourceError
    throw (0, _error.createDataSourceError)(err);
  });
  if (accessKeyEncryptionContext.endpoint !== endpoint || secretKeyEncryptionContext.endpoint !== endpoint) {
    throw new Error('Data source "endpoint" contaminated. Please delete and create another data source.');
  }
  const credential = {
    region,
    accessKey: accessKeyText,
    secretKey: secretKeyText,
    service
  };
  return credential;
};
exports.getAWSCredential = getAWSCredential;
const generateCacheKey = (endpoint, cacheKeySuffix) => {
  const CACHE_KEY_DELIMITER = ',';
  let key = endpoint;
  if (cacheKeySuffix) key += CACHE_KEY_DELIMITER + cacheKeySuffix;
  return key;
};
exports.generateCacheKey = generateCacheKey;
const getAuthenticationMethod = (dataSourceAttr, authRegistry) => {
  return authRegistry === null || authRegistry === void 0 ? void 0 : authRegistry.getAuthenticationMethod(dataSourceAttr.auth.type);
};
exports.getAuthenticationMethod = getAuthenticationMethod;