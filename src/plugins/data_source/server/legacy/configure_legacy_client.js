"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configureLegacyClient = void 0;
var _elasticsearch = require("elasticsearch");
var _awsSdk = require("aws-sdk");
var _lodash = require("lodash");
var _connector = _interopRequireDefault(require("./http_aws_es/connector"));
var _server = require("../../../../../src/core/server");
var _data_sources = require("../../common/data_sources");
var _client_config = require("./client_config");
var _error = require("../lib/error");
var _configure_client_utils = require("../client/configure_client_utils");
var _credential_provider = require("../util/credential_provider");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const configureLegacyClient = async ({
  dataSourceId,
  savedObjects,
  cryptography,
  customApiSchemaRegistryPromise,
  request,
  authRegistry
}, callApiParams, openSearchClientPoolSetup, config, logger) => {
  try {
    const dataSourceAttr = await (0, _configure_client_utils.getDataSource)(dataSourceId, savedObjects);
    let clientParams;
    const authenticationMethod = (0, _configure_client_utils.getAuthenticationMethod)(dataSourceAttr, authRegistry);
    if (authenticationMethod !== undefined) {
      clientParams = await (0, _credential_provider.authRegistryCredentialProvider)(authenticationMethod, {
        dataSourceAttr,
        request,
        cryptography
      });
    }
    const rootClient = (0, _configure_client_utils.getRootClient)(dataSourceAttr, openSearchClientPoolSetup.getClientFromPool, clientParams);
    const registeredSchema = (await customApiSchemaRegistryPromise).getAll();
    return await getQueryClient(dataSourceAttr, cryptography, callApiParams, openSearchClientPoolSetup.addClientToPool, config, registeredSchema, rootClient, dataSourceId, request, clientParams);
  } catch (error) {
    logger.debug(`Failed to get data source client for dataSourceId: [${dataSourceId}]. ${error}: ${error.stack}`);
    // Re-throw as DataSourceError
    throw (0, _error.createDataSourceError)(error);
  }
};

/**
 * With given auth info, wrap the rootClient and return
 *
 * @param rootClient root client for the connection with given data source endpoint.
 * @param dataSourceAttr data source saved object attributes
 * @param cryptography cryptography service for password encryption / decryption
 * @param config data source config
 * @param registeredSchema registered API schema
 * @param addClientToPool function to add client to client pool
 * @param dataSourceId id of data source saved Object
 * @returns child client.
 */
exports.configureLegacyClient = configureLegacyClient;
const getQueryClient = async (dataSourceAttr, cryptography, {
  endpoint,
  clientParams,
  options
}, addClientToPool, config, registeredSchema, rootClient, dataSourceId, request, authClientParams) => {
  var _ref, _ref2;
  let credential;
  let cacheKeySuffix;
  let {
    auth: {
      type
    },
    endpoint: nodeUrl
  } = dataSourceAttr;
  const clientOptions = (0, _client_config.parseClientOptions)(config, nodeUrl, registeredSchema);
  if (authClientParams !== undefined) {
    credential = authClientParams.credentials;
    type = authClientParams.authType;
    cacheKeySuffix = authClientParams.cacheKeySuffix;
    nodeUrl = authClientParams.endpoint;
    if (credential.service === undefined) {
      var _dataSourceAttr$auth$;
      credential = {
        ...credential,
        service: (_dataSourceAttr$auth$ = dataSourceAttr.auth.credentials) === null || _dataSourceAttr$auth$ === void 0 ? void 0 : _dataSourceAttr$auth$.service
      };
    }
  }
  const cacheKey = (0, _configure_client_utils.generateCacheKey)(nodeUrl, cacheKeySuffix);
  switch (type) {
    case _data_sources.AuthType.NoAuth:
      if (!rootClient) rootClient = new _elasticsearch.Client(clientOptions);
      addClientToPool(cacheKey, type, rootClient);
      return await callAPI.bind(null, rootClient)(endpoint, clientParams, options);
    case _data_sources.AuthType.UsernamePasswordType:
      credential = (_ref = credential) !== null && _ref !== void 0 ? _ref : await (0, _configure_client_utils.getCredential)(dataSourceAttr, cryptography);
      if (!rootClient) rootClient = new _elasticsearch.Client(clientOptions);
      addClientToPool(cacheKey, type, rootClient);
      return getBasicAuthClient(rootClient, {
        endpoint,
        clientParams,
        options
      }, credential);
    case _data_sources.AuthType.SigV4:
      credential = (_ref2 = credential) !== null && _ref2 !== void 0 ? _ref2 : await (0, _configure_client_utils.getAWSCredential)(dataSourceAttr, cryptography);
      if (!rootClient) {
        rootClient = getAWSClient(credential, clientOptions);
      }
      addClientToPool(cacheKey, type, rootClient);
      return await getAWSChildClient(rootClient, {
        endpoint,
        clientParams,
        options
      }, credential);
    default:
      throw Error(`${type} is not a supported auth type for data source`);
  }
};

