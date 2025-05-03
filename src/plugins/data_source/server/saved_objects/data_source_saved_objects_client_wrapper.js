"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataSourceSavedObjectsClientWrapper = void 0;
var _server = require("../../../../../src/core/server");
var _common = require("../../common");
var _data_sources = require("../../common/data_sources");
var _endpoint_validator = require("../util/endpoint_validator");
var _constants = require("../util/constants");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Describes the Credential Saved Objects Client Wrapper class,
 * which contains the factory used to create Saved Objects Client Wrapper instances
 */
class DataSourceSavedObjectsClientWrapper {
  constructor(cryptography, logger, authRegistryPromise, endpointBlockedIps) {
    this.cryptography = cryptography;
    this.logger = logger;
    this.authRegistryPromise = authRegistryPromise;
    this.endpointBlockedIps = endpointBlockedIps;
    /**
     * Describes the factory used to create instances of Saved Objects Client Wrappers
     * for data source specific operations such as credentials encryption
     */
    _defineProperty(this, "wrapperFactory", wrapperOptions => {
      const createWithCredentialsEncryption = async (type, attributes, options) => {
        if (_common.DATA_SOURCE_SAVED_OBJECT_TYPE !== type) {
          return await wrapperOptions.client.create(type, attributes, options);
        }
        const encryptedAttributes = await this.validateAndEncryptAttributes(attributes);
        return await wrapperOptions.client.create(type, encryptedAttributes, options);
      };
      const bulkCreateWithCredentialsEncryption = async (objects, options) => {
        objects = await Promise.all(objects.map(async object => {
          const {
            type,
            attributes
          } = object;
          if (_common.DATA_SOURCE_SAVED_OBJECT_TYPE !== type) {
            return object;
          }
          return {
            ...object,
            attributes: await this.validateAndEncryptAttributes(attributes)
          };
        }));
        return await wrapperOptions.client.bulkCreate(objects, options);
      };
      const updateWithCredentialsEncryption = async (type, id, attributes, options = {}) => {
        if (_common.DATA_SOURCE_SAVED_OBJECT_TYPE !== type) {
          return await wrapperOptions.client.update(type, id, attributes, options);
        }
        const encryptedAttributes = await this.validateAndUpdatePartialAttributes(wrapperOptions, id, attributes, options);
        return await wrapperOptions.client.update(type, id, encryptedAttributes, options);
      };
      const bulkUpdateWithCredentialsEncryption = async (objects, options) => {
        objects = await Promise.all(objects.map(async object => {
          const {
            id,
            type,
            attributes
          } = object;
          if (_common.DATA_SOURCE_SAVED_OBJECT_TYPE !== type) {
            return object;
          }
          const encryptedAttributes = await this.validateAndUpdatePartialAttributes(wrapperOptions, id, attributes, options);
          return {
            ...object,
            attributes: encryptedAttributes
          };
        }));
        return await wrapperOptions.client.bulkUpdate(objects, options);
      };
      return {
        ...wrapperOptions.client,
        create: createWithCredentialsEncryption,
        bulkCreate: bulkCreateWithCredentialsEncryption,
        checkConflicts: wrapperOptions.client.checkConflicts,
        delete: wrapperOptions.client.delete,
        find: wrapperOptions.client.find,
        bulkGet: wrapperOptions.client.bulkGet,
        get: wrapperOptions.client.get,
        update: updateWithCredentialsEncryption,
        bulkUpdate: bulkUpdateWithCredentialsEncryption,
        errors: wrapperOptions.client.errors,
        addToNamespaces: wrapperOptions.client.addToNamespaces,
        deleteFromNamespaces: wrapperOptions.client.deleteFromNamespaces
      };
    });
    _defineProperty(this, "validateEncryptionContext", (encryptionContext, dataSource) => {
      // validate encryption context
      if (encryptionContext.endpoint !== dataSource.endpoint) {
        throw _server.SavedObjectsErrorHelpers.createBadRequestError('Failed to update existing data source: "endpoint" contaminated. Please delete and create another data source.');
      }
    });
  }
  async validateAndEncryptAttributes(attributes) {
    await this.validateAttributes(attributes);
    const {
      endpoint,
      auth
    } = attributes;
    switch (auth.type) {
      case _data_sources.AuthType.NoAuth:
        return {
          ...attributes,
          // Drop the credentials attribute for no_auth
          auth: {
            type: auth.type,
            credentials: undefined
          }
        };
      case _data_sources.AuthType.UsernamePasswordType:
        // Signing the data source with endpoint
        return {
          ...attributes,
          auth: await this.encryptBasicAuthCredential(auth, {
            endpoint
          })
        };
      case _data_sources.AuthType.SigV4:
        return {
          ...attributes,
          auth: await this.encryptSigV4Credential(auth, {
            endpoint
          })
        };
      default:
        if (await this.isAuthTypeAvailableInRegistry(auth.type)) {
          return attributes;
        }
        throw _server.SavedObjectsErrorHelpers.createBadRequestError(`Invalid auth type: '${auth.type}'`);
    }
  }
  async validateAndUpdatePartialAttributes(wrapperOptions, id, attributes, options = {}) {
    const {
      auth,
      endpoint
    } = attributes;
    if (endpoint) {
      throw _server.SavedObjectsErrorHelpers.createBadRequestError(`Updating a dataSource endpoint is not supported`);
    }
    if (!auth) {
      return attributes;
    }
    const {
      type,
      credentials
    } = auth;
    const existingDataSourceAttr = await this.getDataSourceAttributes(wrapperOptions, id, options);
    const encryptionContext = await this.getEncryptionContext(existingDataSourceAttr);
    switch (type) {
      case _data_sources.AuthType.NoAuth:
        return {
          ...attributes,
          // Drop the credentials attribute for no_auth
          auth: {
            type: auth.type,
            credentials: null
          }
        };
      case _data_sources.AuthType.UsernamePasswordType:
        if (credentials !== null && credentials !== void 0 && credentials.password) {
          this.validateEncryptionContext(encryptionContext, existingDataSourceAttr);
          return {
            ...attributes,
            auth: await this.encryptBasicAuthCredential(auth, encryptionContext)
          };
        } else {
          return attributes;
        }
      case _data_sources.AuthType.SigV4:
        this.validateEncryptionContext(encryptionContext, existingDataSourceAttr);
        if (credentials !== null && credentials !== void 0 && credentials.accessKey && credentials !== null && credentials !== void 0 && credentials.secretKey) {
          return {
            ...attributes,
            auth: await this.encryptSigV4Credential(auth, encryptionContext)
          };
        } else {
          if (credentials !== null && credentials !== void 0 && credentials.accessKey) {
            throw _server.SavedObjectsErrorHelpers.createBadRequestError(`Failed to update existing data source with auth type ${type}: "credentials.secretKey" missing.`);
          }
          if (credentials !== null && credentials !== void 0 && credentials.secretKey) {
            throw _server.SavedObjectsErrorHelpers.createBadRequestError(`Failed to update existing data source with auth type ${type}: "credentials.accessKey" missing.`);
          }
          return attributes;
        }
      default:
        if (await this.isAuthTypeAvailableInRegistry(auth.type)) {
          return attributes;
        }
        throw _server.SavedObjectsErrorHelpers.createBadRequestError(`Invalid credentials type: '${type}'`);
    }
  }
  async validateAttributes(attributes) {
    const {
      title,
      endpoint,
      auth
    } = attributes;
    this.validateTitle(title);
    this.validateEndpoint(endpoint);
    await this.validateAuth(auth);
  }
  validateEndpoint(endpoint) {
    if (!(0, _endpoint_validator.isValidURL)(endpoint, this.endpointBlockedIps)) {
      throw _server.SavedObjectsErrorHelpers.createBadRequestError('"endpoint" attribute is not valid or allowed');
    }
  }
  validateTitle(title) {
    if (!title.trim().length) {
      throw _server.SavedObjectsErrorHelpers.createBadRequestError('"title" attribute must be a non-empty string');
    }
    if (title.length > _constants.DATA_SOURCE_TITLE_LENGTH_LIMIT) {
      throw _server.SavedObjectsErrorHelpers.createBadRequestError(`"title" attribute is limited to ${_constants.DATA_SOURCE_TITLE_LENGTH_LIMIT} characters`);
    }
  }
  async validateAuth(auth) {
    if (!auth) {
      throw _server.SavedObjectsErrorHelpers.createBadRequestError('"auth" attribute is required');
    }
    const {
      type,
      credentials
    } = auth;
    if (!type) {
      throw _server.SavedObjectsErrorHelpers.createBadRequestError('"auth.type" attribute is required');
    }
    switch (type) {
      case _data_sources.AuthType.NoAuth:
        break;
      case _data_sources.AuthType.UsernamePasswordType:
        if (!credentials) {
          throw _server.SavedObjectsErrorHelpers.createBadRequestError('"auth.credentials" attribute is required');
        }
        const {
          username,
          password
        } = credentials;
        if (!username) {
          throw _server.SavedObjectsErrorHelpers.createBadRequestError('"auth.credentials.username" attribute is required');
        }
        if (!password) {
          throw _server.SavedObjectsErrorHelpers.createBadRequestError('"auth.credentials.password" attribute is required');
        }
        break;
      case _data_sources.AuthType.SigV4:
        if (!credentials) {
          throw _server.SavedObjectsErrorHelpers.createBadRequestError('"auth.credentials" attribute is required');
        }
        const {
          accessKey,
          secretKey,
          region,
          service
        } = credentials;
        if (!accessKey) {
          throw _server.SavedObjectsErrorHelpers.createBadRequestError('"auth.credentials.accessKey" attribute is required');
        }
        if (!secretKey) {
          throw _server.SavedObjectsErrorHelpers.createBadRequestError('"auth.credentials.secretKey" attribute is required');
        }
        if (!region) {
          throw _server.SavedObjectsErrorHelpers.createBadRequestError('"auth.credentials.region" attribute is required');
        }
        if (!service) {
          throw _server.SavedObjectsErrorHelpers.createBadRequestError('"auth.credentials.service" attribute is required');
        }
        break;
      default:
        if (await this.isAuthTypeAvailableInRegistry(type)) {
          break;
        }
        throw _server.SavedObjectsErrorHelpers.createBadRequestError(`Invalid auth type: '${type}'`);
    }
  }
  async getEncryptionContext(attributes) {
    let encryptionContext;
    if (!attributes) {
      throw _server.SavedObjectsErrorHelpers.createBadRequestError('Failed to update existing data source: "attributes" missing. Please delete and create another data source.');
    }
    const {
      endpoint,
      auth
    } = attributes;
    if (!endpoint) {
      throw _server.SavedObjectsErrorHelpers.createBadRequestError('Failed to update existing data source: "endpoint" missing. Please delete and create another data source.');
    }
    if (!auth) {
      throw _server.SavedObjectsErrorHelpers.createBadRequestError('Failed to update existing data source: "auth" missing. Please delete and create another data source.');
    }
    switch (auth.type) {
      case _data_sources.AuthType.NoAuth:
        // Signing the data source with existing endpoint
        encryptionContext = {
          endpoint
        };
        break;
      case _data_sources.AuthType.UsernamePasswordType:
        const {
          credentials
        } = auth;
        if (!credentials) {
          throw _server.SavedObjectsErrorHelpers.createBadRequestError('Failed to update existing data source: "credentials" missing. Please delete and create another data source.');
        }
        const {
          username,
          password
        } = credentials;
        if (!username) {
          throw _server.SavedObjectsErrorHelpers.createBadRequestError('Failed to update existing data source: "auth.credentials.username" missing. Please delete and create another data source.');
        }
        if (!password) {
          throw _server.SavedObjectsErrorHelpers.createBadRequestError('Failed to update existing data source: "auth.credentials.password" missing. Please delete and create another data source.');
        }
        encryptionContext = await this.getEncryptionContextFromCipher(password);
        break;
      case _data_sources.AuthType.SigV4:
        const {
          accessKey,
          secretKey
        } = auth.credentials;
        const accessKeyEncryptionContext = await this.getEncryptionContextFromCipher(accessKey);
        const secretKeyEncryptionContext = await this.getEncryptionContextFromCipher(secretKey);
        if (accessKeyEncryptionContext.endpoint !== secretKeyEncryptionContext.endpoint) {
          throw _server.SavedObjectsErrorHelpers.createBadRequestError('Failed to update existing data source: encryption contexts for "auth.credentials.accessKey" and "auth.credentials.secretKey" must be same. Please delete and create another data source.');
        }
        encryptionContext = accessKeyEncryptionContext;
        break;
      default:
        if (await this.isAuthTypeAvailableInRegistry(auth.type)) {
          return attributes;
        }
        throw _server.SavedObjectsErrorHelpers.createBadRequestError(`Invalid auth type: '${auth.type}'`);
    }
    return encryptionContext;
  }
  async getDataSourceAttributes(wrapperOptions, id, options = {}) {
    try {
      // Fetch existing data source by id
      const savedObject = await wrapperOptions.client.get(_common.DATA_SOURCE_SAVED_OBJECT_TYPE, id, {
        namespace: options.namespace
      });
      return savedObject.attributes;
    } catch (err) {
      const errMsg = `Failed to fetch existing data source for dataSourceId [${id}]`;
      this.logger.error(`${errMsg}: ${err} ${err.stack}`);
      throw _server.SavedObjectsErrorHelpers.decorateBadRequestError(err, errMsg);
    }
  }
  async getEncryptionContextFromCipher(cipher) {
    const {
      encryptionContext
    } = await this.cryptography.decodeAndDecrypt(cipher).catch(err => {
      const errMsg = `Failed to update existing data source: unable to decrypt auth content`;
      this.logger.error(`${errMsg}: ${err} ${err.stack}`);
      throw _server.SavedObjectsErrorHelpers.decorateBadRequestError(err, errMsg);
    });
    return encryptionContext;
  }
  async encryptBasicAuthCredential(auth, encryptionContext) {
    const {
      credentials: {
        username,
        password
      }
    } = auth;
    return {
      ...auth,
      credentials: {
        username,
        password: await this.cryptography.encryptAndEncode(password, encryptionContext)
      }
    };
  }
  async encryptSigV4Credential(auth, encryptionContext) {
    const {
      credentials: {
        accessKey,
        secretKey,
        region,
        service
      }
    } = auth;
    return {
      ...auth,
      credentials: {
        region,
        accessKey: await this.cryptography.encryptAndEncode(accessKey, encryptionContext),
        secretKey: await this.cryptography.encryptAndEncode(secretKey, encryptionContext),
        service
      }
    };
  }
  async getAuthenticationMethodFromRegistry(type) {
    const authMethod = (await this.authRegistryPromise).getAuthenticationMethod(type);
    return authMethod;
  }
  async isAuthTypeAvailableInRegistry(type) {
    const authMethod = await this.getAuthenticationMethodFromRegistry(type);
    return authMethod !== undefined;
  }
}
exports.DataSourceSavedObjectsClientWrapper = DataSourceSavedObjectsClientWrapper;