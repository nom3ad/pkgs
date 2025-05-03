"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataSourcePlugin = void 0;
var _operators = require("rxjs/operators");
var _logging_auditor = require("./audit/logging_auditor");
var _cryptography_service = require("./cryptography_service");
var _data_source_service = require("./data_source_service");
var _saved_objects = require("./saved_objects");
var _common = require("../common");
var _router = require("../../../../src/core/server/http/router");
var _error = require("./lib/error");
var _test_connection = require("./routes/test_connection");
var _fetch_data_source_metadata = require("./routes/fetch_data_source_metadata");
var _auth_registry = require("./auth_registry");
var _schema_registry = require("./schema_registry");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */ // eslint-disable-next-line @osd/eslint/no-restricted-paths
class DataSourcePlugin {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "cryptographyService", void 0);
    _defineProperty(this, "dataSourceService", void 0);
    _defineProperty(this, "config$", void 0);
    _defineProperty(this, "started", false);
    _defineProperty(this, "authMethodsRegistry", new _auth_registry.AuthenticationMethodRegistry());
    _defineProperty(this, "customApiSchemaRegistry", new _schema_registry.CustomApiSchemaRegistry());
    _defineProperty(this, "createDataSourceRouteHandlerContext", (dataSourceService, cryptography, logger, auditTrailPromise, authRegistryPromise, customApiSchemaRegistryPromise) => {
      return async (context, req) => {
        const authRegistry = await authRegistryPromise;
        return {
          opensearch: {
            getClient: dataSourceId => {
              const auditor = auditTrailPromise.then(auditTrail => auditTrail.asScoped(req));
              this.logAuditMessage(auditor, dataSourceId, req);
              return dataSourceService.getDataSourceClient({
                dataSourceId,
                savedObjects: context.core.savedObjects.client,
                cryptography,
                customApiSchemaRegistryPromise,
                request: req,
                authRegistry
              });
            },
            legacy: {
              getClient: dataSourceId => {
                return dataSourceService.getDataSourceLegacyClient({
                  dataSourceId,
                  savedObjects: context.core.savedObjects.client,
                  cryptography,
                  customApiSchemaRegistryPromise,
                  request: req,
                  authRegistry
                });
              }
            }
          }
        };
      };
    });
    this.logger = this.initializerContext.logger.get();
    this.cryptographyService = new _cryptography_service.CryptographyService(this.logger.get('cryptography-service'));
    this.dataSourceService = new _data_source_service.DataSourceService(this.logger.get('data-source-service'));
    this.config$ = this.initializerContext.config.create();
  }
  async setup(core) {
    this.logger.debug('dataSource: Setup');

    // Register data source saved object type
    core.savedObjects.registerType(_saved_objects.dataSource);
    core.savedObjects.registerType(_saved_objects.dataConnection);
    const config = await this.config$.pipe((0, _operators.first)()).toPromise();
    const cryptographyServiceSetup = this.cryptographyService.setup(config);
    const authRegistryPromise = core.getStartServices().then(([,, selfStart]) => {
      const dataSourcePluginStart = selfStart;
      return dataSourcePluginStart.getAuthenticationMethodRegistry();
    });
    const dataSourceSavedObjectsClientWrapper = new _saved_objects.DataSourceSavedObjectsClientWrapper(cryptographyServiceSetup, this.logger.get('data-source-saved-objects-client-wrapper-factory'), authRegistryPromise, config.endpointDeniedIPs);

    // Add data source saved objects client wrapper factory
    core.savedObjects.addClientWrapper(1, _common.DATA_SOURCE_SAVED_OBJECT_TYPE, dataSourceSavedObjectsClientWrapper.wrapperFactory);
    core.logging.configure(this.config$.pipe((0, _operators.map)(dataSourceConfig => ({
      appenders: {
        auditTrailAppender: dataSourceConfig.audit.appender
      },
      loggers: [{
        context: 'audit',
        level: dataSourceConfig.audit.enabled ? 'info' : 'off',
        appenders: ['auditTrailAppender']
      }]
    }))));
    const auditorFactory = {
      asScoped: request => {
        return new _logging_auditor.LoggingAuditor(request, this.logger.get('audit'));
      }
    };
    core.auditTrail.register(auditorFactory);
    const auditTrailPromise = core.getStartServices().then(([coreStart]) => coreStart.auditTrail);
    const dataSourceService = await this.dataSourceService.setup(config);
    const customApiSchemaRegistryPromise = core.getStartServices().then(([,, selfStart]) => {
      const dataSourcePluginStart = selfStart;
      return dataSourcePluginStart.getCustomApiSchemaRegistry();
    });

    // Register data source plugin context to route handler context
    core.http.registerRouteHandlerContext('dataSource', this.createDataSourceRouteHandlerContext(dataSourceService, cryptographyServiceSetup, this.logger, auditTrailPromise, authRegistryPromise, customApiSchemaRegistryPromise));
    const router = core.http.createRouter();
    (0, _test_connection.registerTestConnectionRoute)(router, dataSourceService, cryptographyServiceSetup, authRegistryPromise, customApiSchemaRegistryPromise);
    (0, _fetch_data_source_metadata.registerFetchDataSourceMetaDataRoute)(router, dataSourceService, cryptographyServiceSetup, authRegistryPromise, customApiSchemaRegistryPromise);
    const registerCredentialProvider = method => {
      this.logger.debug(`Registered Credential Provider for authType = ${method.name}`);
      if (this.started) {
        throw new Error('cannot call `registerCredentialProvider` after service startup.');
      }
      this.authMethodsRegistry.registerAuthenticationMethod(method);
    };
    return {
      createDataSourceError: e => (0, _error.createDataSourceError)(e),
      registerCredentialProvider,
      registerCustomApiSchema: schema => this.customApiSchemaRegistry.register(schema),
      dataSourceEnabled: () => config.enabled
    };
  }
  start(core) {
    this.logger.debug('dataSource: Started');
    this.started = true;
    return {
      getAuthenticationMethodRegistry: () => this.authMethodsRegistry,
      getCustomApiSchemaRegistry: () => this.customApiSchemaRegistry
    };
  }
  stop() {
    this.dataSourceService.stop();
  }
  async logAuditMessage(auditorPromise, dataSourceId, request) {
    const auditor = await auditorPromise;
    const auditMessage = this.getAuditMessage(request, dataSourceId);
    auditor.add({
      message: auditMessage,
      type: 'opensearch.dataSourceClient.fetchClient'
    });
  }
  getAuditMessage(request, dataSourceId) {
    var _rawRequest$info;
    const rawRequest = (0, _router.ensureRawRequest)(request);
    const remoteAddress = rawRequest === null || rawRequest === void 0 || (_rawRequest$info = rawRequest.info) === null || _rawRequest$info === void 0 ? void 0 : _rawRequest$info.remoteAddress;
    const xForwardFor = request.headers['x-forwarded-for'];
    const forwarded = request.headers.forwarded;
    const forwardedInfo = forwarded ? forwarded : xForwardFor;
    return forwardedInfo ? `${remoteAddress} attempted accessing through ${forwardedInfo} on data source: ${dataSourceId}` : `${remoteAddress} attempted accessing on data source: ${dataSourceId}`;
  }
}
exports.DataSourcePlugin = DataSourcePlugin;