/**
 * Calls the OpenSearch API endpoint with the specified parameters.
 * @param client Raw legacy JS client instance to use.
 * @param endpoint Name of the API endpoint to call.
 * @param clientParams Parameters that will be directly passed to the
 * legacy JS client.
 * @param options Options that affect the way we call the API and process the result.
 * make wrap401Errors default to false, because we don't want login pop-up from browser
 */
const callAPI = async (client, endpoint, clientParams = {}, options = {
  wrap401Errors: false
}) => {
  const clientPath = endpoint.split('.');
  const api = (0, _lodash.get)(client, clientPath);
  if (!api) {
    throw new Error(`called with an invalid endpoint: ${endpoint}`);
  }
  const apiContext = clientPath.length === 1 ? client : (0, _lodash.get)(client, clientPath.slice(0, -1));
  try {
    return await new Promise((resolve, reject) => {
      const request = api.call(apiContext, clientParams);
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          request.abort();
          reject(new Error('Request was aborted'));
        });
      }
      return request.then(resolve, reject);
    });
  } catch (err) {
    if (!options.wrap401Errors || err.statusCode !== 401) {
      throw err;
    }
    throw _server.LegacyOpenSearchErrorHelpers.decorateNotAuthorizedError(err);
  }
};

/**
 * Get a legacy client that configured with basic auth
 *
 * @param rootClient Raw legacy client instance to use.
 * @param endpoint - String descriptor of the endpoint e.g. `cluster.getSettings` or `ping`.
 * @param clientParams - A dictionary of parameters that will be passed directly to the legacy JS client.
 * @param options - Options that affect the way we call the API and process the result.
 */
const getBasicAuthClient = async (rootClient, {
  endpoint,
  clientParams = {},
  options
}, {
  username,
  password
}) => {
  const headers = {
    authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
  };
  clientParams.headers = Object.assign({}, clientParams.headers, headers);
  return await callAPI.bind(null, rootClient)(endpoint, clientParams, options);
};
const getAWSClient = (credential, clientOptions) => {
  const {
    region
  } = credential;
  const client = new _elasticsearch.Client({
    connectionClass: _connector.default,
    awsConfig: new _awsSdk.Config({
      region
    }),
    ...clientOptions
  });
  return client;
};
const getAWSChildClient = async (rootClient, {
  endpoint,
  clientParams = {},
  options
}, credential) => {
  const {
    accessKey,
    secretKey,
    region,
    service,
    sessionToken
  } = credential;
  const authHeaders = {
    auth: {
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
        sessionToken: sessionToken !== null && sessionToken !== void 0 ? sessionToken : ''
      },
      region,
      service: service !== null && service !== void 0 ? service : _data_sources.SigV4ServiceName.OpenSearch
    }
  };
  clientParams.headers = Object.assign({}, clientParams.headers, authHeaders);
  return await callAPI.bind(null, rootClient)(endpoint, clientParams, options);
};