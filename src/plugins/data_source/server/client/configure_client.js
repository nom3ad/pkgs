"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configureClient = void 0;
var _opensearchNext = require("@opensearch-project/opensearch-next");
var _aws = require("@opensearch-project/opensearch-next/aws");
var _data_sources = require("../../common/data_sources");
var _error = require("../lib/error");
var _client_config = require("./client_config");
var _configure_client_utils = require("./configure_client_utils");
var _credential_provider = require("../util/credential_provider");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const configureClient = async ({
  dataSourceId,
  savedObjects,
  cryptography,
  testClientDataSourceAttr,
  customApiSchemaRegistryPromise,
  request,
  authRegistry
}, openSearchClientPoolSetup, config, logger) => {
  let dataSource;
  let requireDecryption = true;
  let clientParams;
  try {
    // configure test client
    if (testClientDataSourceAttr) {
      const {
        auth: {
          type,
          credentials
        }
      } = testClientDataSourceAttr;
      // handle test connection case when changing non-credential field of existing data source
      if (dataSourceId && (type === _data_sources.AuthType.UsernamePasswordType && !(credentials !== null && credentials !== void 0 && credentials.password) || type === _data_sources.AuthType.SigV4 && !(credentials !== null && credentials !== void 0 && credentials.accessKey) && !(credentials !== null && credentials !== void 0 && credentials.secretKey))) {
        dataSource = await (0, _configure_client_utils.getDataSource)(dataSourceId, savedObjects);
      } else {
        dataSource = testClientDataSourceAttr;
        requireDecryption = false;
      }
    } else {
      dataSource = await (0, _configure_client_utils.getDataSource)(dataSourceId, savedObjects);
    }
    const authenticationMethod = (0, _configure_client_utils.getAuthenticationMethod)(dataSource, authRegistry);
    if (authenticationMethod !== undefined) {
      clientParams = await (0, _credential_provider.authRegistryCredentialProvider)(authenticationMethod, {
        dataSourceAttr: dataSource,
        request,
        cryptography
      });
    }
    const rootClient = (0, _configure_client_utils.getRootClient)(dataSource, openSearchClientPoolSetup.getClientFromPool, clientParams);
    const registeredSchema = (await customApiSchemaRegistryPromise).getAll();
    return await getQueryClient(dataSource, openSearchClientPoolSetup.addClientToPool, config, registeredSchema, cryptography, rootClient, dataSourceId, request, clientParams, requireDecryption);
  } catch (error) {
    logger.debug(`Failed to get data source client for dataSourceId: [${dataSourceId}]. ${error}: ${error.stack}`);
    // Re-throw as DataSourceError
    throw (0, _error.createDataSourceError)(error);
  }
};

/**
 * Create a child client object with given auth info.
 *
 * @param rootClient root client for the given data source.
 * @param dataSourceAttr data source saved object attributes
 * @param registeredSchema registered API schema
 * @param cryptography cryptography service for password encryption / decryption
 * @param config data source config
 * @param addClientToPool function to add client to client pool
 * @param dataSourceId id of data source saved Object
 * @param request OpenSearch Dashboards incoming request to read client parameters from header.
 * @param authRegistry registry to retrieve the credentials provider for the authentication method in order to return the client
 * @param requireDecryption false when creating test client before data source exists
 * @returns Promise of query client
 */
exports.configureClient = configureClient;
const getQueryClient = async (dataSourceAttr, addClientToPool, config, registeredSchema, cryptography, rootClient, dataSourceId, request, clientParams, requireDecryption = true) => {
  var _ref, _ref2;
  let credential;
  let cacheKeySuffix;
  let {
    auth: {
      type
    },
    endpoint
  } = dataSourceAttr;
  const clientOptions = (0, _client_config.parseClientOptions)(config, endpoint, registeredSchema);
  if (clientParams !== undefined) {
    credential = clientParams.credentials;
    type = clientParams.authType;
    cacheKeySuffix = clientParams.cacheKeySuffix;
    endpoint = clientParams.endpoint;
    if (credential.service === undefined) {
      var _dataSourceAttr$auth$;
      credential = {
        ...credential,
        service: (_dataSourceAttr$auth$ = dataSourceAttr.auth.credentials) === null || _dataSourceAttr$auth$ === void 0 ? void 0 : _dataSourceAttr$auth$.service
      };
    }
  }
  const cacheKey = (0, _configure_client_utils.generateCacheKey)(endpoint, cacheKeySuffix);
  switch (type) {
    case _data_sources.AuthType.NoAuth:
      if (!rootClient) rootClient = new _opensearchNext.Client(clientOptions);
      addClientToPool(cacheKey, type, rootClient);
      return rootClient.child();
    case _data_sources.AuthType.UsernamePasswordType:
      credential = (_ref = credential) !== null && _ref !== void 0 ? _ref : requireDecryption ? await (0, _configure_client_utils.getCredential)(dataSourceAttr, cryptography) : dataSourceAttr.auth.credentials;
      if (!rootClient) rootClient = new _opensearchNext.Client(clientOptions);
      addClientToPool(cacheKey, type, rootClient);
      return getBasicAuthClient(rootClient, credential);
    case _data_sources.AuthType.SigV4:
      credential = (_ref2 = credential) !== null && _ref2 !== void 0 ? _ref2 : requireDecryption ? await (0, _configure_client_utils.getAWSCredential)(dataSourceAttr, cryptography) : dataSourceAttr.auth.credentials;
      if (!rootClient) {
        rootClient = getAWSClient(credential, clientOptions);
      }
      addClientToPool(cacheKey, type, rootClient);
      return getAWSChildClient(rootClient, credential);
    default:
      throw Error(`${type} is not a supported auth type for data source`);
  }
};
const getBasicAuthClient = (rootClient, credential) => {
  const {
    username,
    password
  } = credential;
  return rootClient.child({
    auth: {
      username,
      password
    },
    // Child client doesn't allow auth option, adding null auth header to bypass,
    // so logic in child() can rebuild the auth header based on the auth input.
    // See https://github.com/opensearch-project/OpenSearch-Dashboards/issues/2182 for details
    headers: {
      authorization: null
    }
  });
};
const getAWSClient = (credential, clientOptions) => {
  const {
    region
  } = credential;
  return new _opensearchNext.Client({
    ...(0, _aws.AwsSigv4Signer)({
      region
    }),
    ...clientOptions
  });
};
const getAWSChildClient = (rootClient, credential) => {
  const {
    accessKey,
    secretKey,
    region,
    service,
    sessionToken
  } = credential;
  return rootClient.child({
    auth: {
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
        sessionToken: sessionToken !== null && sessionToken !== void 0 ? sessionToken : ''
      },
      region,
      service: service !== null && service !== void 0 ? service : _data_sources.SigV4ServiceName.OpenSearch
    }
  });
};