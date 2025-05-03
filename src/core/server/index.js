"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  config: true,
  LegacyClusterClient: true,
  ILegacyClusterClient: true,
  ILegacyCustomClusterClient: true,
  LegacyScopedClusterClient: true,
  ILegacyScopedClusterClient: true,
  OpenSearchConfig: true,
  LegacyOpenSearchClientConfig: true,
  LegacyOpenSearchError: true,
  LegacyOpenSearchErrorHelpers: true,
  OpenSearchServiceSetup: true,
  OpenSearchServiceStart: true,
  OpenSearchStatusMeta: true,
  NodesVersionCompatibility: true,
  LegacyAPICaller: true,
  FakeRequest: true,
  ScopeableRequest: true,
  OpenSearchClient: true,
  IClusterClient: true,
  ICustomClusterClient: true,
  OpenSearchClientConfig: true,
  IScopedClusterClient: true,
  SearchResponse: true,
  CountResponse: true,
  ShardsInfo: true,
  ShardsResponse: true,
  Explanation: true,
  GetResponse: true,
  DeleteDocumentResponse: true,
  HttpResources: true,
  HttpResourcesRenderOptions: true,
  HttpResourcesResponseOptions: true,
  HttpResourcesServiceToolkit: true,
  HttpResourcesRequestHandler: true,
  PluginsServiceSetup: true,
  PluginsServiceStart: true,
  PluginOpaqueId: true,
  DiscoveredPlugin: true,
  Plugin: true,
  PluginConfigDescriptor: true,
  PluginConfigSchema: true,
  PluginInitializer: true,
  PluginInitializerContext: true,
  PluginManifest: true,
  PluginName: true,
  SharedGlobalConfig: true,
  ContextSetup: true,
  IContextContainer: true,
  IContextProvider: true,
  HandlerFunction: true,
  HandlerContextType: true,
  HandlerParameters: true,
  CapabilitiesSetup: true,
  CapabilitiesStart: true,
  Capabilities: true,
  CapabilitiesProvider: true,
  CapabilitiesSwitcher: true,
  AuditTrailStart: true,
  AuditableEvent: true,
  Auditor: true,
  AuditorFactory: true,
  AuditTrailSetup: true,
  Logger: true,
  LoggerFactory: true,
  LogMeta: true,
  LogRecord: true,
  LogLevel: true,
  LoggingServiceSetup: true,
  LoggerContextConfigInput: true,
  LoggerConfigType: true,
  AppenderConfigType: true,
  CrossCompatibilityServiceStart: true,
  CoreUsageData: true,
  CoreConfigUsageData: true,
  CoreEnvironmentUsageData: true,
  CoreServicesUsageData: true,
  CoreUsageDataStart: true,
  bootstrap: true,
  ConfigPath: true,
  ConfigService: true,
  ConfigDeprecation: true,
  ConfigDeprecationProvider: true,
  ConfigDeprecationLogger: true,
  ConfigDeprecationFactory: true,
  EnvironmentMode: true,
  PackageInfo: true,
  IDynamicConfigurationClient: true,
  DynamicConfigurationClientOptions: true,
  ConfigIdentifier: true,
  GetConfigProps: true,
  BulkGetConfigProps: true,
  IDynamicConfigStoreClient: true,
  IDynamicConfigStoreClientFactory: true,
  CoreId: true,
  CspConfig: true,
  ICspConfig: true,
  AuthenticationHandler: true,
  AuthHeaders: true,
  AuthResultParams: true,
  AuthStatus: true,
  AuthToolkit: true,
  AuthRedirected: true,
  AuthRedirectedParams: true,
  AuthResult: true,
  AuthResultType: true,
  Authenticated: true,
  AuthNotHandled: true,
  BasePath: true,
  IBasePath: true,
  CustomHttpResponseOptions: true,
  GetAuthHeaders: true,
  GetAuthState: true,
  Headers: true,
  HttpAuth: true,
  HttpResponseOptions: true,
  HttpResponsePayload: true,
  HttpServerInfo: true,
  HttpServiceSetup: true,
  HttpServiceStart: true,
  ErrorHttpResponseOptions: true,
  IOpenSearchDashboardsSocket: true,
  IsAuthenticated: true,
  OpenSearchDashboardsRequest: true,
  OpenSearchDashboardsRequestEvents: true,
  OpenSearchDashboardsRequestRoute: true,
  OpenSearchDashboardsRequestRouteOptions: true,
  IOpenSearchDashboardsResponse: true,
  LifecycleResponseFactory: true,
  KnownHeaders: true,
  LegacyRequest: true,
  OnPreAuthHandler: true,
  OnPreAuthToolkit: true,
  OnPreRoutingHandler: true,
  OnPreRoutingToolkit: true,
  OnPostAuthHandler: true,
  OnPostAuthToolkit: true,
  OnPreResponseHandler: true,
  OnPreResponseToolkit: true,
  OnPreResponseRender: true,
  OnPreResponseExtensions: true,
  OnPreResponseInfo: true,
  RedirectResponseOptions: true,
  RequestHandler: true,
  RequestHandlerWrapper: true,
  RequestHandlerContextContainer: true,
  RequestHandlerContextProvider: true,
  ResponseError: true,
  ResponseErrorAttributes: true,
  ResponseHeaders: true,
  opensearchDashboardsResponseFactory: true,
  OpenSearchDashboardsResponseFactory: true,
  RouteConfig: true,
  IRouter: true,
  RouteRegistrar: true,
  RouteMethod: true,
  RouteConfigOptions: true,
  RouteConfigOptionsBody: true,
  RouteContentType: true,
  validBodyOutput: true,
  RouteValidatorConfig: true,
  RouteValidationSpec: true,
  RouteValidationFunction: true,
  RouteValidatorOptions: true,
  RouteValidatorFullConfig: true,
  RouteValidationResultFactory: true,
  RouteValidationError: true,
  SessionStorage: true,
  SessionStorageCookieOptions: true,
  SessionCookieValidationResult: true,
  SessionStorageFactory: true,
  DestructiveRouteMethod: true,
  SafeRouteMethod: true,
  IRenderOptions: true,
  SavedObjectsBulkCreateObject: true,
  SavedObjectsBulkGetObject: true,
  SavedObjectsBulkUpdateObject: true,
  SavedObjectsBulkUpdateOptions: true,
  SavedObjectsBulkResponse: true,
  SavedObjectsBulkUpdateResponse: true,
  SavedObjectsCheckConflictsObject: true,
  SavedObjectsCheckConflictsResponse: true,
  SavedObjectsClient: true,
  SavedObjectsClientProviderOptions: true,
  SavedObjectsClientWrapperFactory: true,
  SavedObjectsClientWrapperOptions: true,
  SavedObjectsClientFactory: true,
  SavedObjectsClientFactoryProvider: true,
  SavedObjectsCreateOptions: true,
  SavedObjectsErrorHelpers: true,
  SavedObjectsExportOptions: true,
  SavedObjectsExportResultDetails: true,
  SavedObjectsFindResult: true,
  SavedObjectsFindResponse: true,
  SavedObjectsImportConflictError: true,
  SavedObjectsImportAmbiguousConflictError: true,
  SavedObjectsImportError: true,
  SavedObjectsImportMissingReferencesError: true,
  SavedObjectsImportOptions: true,
  SavedObjectsImportResponse: true,
  SavedObjectsImportRetry: true,
  SavedObjectsImportSuccess: true,
  SavedObjectsImportUnknownError: true,
  SavedObjectsImportUnsupportedTypeError: true,
  SavedObjectMigrationContext: true,
  SavedObjectsMigrationLogger: true,
  SavedObjectsRawDoc: true,
  SavedObjectSanitizedDoc: true,
  SavedObjectUnsanitizedDoc: true,
  SavedObjectsRepositoryFactory: true,
  SavedObjectsResolveImportErrorsOptions: true,
  SavedObjectsSerializer: true,
  SavedObjectsUpdateOptions: true,
  SavedObjectsUpdateResponse: true,
  SavedObjectsAddToNamespacesOptions: true,
  SavedObjectsAddToNamespacesResponse: true,
  SavedObjectsDeleteFromNamespacesOptions: true,
  SavedObjectsDeleteFromNamespacesResponse: true,
  SavedObjectsServiceStart: true,
  SavedObjectsServiceSetup: true,
  SavedObjectStatusMeta: true,
  SavedObjectsDeleteOptions: true,
  ISavedObjectsRepository: true,
  SavedObjectsRepository: true,
  SavedObjectsDeleteByNamespaceOptions: true,
  SavedObjectsDeleteByWorkspaceOptions: true,
  SavedObjectsIncrementCounterOptions: true,
  SavedObjectsFieldMapping: true,
  SavedObjectsTypeMappingDefinition: true,
  SavedObjectsMappingProperties: true,
  SavedObjectTypeRegistry: true,
  ISavedObjectTypeRegistry: true,
  SavedObjectsNamespaceType: true,
  SavedObjectsType: true,
  SavedObjectsTypeManagementDefinition: true,
  SavedObjectMigrationMap: true,
  SavedObjectMigrationFn: true,
  SavedObjectsUtils: true,
  exportSavedObjectsToStream: true,
  importSavedObjectsFromStream: true,
  resolveSavedObjectsImportErrors: true,
  ACL: true,
  Principals: true,
  PrincipalType: true,
  Permissions: true,
  updateDataSourceNameInVegaSpec: true,
  extractVegaSpecFromSavedObject: true,
  extractTimelineExpression: true,
  updateDataSourceNameInTimeline: true,
  IUiSettingsClient: true,
  UiSettingsParams: true,
  PublicUiSettingsParams: true,
  UiSettingsType: true,
  UiSettingsServiceSetup: true,
  UiSettingsServiceStart: true,
  UserProvidedValues: true,
  ImageValidation: true,
  DeprecationSettings: true,
  StringValidation: true,
  StringValidationRegex: true,
  StringValidationRegexString: true,
  CURRENT_USER_PLACEHOLDER: true,
  UiSettingScope: true,
  OpsMetrics: true,
  OpsOsMetrics: true,
  OpsServerMetrics: true,
  OpsProcessMetrics: true,
  MetricsServiceSetup: true,
  MetricsServiceStart: true,
  AppCategory: true,
  WorkspaceAttribute: true,
  PermissionModeId: true,
  DEFAULT_APP_CATEGORIES: true,
  WORKSPACE_TYPE: true,
  DEFAULT_NAV_GROUPS: true,
  SavedObject: true,
  SavedObjectAttribute: true,
  SavedObjectAttributes: true,
  SavedObjectAttributeSingle: true,
  SavedObjectReference: true,
  SavedObjectsBaseOptions: true,
  MutatingOperationRefreshSetting: true,
  SavedObjectsClientContract: true,
  SavedObjectsFindOptions: true,
  SavedObjectsMigrationVersion: true,
  LegacyServiceSetupDeps: true,
  LegacyServiceStartDeps: true,
  LegacyConfig: true,
  CoreStatus: true,
  ServiceStatus: true,
  ServiceStatusLevel: true,
  ServiceStatusLevels: true,
  StatusServiceSetup: true
};
Object.defineProperty(exports, "ACL", {
  enumerable: true,
  get: function () {
    return _saved_objects.ACL;
  }
});
Object.defineProperty(exports, "AppCategory", {
  enumerable: true,
  get: function () {
    return _types2.AppCategory;
  }
});
Object.defineProperty(exports, "AppenderConfigType", {
  enumerable: true,
  get: function () {
    return _logging.AppenderConfigType;
  }
});
Object.defineProperty(exports, "AuditTrailSetup", {
  enumerable: true,
  get: function () {
    return _audit_trail.AuditTrailSetup;
  }
});
Object.defineProperty(exports, "AuditTrailStart", {
  enumerable: true,
  get: function () {
    return _audit_trail.AuditTrailStart;
  }
});
Object.defineProperty(exports, "AuditableEvent", {
  enumerable: true,
  get: function () {
    return _audit_trail.AuditableEvent;
  }
});
Object.defineProperty(exports, "Auditor", {
  enumerable: true,
  get: function () {
    return _audit_trail.Auditor;
  }
});
Object.defineProperty(exports, "AuditorFactory", {
  enumerable: true,
  get: function () {
    return _audit_trail.AuditorFactory;
  }
});
Object.defineProperty(exports, "AuthHeaders", {
  enumerable: true,
  get: function () {
    return _http.AuthHeaders;
  }
});
Object.defineProperty(exports, "AuthNotHandled", {
  enumerable: true,
  get: function () {
    return _http.AuthNotHandled;
  }
});
Object.defineProperty(exports, "AuthRedirected", {
  enumerable: true,
  get: function () {
    return _http.AuthRedirected;
  }
});
Object.defineProperty(exports, "AuthRedirectedParams", {
  enumerable: true,
  get: function () {
    return _http.AuthRedirectedParams;
  }
});
Object.defineProperty(exports, "AuthResult", {
  enumerable: true,
  get: function () {
    return _http.AuthResult;
  }
});
Object.defineProperty(exports, "AuthResultParams", {
  enumerable: true,
  get: function () {
    return _http.AuthResultParams;
  }
});
Object.defineProperty(exports, "AuthResultType", {
  enumerable: true,
  get: function () {
    return _http.AuthResultType;
  }
});
Object.defineProperty(exports, "AuthStatus", {
  enumerable: true,
  get: function () {
    return _http.AuthStatus;
  }
});
Object.defineProperty(exports, "AuthToolkit", {
  enumerable: true,
  get: function () {
    return _http.AuthToolkit;
  }
});
Object.defineProperty(exports, "Authenticated", {
  enumerable: true,
  get: function () {
    return _http.Authenticated;
  }
});
Object.defineProperty(exports, "AuthenticationHandler", {
  enumerable: true,
  get: function () {
    return _http.AuthenticationHandler;
  }
});
Object.defineProperty(exports, "BasePath", {
  enumerable: true,
  get: function () {
    return _http.BasePath;
  }
});
Object.defineProperty(exports, "BulkGetConfigProps", {
  enumerable: true,
  get: function () {
    return _config.BulkGetConfigProps;
  }
});
Object.defineProperty(exports, "CURRENT_USER_PLACEHOLDER", {
  enumerable: true,
  get: function () {
    return _ui_settings.CURRENT_USER_PLACEHOLDER;
  }
});
Object.defineProperty(exports, "Capabilities", {
  enumerable: true,
  get: function () {
    return _capabilities.Capabilities;
  }
});
Object.defineProperty(exports, "CapabilitiesProvider", {
  enumerable: true,
  get: function () {
    return _capabilities.CapabilitiesProvider;
  }
});
Object.defineProperty(exports, "CapabilitiesSetup", {
  enumerable: true,
  get: function () {
    return _capabilities.CapabilitiesSetup;
  }
});
Object.defineProperty(exports, "CapabilitiesStart", {
  enumerable: true,
  get: function () {
    return _capabilities.CapabilitiesStart;
  }
});
Object.defineProperty(exports, "CapabilitiesSwitcher", {
  enumerable: true,
  get: function () {
    return _capabilities.CapabilitiesSwitcher;
  }
});
Object.defineProperty(exports, "ConfigDeprecation", {
  enumerable: true,
  get: function () {
    return _config.ConfigDeprecation;
  }
});
Object.defineProperty(exports, "ConfigDeprecationFactory", {
  enumerable: true,
  get: function () {
    return _config.ConfigDeprecationFactory;
  }
});
Object.defineProperty(exports, "ConfigDeprecationLogger", {
  enumerable: true,
  get: function () {
    return _config.ConfigDeprecationLogger;
  }
});
Object.defineProperty(exports, "ConfigDeprecationProvider", {
  enumerable: true,
  get: function () {
    return _config.ConfigDeprecationProvider;
  }
});
Object.defineProperty(exports, "ConfigIdentifier", {
  enumerable: true,
  get: function () {
    return _config.ConfigIdentifier;
  }
});
Object.defineProperty(exports, "ConfigPath", {
  enumerable: true,
  get: function () {
    return _config.ConfigPath;
  }
});
Object.defineProperty(exports, "ConfigService", {
  enumerable: true,
  get: function () {
    return _config.ConfigService;
  }
});
Object.defineProperty(exports, "ContextSetup", {
  enumerable: true,
  get: function () {
    return _context.ContextSetup;
  }
});
Object.defineProperty(exports, "CoreConfigUsageData", {
  enumerable: true,
  get: function () {
    return _core_usage_data.CoreConfigUsageData;
  }
});
Object.defineProperty(exports, "CoreEnvironmentUsageData", {
  enumerable: true,
  get: function () {
    return _core_usage_data.CoreEnvironmentUsageData;
  }
});
Object.defineProperty(exports, "CoreId", {
  enumerable: true,
  get: function () {
    return _core_context.CoreId;
  }
});
Object.defineProperty(exports, "CoreServicesUsageData", {
  enumerable: true,
  get: function () {
    return _core_usage_data.CoreServicesUsageData;
  }
});
Object.defineProperty(exports, "CoreStatus", {
  enumerable: true,
  get: function () {
    return _status.CoreStatus;
  }
});
Object.defineProperty(exports, "CoreUsageData", {
  enumerable: true,
  get: function () {
    return _core_usage_data.CoreUsageData;
  }
});
Object.defineProperty(exports, "CoreUsageDataStart", {
  enumerable: true,
  get: function () {
    return _core_usage_data.CoreUsageDataStart;
  }
});
Object.defineProperty(exports, "CountResponse", {
  enumerable: true,
  get: function () {
    return _opensearch.CountResponse;
  }
});
Object.defineProperty(exports, "CrossCompatibilityServiceStart", {
  enumerable: true,
  get: function () {
    return _types.CrossCompatibilityServiceStart;
  }
});
Object.defineProperty(exports, "CspConfig", {
  enumerable: true,
  get: function () {
    return _csp.CspConfig;
  }
});
Object.defineProperty(exports, "CustomHttpResponseOptions", {
  enumerable: true,
  get: function () {
    return _http.CustomHttpResponseOptions;
  }
});
Object.defineProperty(exports, "DEFAULT_APP_CATEGORIES", {
  enumerable: true,
  get: function () {
    return _utils.DEFAULT_APP_CATEGORIES;
  }
});
Object.defineProperty(exports, "DEFAULT_NAV_GROUPS", {
  enumerable: true,
  get: function () {
    return _utils.DEFAULT_NAV_GROUPS;
  }
});
Object.defineProperty(exports, "DeleteDocumentResponse", {
  enumerable: true,
  get: function () {
    return _opensearch.DeleteDocumentResponse;
  }
});
Object.defineProperty(exports, "DeprecationSettings", {
  enumerable: true,
  get: function () {
    return _ui_settings.DeprecationSettings;
  }
});
Object.defineProperty(exports, "DestructiveRouteMethod", {
  enumerable: true,
  get: function () {
    return _http.DestructiveRouteMethod;
  }
});
Object.defineProperty(exports, "DiscoveredPlugin", {
  enumerable: true,
  get: function () {
    return _plugins.DiscoveredPlugin;
  }
});
Object.defineProperty(exports, "DynamicConfigurationClientOptions", {
  enumerable: true,
  get: function () {
    return _config.DynamicConfigurationClientOptions;
  }
});
Object.defineProperty(exports, "EnvironmentMode", {
  enumerable: true,
  get: function () {
    return _config.EnvironmentMode;
  }
});
Object.defineProperty(exports, "ErrorHttpResponseOptions", {
  enumerable: true,
  get: function () {
    return _http.ErrorHttpResponseOptions;
  }
});
Object.defineProperty(exports, "Explanation", {
  enumerable: true,
  get: function () {
    return _opensearch.Explanation;
  }
});
Object.defineProperty(exports, "FakeRequest", {
  enumerable: true,
  get: function () {
    return _opensearch.FakeRequest;
  }
});
Object.defineProperty(exports, "GetAuthHeaders", {
  enumerable: true,
  get: function () {
    return _http.GetAuthHeaders;
  }
});
Object.defineProperty(exports, "GetAuthState", {
  enumerable: true,
  get: function () {
    return _http.GetAuthState;
  }
});
Object.defineProperty(exports, "GetConfigProps", {
  enumerable: true,
  get: function () {
    return _config.GetConfigProps;
  }
});
Object.defineProperty(exports, "GetResponse", {
  enumerable: true,
  get: function () {
    return _opensearch.GetResponse;
  }
});
Object.defineProperty(exports, "HandlerContextType", {
  enumerable: true,
  get: function () {
    return _context.HandlerContextType;
  }
});
Object.defineProperty(exports, "HandlerFunction", {
  enumerable: true,
  get: function () {
    return _context.HandlerFunction;
  }
});
Object.defineProperty(exports, "HandlerParameters", {
  enumerable: true,
  get: function () {
    return _context.HandlerParameters;
  }
});
Object.defineProperty(exports, "Headers", {
  enumerable: true,
  get: function () {
    return _http.Headers;
  }
});
Object.defineProperty(exports, "HttpAuth", {
  enumerable: true,
  get: function () {
    return _http.HttpAuth;
  }
});
Object.defineProperty(exports, "HttpResources", {
  enumerable: true,
  get: function () {
    return _http_resources.HttpResources;
  }
});
Object.defineProperty(exports, "HttpResourcesRenderOptions", {
  enumerable: true,
  get: function () {
    return _http_resources.HttpResourcesRenderOptions;
  }
});
Object.defineProperty(exports, "HttpResourcesRequestHandler", {
  enumerable: true,
  get: function () {
    return _http_resources.HttpResourcesRequestHandler;
  }
});
Object.defineProperty(exports, "HttpResourcesResponseOptions", {
  enumerable: true,
  get: function () {
    return _http_resources.HttpResourcesResponseOptions;
  }
});
Object.defineProperty(exports, "HttpResourcesServiceToolkit", {
  enumerable: true,
  get: function () {
    return _http_resources.HttpResourcesServiceToolkit;
  }
});
Object.defineProperty(exports, "HttpResponseOptions", {
  enumerable: true,
  get: function () {
    return _http.HttpResponseOptions;
  }
});
Object.defineProperty(exports, "HttpResponsePayload", {
  enumerable: true,
  get: function () {
    return _http.HttpResponsePayload;
  }
});
Object.defineProperty(exports, "HttpServerInfo", {
  enumerable: true,
  get: function () {
    return _http.HttpServerInfo;
  }
});
Object.defineProperty(exports, "HttpServiceSetup", {
  enumerable: true,
  get: function () {
    return _http.HttpServiceSetup;
  }
});
Object.defineProperty(exports, "HttpServiceStart", {
  enumerable: true,
  get: function () {
    return _http.HttpServiceStart;
  }
});
Object.defineProperty(exports, "IBasePath", {
  enumerable: true,
  get: function () {
    return _http.IBasePath;
  }
});
Object.defineProperty(exports, "IClusterClient", {
  enumerable: true,
  get: function () {
    return _opensearch.IClusterClient;
  }
});
Object.defineProperty(exports, "IContextContainer", {
  enumerable: true,
  get: function () {
    return _context.IContextContainer;
  }
});
Object.defineProperty(exports, "IContextProvider", {
  enumerable: true,
  get: function () {
    return _context.IContextProvider;
  }
});
Object.defineProperty(exports, "ICspConfig", {
  enumerable: true,
  get: function () {
    return _csp.ICspConfig;
  }
});
Object.defineProperty(exports, "ICustomClusterClient", {
  enumerable: true,
  get: function () {
    return _opensearch.ICustomClusterClient;
  }
});
Object.defineProperty(exports, "IDynamicConfigStoreClient", {
  enumerable: true,
  get: function () {
    return _config.IDynamicConfigStoreClient;
  }
});
Object.defineProperty(exports, "IDynamicConfigStoreClientFactory", {
  enumerable: true,
  get: function () {
    return _config.IDynamicConfigStoreClientFactory;
  }
});
Object.defineProperty(exports, "IDynamicConfigurationClient", {
  enumerable: true,
  get: function () {
    return _config.IDynamicConfigurationClient;
  }
});
Object.defineProperty(exports, "ILegacyClusterClient", {
  enumerable: true,
  get: function () {
    return _opensearch.ILegacyClusterClient;
  }
});
Object.defineProperty(exports, "ILegacyCustomClusterClient", {
  enumerable: true,
  get: function () {
    return _opensearch.ILegacyCustomClusterClient;
  }
});
Object.defineProperty(exports, "ILegacyScopedClusterClient", {
  enumerable: true,
  get: function () {
    return _opensearch.ILegacyScopedClusterClient;
  }
});
Object.defineProperty(exports, "IOpenSearchDashboardsResponse", {
  enumerable: true,
  get: function () {
    return _http.IOpenSearchDashboardsResponse;
  }
});
Object.defineProperty(exports, "IOpenSearchDashboardsSocket", {
  enumerable: true,
  get: function () {
    return _http.IOpenSearchDashboardsSocket;
  }
});
Object.defineProperty(exports, "IRenderOptions", {
  enumerable: true,
  get: function () {
    return _rendering.IRenderOptions;
  }
});
Object.defineProperty(exports, "IRouter", {
  enumerable: true,
  get: function () {
    return _http.IRouter;
  }
});
Object.defineProperty(exports, "ISavedObjectTypeRegistry", {
  enumerable: true,
  get: function () {
    return _saved_objects.ISavedObjectTypeRegistry;
  }
});
Object.defineProperty(exports, "ISavedObjectsRepository", {
  enumerable: true,
  get: function () {
    return _saved_objects.ISavedObjectsRepository;
  }
});
Object.defineProperty(exports, "IScopedClusterClient", {
  enumerable: true,
  get: function () {
    return _opensearch.IScopedClusterClient;
  }
});
Object.defineProperty(exports, "IUiSettingsClient", {
  enumerable: true,
  get: function () {
    return _ui_settings.IUiSettingsClient;
  }
});
Object.defineProperty(exports, "ImageValidation", {
  enumerable: true,
  get: function () {
    return _ui_settings.ImageValidation;
  }
});
Object.defineProperty(exports, "IsAuthenticated", {
  enumerable: true,
  get: function () {
    return _http.IsAuthenticated;
  }
});
Object.defineProperty(exports, "KnownHeaders", {
  enumerable: true,
  get: function () {
    return _http.KnownHeaders;
  }
});
Object.defineProperty(exports, "LegacyAPICaller", {
  enumerable: true,
  get: function () {
    return _opensearch.LegacyAPICaller;
  }
});
Object.defineProperty(exports, "LegacyClusterClient", {
  enumerable: true,
  get: function () {
    return _opensearch.LegacyClusterClient;
  }
});
Object.defineProperty(exports, "LegacyConfig", {
  enumerable: true,
  get: function () {
    return _legacy.LegacyConfig;
  }
});
Object.defineProperty(exports, "LegacyOpenSearchClientConfig", {
  enumerable: true,
  get: function () {
    return _opensearch.LegacyOpenSearchClientConfig;
  }
});
Object.defineProperty(exports, "LegacyOpenSearchError", {
  enumerable: true,
  get: function () {
    return _opensearch.LegacyOpenSearchError;
  }
});
Object.defineProperty(exports, "LegacyOpenSearchErrorHelpers", {
  enumerable: true,
  get: function () {
    return _opensearch.LegacyOpenSearchErrorHelpers;
  }
});
Object.defineProperty(exports, "LegacyRequest", {
  enumerable: true,
  get: function () {
    return _http.LegacyRequest;
  }
});
Object.defineProperty(exports, "LegacyScopedClusterClient", {
  enumerable: true,
  get: function () {
    return _opensearch.LegacyScopedClusterClient;
  }
});
Object.defineProperty(exports, "LegacyServiceSetupDeps", {
  enumerable: true,
  get: function () {
    return _legacy.LegacyServiceSetupDeps;
  }
});
Object.defineProperty(exports, "LegacyServiceStartDeps", {
  enumerable: true,
  get: function () {
    return _legacy.LegacyServiceStartDeps;
  }
});
Object.defineProperty(exports, "LifecycleResponseFactory", {
  enumerable: true,
  get: function () {
    return _http.LifecycleResponseFactory;
  }
});
Object.defineProperty(exports, "LogLevel", {
  enumerable: true,
  get: function () {
    return _logging.LogLevel;
  }
});
Object.defineProperty(exports, "LogMeta", {
  enumerable: true,
  get: function () {
    return _logging.LogMeta;
  }
});
Object.defineProperty(exports, "LogRecord", {
  enumerable: true,
  get: function () {
    return _logging.LogRecord;
  }
});
Object.defineProperty(exports, "Logger", {
  enumerable: true,
  get: function () {
    return _logging.Logger;
  }
});
Object.defineProperty(exports, "LoggerConfigType", {
  enumerable: true,
  get: function () {
    return _logging.LoggerConfigType;
  }
});
Object.defineProperty(exports, "LoggerContextConfigInput", {
  enumerable: true,
  get: function () {
    return _logging.LoggerContextConfigInput;
  }
});
Object.defineProperty(exports, "LoggerFactory", {
  enumerable: true,
  get: function () {
    return _logging.LoggerFactory;
  }
});
Object.defineProperty(exports, "LoggingServiceSetup", {
  enumerable: true,
  get: function () {
    return _logging.LoggingServiceSetup;
  }
});
Object.defineProperty(exports, "MetricsServiceSetup", {
  enumerable: true,
  get: function () {
    return _metrics.MetricsServiceSetup;
  }
});
Object.defineProperty(exports, "MetricsServiceStart", {
  enumerable: true,
  get: function () {
    return _metrics.MetricsServiceStart;
  }
});
Object.defineProperty(exports, "MutatingOperationRefreshSetting", {
  enumerable: true,
  get: function () {
    return _types3.MutatingOperationRefreshSetting;
  }
});
Object.defineProperty(exports, "NodesVersionCompatibility", {
  enumerable: true,
  get: function () {
    return _opensearch.NodesVersionCompatibility;
  }
});
Object.defineProperty(exports, "OnPostAuthHandler", {
  enumerable: true,
  get: function () {
    return _http.OnPostAuthHandler;
  }
});
Object.defineProperty(exports, "OnPostAuthToolkit", {
  enumerable: true,
  get: function () {
    return _http.OnPostAuthToolkit;
  }
});
Object.defineProperty(exports, "OnPreAuthHandler", {
  enumerable: true,
  get: function () {
    return _http.OnPreAuthHandler;
  }
});
Object.defineProperty(exports, "OnPreAuthToolkit", {
  enumerable: true,
  get: function () {
    return _http.OnPreAuthToolkit;
  }
});
Object.defineProperty(exports, "OnPreResponseExtensions", {
  enumerable: true,
  get: function () {
    return _http.OnPreResponseExtensions;
  }
});
Object.defineProperty(exports, "OnPreResponseHandler", {
  enumerable: true,
  get: function () {
    return _http.OnPreResponseHandler;
  }
});
Object.defineProperty(exports, "OnPreResponseInfo", {
  enumerable: true,
  get: function () {
    return _http.OnPreResponseInfo;
  }
});
Object.defineProperty(exports, "OnPreResponseRender", {
  enumerable: true,
  get: function () {
    return _http.OnPreResponseRender;
  }
});
Object.defineProperty(exports, "OnPreResponseToolkit", {
  enumerable: true,
  get: function () {
    return _http.OnPreResponseToolkit;
  }
});
Object.defineProperty(exports, "OnPreRoutingHandler", {
  enumerable: true,
  get: function () {
    return _http.OnPreRoutingHandler;
  }
});
Object.defineProperty(exports, "OnPreRoutingToolkit", {
  enumerable: true,
  get: function () {
    return _http.OnPreRoutingToolkit;
  }
});
Object.defineProperty(exports, "OpenSearchClient", {
  enumerable: true,
  get: function () {
    return _opensearch.OpenSearchClient;
  }
});
Object.defineProperty(exports, "OpenSearchClientConfig", {
  enumerable: true,
  get: function () {
    return _opensearch.OpenSearchClientConfig;
  }
});
Object.defineProperty(exports, "OpenSearchConfig", {
  enumerable: true,
  get: function () {
    return _opensearch.OpenSearchConfig;
  }
});
Object.defineProperty(exports, "OpenSearchDashboardsRequest", {
  enumerable: true,
  get: function () {
    return _http.OpenSearchDashboardsRequest;
  }
});
Object.defineProperty(exports, "OpenSearchDashboardsRequestEvents", {
  enumerable: true,
  get: function () {
    return _http.OpenSearchDashboardsRequestEvents;
  }
});
Object.defineProperty(exports, "OpenSearchDashboardsRequestRoute", {
  enumerable: true,
  get: function () {
    return _http.OpenSearchDashboardsRequestRoute;
  }
});
Object.defineProperty(exports, "OpenSearchDashboardsRequestRouteOptions", {
  enumerable: true,
  get: function () {
    return _http.OpenSearchDashboardsRequestRouteOptions;
  }
});
Object.defineProperty(exports, "OpenSearchDashboardsResponseFactory", {
  enumerable: true,
  get: function () {
    return _http.OpenSearchDashboardsResponseFactory;
  }
});
Object.defineProperty(exports, "OpenSearchServiceSetup", {
  enumerable: true,
  get: function () {
    return _opensearch.OpenSearchServiceSetup;
  }
});
Object.defineProperty(exports, "OpenSearchServiceStart", {
  enumerable: true,
  get: function () {
    return _opensearch.OpenSearchServiceStart;
  }
});
Object.defineProperty(exports, "OpenSearchStatusMeta", {
  enumerable: true,
  get: function () {
    return _opensearch.OpenSearchStatusMeta;
  }
});
Object.defineProperty(exports, "OpsMetrics", {
  enumerable: true,
  get: function () {
    return _metrics.OpsMetrics;
  }
});
Object.defineProperty(exports, "OpsOsMetrics", {
  enumerable: true,
  get: function () {
    return _metrics.OpsOsMetrics;
  }
});
Object.defineProperty(exports, "OpsProcessMetrics", {
  enumerable: true,
  get: function () {
    return _metrics.OpsProcessMetrics;
  }
});
Object.defineProperty(exports, "OpsServerMetrics", {
  enumerable: true,
  get: function () {
    return _metrics.OpsServerMetrics;
  }
});
Object.defineProperty(exports, "PackageInfo", {
  enumerable: true,
  get: function () {
    return _config.PackageInfo;
  }
});
Object.defineProperty(exports, "PermissionModeId", {
  enumerable: true,
  get: function () {
    return _types2.PermissionModeId;
  }
});
Object.defineProperty(exports, "Permissions", {
  enumerable: true,
  get: function () {
    return _saved_objects.Permissions;
  }
});
Object.defineProperty(exports, "Plugin", {
  enumerable: true,
  get: function () {
    return _plugins.Plugin;
  }
});
Object.defineProperty(exports, "PluginConfigDescriptor", {
  enumerable: true,
  get: function () {
    return _plugins.PluginConfigDescriptor;
  }
});
Object.defineProperty(exports, "PluginConfigSchema", {
  enumerable: true,
  get: function () {
    return _plugins.PluginConfigSchema;
  }
});
Object.defineProperty(exports, "PluginInitializer", {
  enumerable: true,
  get: function () {
    return _plugins.PluginInitializer;
  }
});
Object.defineProperty(exports, "PluginInitializerContext", {
  enumerable: true,
  get: function () {
    return _plugins.PluginInitializerContext;
  }
});
Object.defineProperty(exports, "PluginManifest", {
  enumerable: true,
  get: function () {
    return _plugins.PluginManifest;
  }
});
Object.defineProperty(exports, "PluginName", {
  enumerable: true,
  get: function () {
    return _plugins.PluginName;
  }
});
Object.defineProperty(exports, "PluginOpaqueId", {
  enumerable: true,
  get: function () {
    return _plugins.PluginOpaqueId;
  }
});
Object.defineProperty(exports, "PluginsServiceSetup", {
  enumerable: true,
  get: function () {
    return _plugins.PluginsServiceSetup;
  }
});
Object.defineProperty(exports, "PluginsServiceStart", {
  enumerable: true,
  get: function () {
    return _plugins.PluginsServiceStart;
  }
});
Object.defineProperty(exports, "PrincipalType", {
  enumerable: true,
  get: function () {
    return _saved_objects.PrincipalType;
  }
});
Object.defineProperty(exports, "Principals", {
  enumerable: true,
  get: function () {
    return _saved_objects.Principals;
  }
});
Object.defineProperty(exports, "PublicUiSettingsParams", {
  enumerable: true,
  get: function () {
    return _ui_settings.PublicUiSettingsParams;
  }
});
Object.defineProperty(exports, "RedirectResponseOptions", {
  enumerable: true,
  get: function () {
    return _http.RedirectResponseOptions;
  }
});
Object.defineProperty(exports, "RequestHandler", {
  enumerable: true,
  get: function () {
    return _http.RequestHandler;
  }
});
Object.defineProperty(exports, "RequestHandlerContextContainer", {
  enumerable: true,
  get: function () {
    return _http.RequestHandlerContextContainer;
  }
});
Object.defineProperty(exports, "RequestHandlerContextProvider", {
  enumerable: true,
  get: function () {
    return _http.RequestHandlerContextProvider;
  }
});
Object.defineProperty(exports, "RequestHandlerWrapper", {
  enumerable: true,
  get: function () {
    return _http.RequestHandlerWrapper;
  }
});
Object.defineProperty(exports, "ResponseError", {
  enumerable: true,
  get: function () {
    return _http.ResponseError;
  }
});
Object.defineProperty(exports, "ResponseErrorAttributes", {
  enumerable: true,
  get: function () {
    return _http.ResponseErrorAttributes;
  }
});
Object.defineProperty(exports, "ResponseHeaders", {
  enumerable: true,
  get: function () {
    return _http.ResponseHeaders;
  }
});
Object.defineProperty(exports, "RouteConfig", {
  enumerable: true,
  get: function () {
    return _http.RouteConfig;
  }
});
Object.defineProperty(exports, "RouteConfigOptions", {
  enumerable: true,
  get: function () {
    return _http.RouteConfigOptions;
  }
});
Object.defineProperty(exports, "RouteConfigOptionsBody", {
  enumerable: true,
  get: function () {
    return _http.RouteConfigOptionsBody;
  }
});
Object.defineProperty(exports, "RouteContentType", {
  enumerable: true,
  get: function () {
    return _http.RouteContentType;
  }
});
Object.defineProperty(exports, "RouteMethod", {
  enumerable: true,
  get: function () {
    return _http.RouteMethod;
  }
});
Object.defineProperty(exports, "RouteRegistrar", {
  enumerable: true,
  get: function () {
    return _http.RouteRegistrar;
  }
});
Object.defineProperty(exports, "RouteValidationError", {
  enumerable: true,
  get: function () {
    return _http.RouteValidationError;
  }
});
Object.defineProperty(exports, "RouteValidationFunction", {
  enumerable: true,
  get: function () {
    return _http.RouteValidationFunction;
  }
});
Object.defineProperty(exports, "RouteValidationResultFactory", {
  enumerable: true,
  get: function () {
    return _http.RouteValidationResultFactory;
  }
});
Object.defineProperty(exports, "RouteValidationSpec", {
  enumerable: true,
  get: function () {
    return _http.RouteValidationSpec;
  }
});
Object.defineProperty(exports, "RouteValidatorConfig", {
  enumerable: true,
  get: function () {
    return _http.RouteValidatorConfig;
  }
});
Object.defineProperty(exports, "RouteValidatorFullConfig", {
  enumerable: true,
  get: function () {
    return _http.RouteValidatorFullConfig;
  }
});
Object.defineProperty(exports, "RouteValidatorOptions", {
  enumerable: true,
  get: function () {
    return _http.RouteValidatorOptions;
  }
});
Object.defineProperty(exports, "SafeRouteMethod", {
  enumerable: true,
  get: function () {
    return _http.SafeRouteMethod;
  }
});
Object.defineProperty(exports, "SavedObject", {
  enumerable: true,
  get: function () {
    return _types3.SavedObject;
  }
});
Object.defineProperty(exports, "SavedObjectAttribute", {
  enumerable: true,
  get: function () {
    return _types3.SavedObjectAttribute;
  }
});
Object.defineProperty(exports, "SavedObjectAttributeSingle", {
  enumerable: true,
  get: function () {
    return _types3.SavedObjectAttributeSingle;
  }
});
Object.defineProperty(exports, "SavedObjectAttributes", {
  enumerable: true,
  get: function () {
    return _types3.SavedObjectAttributes;
  }
});
Object.defineProperty(exports, "SavedObjectMigrationContext", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectMigrationContext;
  }
});
Object.defineProperty(exports, "SavedObjectMigrationFn", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectMigrationFn;
  }
});
Object.defineProperty(exports, "SavedObjectMigrationMap", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectMigrationMap;
  }
});
Object.defineProperty(exports, "SavedObjectReference", {
  enumerable: true,
  get: function () {
    return _types3.SavedObjectReference;
  }
});
Object.defineProperty(exports, "SavedObjectSanitizedDoc", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectSanitizedDoc;
  }
});
Object.defineProperty(exports, "SavedObjectStatusMeta", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectStatusMeta;
  }
});
Object.defineProperty(exports, "SavedObjectTypeRegistry", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectTypeRegistry;
  }
});
Object.defineProperty(exports, "SavedObjectUnsanitizedDoc", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectUnsanitizedDoc;
  }
});
Object.defineProperty(exports, "SavedObjectsAddToNamespacesOptions", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsAddToNamespacesOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsAddToNamespacesResponse", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsAddToNamespacesResponse;
  }
});
Object.defineProperty(exports, "SavedObjectsBaseOptions", {
  enumerable: true,
  get: function () {
    return _types3.SavedObjectsBaseOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsBulkCreateObject", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsBulkCreateObject;
  }
});
Object.defineProperty(exports, "SavedObjectsBulkGetObject", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsBulkGetObject;
  }
});
Object.defineProperty(exports, "SavedObjectsBulkResponse", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsBulkResponse;
  }
});
Object.defineProperty(exports, "SavedObjectsBulkUpdateObject", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsBulkUpdateObject;
  }
});
Object.defineProperty(exports, "SavedObjectsBulkUpdateOptions", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsBulkUpdateOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsBulkUpdateResponse", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsBulkUpdateResponse;
  }
});
Object.defineProperty(exports, "SavedObjectsCheckConflictsObject", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsCheckConflictsObject;
  }
});
Object.defineProperty(exports, "SavedObjectsCheckConflictsResponse", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsCheckConflictsResponse;
  }
});
Object.defineProperty(exports, "SavedObjectsClient", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsClient;
  }
});
Object.defineProperty(exports, "SavedObjectsClientContract", {
  enumerable: true,
  get: function () {
    return _types3.SavedObjectsClientContract;
  }
});
Object.defineProperty(exports, "SavedObjectsClientFactory", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsClientFactory;
  }
});
Object.defineProperty(exports, "SavedObjectsClientFactoryProvider", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsClientFactoryProvider;
  }
});
Object.defineProperty(exports, "SavedObjectsClientProviderOptions", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsClientProviderOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsClientWrapperFactory", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsClientWrapperFactory;
  }
});
Object.defineProperty(exports, "SavedObjectsClientWrapperOptions", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsClientWrapperOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsCreateOptions", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsCreateOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsDeleteByNamespaceOptions", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsDeleteByNamespaceOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsDeleteByWorkspaceOptions", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsDeleteByWorkspaceOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsDeleteFromNamespacesOptions", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsDeleteFromNamespacesOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsDeleteFromNamespacesResponse", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsDeleteFromNamespacesResponse;
  }
});
Object.defineProperty(exports, "SavedObjectsDeleteOptions", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsDeleteOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsErrorHelpers", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsErrorHelpers;
  }
});
Object.defineProperty(exports, "SavedObjectsExportOptions", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsExportOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsExportResultDetails", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsExportResultDetails;
  }
});
Object.defineProperty(exports, "SavedObjectsFieldMapping", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsFieldMapping;
  }
});
Object.defineProperty(exports, "SavedObjectsFindOptions", {
  enumerable: true,
  get: function () {
    return _types3.SavedObjectsFindOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsFindResponse", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsFindResponse;
  }
});
Object.defineProperty(exports, "SavedObjectsFindResult", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsFindResult;
  }
});
Object.defineProperty(exports, "SavedObjectsImportAmbiguousConflictError", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsImportAmbiguousConflictError;
  }
});
Object.defineProperty(exports, "SavedObjectsImportConflictError", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsImportConflictError;
  }
});
Object.defineProperty(exports, "SavedObjectsImportError", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsImportError;
  }
});
Object.defineProperty(exports, "SavedObjectsImportMissingReferencesError", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsImportMissingReferencesError;
  }
});
Object.defineProperty(exports, "SavedObjectsImportOptions", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsImportOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsImportResponse", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsImportResponse;
  }
});
Object.defineProperty(exports, "SavedObjectsImportRetry", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsImportRetry;
  }
});
Object.defineProperty(exports, "SavedObjectsImportSuccess", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsImportSuccess;
  }
});
Object.defineProperty(exports, "SavedObjectsImportUnknownError", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsImportUnknownError;
  }
});
Object.defineProperty(exports, "SavedObjectsImportUnsupportedTypeError", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsImportUnsupportedTypeError;
  }
});
Object.defineProperty(exports, "SavedObjectsIncrementCounterOptions", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsIncrementCounterOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsMappingProperties", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsMappingProperties;
  }
});
Object.defineProperty(exports, "SavedObjectsMigrationLogger", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsMigrationLogger;
  }
});
Object.defineProperty(exports, "SavedObjectsMigrationVersion", {
  enumerable: true,
  get: function () {
    return _types3.SavedObjectsMigrationVersion;
  }
});
Object.defineProperty(exports, "SavedObjectsNamespaceType", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsNamespaceType;
  }
});
Object.defineProperty(exports, "SavedObjectsRawDoc", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsRawDoc;
  }
});
Object.defineProperty(exports, "SavedObjectsRepository", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsRepository;
  }
});
Object.defineProperty(exports, "SavedObjectsRepositoryFactory", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsRepositoryFactory;
  }
});
Object.defineProperty(exports, "SavedObjectsResolveImportErrorsOptions", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsResolveImportErrorsOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsSerializer", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsSerializer;
  }
});
Object.defineProperty(exports, "SavedObjectsServiceSetup", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsServiceSetup;
  }
});
Object.defineProperty(exports, "SavedObjectsServiceStart", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsServiceStart;
  }
});
Object.defineProperty(exports, "SavedObjectsType", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsType;
  }
});
Object.defineProperty(exports, "SavedObjectsTypeManagementDefinition", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsTypeManagementDefinition;
  }
});
Object.defineProperty(exports, "SavedObjectsTypeMappingDefinition", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsTypeMappingDefinition;
  }
});
Object.defineProperty(exports, "SavedObjectsUpdateOptions", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsUpdateOptions;
  }
});
Object.defineProperty(exports, "SavedObjectsUpdateResponse", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsUpdateResponse;
  }
});
Object.defineProperty(exports, "SavedObjectsUtils", {
  enumerable: true,
  get: function () {
    return _saved_objects.SavedObjectsUtils;
  }
});
Object.defineProperty(exports, "ScopeableRequest", {
  enumerable: true,
  get: function () {
    return _opensearch.ScopeableRequest;
  }
});
Object.defineProperty(exports, "SearchResponse", {
  enumerable: true,
  get: function () {
    return _opensearch.SearchResponse;
  }
});
Object.defineProperty(exports, "ServiceStatus", {
  enumerable: true,
  get: function () {
    return _status.ServiceStatus;
  }
});
Object.defineProperty(exports, "ServiceStatusLevel", {
  enumerable: true,
  get: function () {
    return _status.ServiceStatusLevel;
  }
});
Object.defineProperty(exports, "ServiceStatusLevels", {
  enumerable: true,
  get: function () {
    return _status.ServiceStatusLevels;
  }
});
Object.defineProperty(exports, "SessionCookieValidationResult", {
  enumerable: true,
  get: function () {
    return _http.SessionCookieValidationResult;
  }
});
Object.defineProperty(exports, "SessionStorage", {
  enumerable: true,
  get: function () {
    return _http.SessionStorage;
  }
});
Object.defineProperty(exports, "SessionStorageCookieOptions", {
  enumerable: true,
  get: function () {
    return _http.SessionStorageCookieOptions;
  }
});
Object.defineProperty(exports, "SessionStorageFactory", {
  enumerable: true,
  get: function () {
    return _http.SessionStorageFactory;
  }
});
Object.defineProperty(exports, "ShardsInfo", {
  enumerable: true,
  get: function () {
    return _opensearch.ShardsInfo;
  }
});
Object.defineProperty(exports, "ShardsResponse", {
  enumerable: true,
  get: function () {
    return _opensearch.ShardsResponse;
  }
});
Object.defineProperty(exports, "SharedGlobalConfig", {
  enumerable: true,
  get: function () {
    return _plugins.SharedGlobalConfig;
  }
});
Object.defineProperty(exports, "StatusServiceSetup", {
  enumerable: true,
  get: function () {
    return _status.StatusServiceSetup;
  }
});
Object.defineProperty(exports, "StringValidation", {
  enumerable: true,
  get: function () {
    return _ui_settings.StringValidation;
  }
});
Object.defineProperty(exports, "StringValidationRegex", {
  enumerable: true,
  get: function () {
    return _ui_settings.StringValidationRegex;
  }
});
Object.defineProperty(exports, "StringValidationRegexString", {
  enumerable: true,
  get: function () {
    return _ui_settings.StringValidationRegexString;
  }
});
Object.defineProperty(exports, "UiSettingScope", {
  enumerable: true,
  get: function () {
    return _ui_settings.UiSettingScope;
  }
});
Object.defineProperty(exports, "UiSettingsParams", {
  enumerable: true,
  get: function () {
    return _ui_settings.UiSettingsParams;
  }
});
Object.defineProperty(exports, "UiSettingsServiceSetup", {
  enumerable: true,
  get: function () {
    return _ui_settings.UiSettingsServiceSetup;
  }
});
Object.defineProperty(exports, "UiSettingsServiceStart", {
  enumerable: true,
  get: function () {
    return _ui_settings.UiSettingsServiceStart;
  }
});
Object.defineProperty(exports, "UiSettingsType", {
  enumerable: true,
  get: function () {
    return _ui_settings.UiSettingsType;
  }
});
Object.defineProperty(exports, "UserProvidedValues", {
  enumerable: true,
  get: function () {
    return _ui_settings.UserProvidedValues;
  }
});
Object.defineProperty(exports, "WORKSPACE_TYPE", {
  enumerable: true,
  get: function () {
    return _utils.WORKSPACE_TYPE;
  }
});
Object.defineProperty(exports, "WorkspaceAttribute", {
  enumerable: true,
  get: function () {
    return _types2.WorkspaceAttribute;
  }
});
Object.defineProperty(exports, "bootstrap", {
  enumerable: true,
  get: function () {
    return _bootstrap.bootstrap;
  }
});
exports.config = void 0;
Object.defineProperty(exports, "exportSavedObjectsToStream", {
  enumerable: true,
  get: function () {
    return _saved_objects.exportSavedObjectsToStream;
  }
});
Object.defineProperty(exports, "extractTimelineExpression", {
  enumerable: true,
  get: function () {
    return _saved_objects.extractTimelineExpression;
  }
});
Object.defineProperty(exports, "extractVegaSpecFromSavedObject", {
  enumerable: true,
  get: function () {
    return _saved_objects.extractVegaSpecFromSavedObject;
  }
});
Object.defineProperty(exports, "importSavedObjectsFromStream", {
  enumerable: true,
  get: function () {
    return _saved_objects.importSavedObjectsFromStream;
  }
});
Object.defineProperty(exports, "opensearchDashboardsResponseFactory", {
  enumerable: true,
  get: function () {
    return _http.opensearchDashboardsResponseFactory;
  }
});
Object.defineProperty(exports, "resolveSavedObjectsImportErrors", {
  enumerable: true,
  get: function () {
    return _saved_objects.resolveSavedObjectsImportErrors;
  }
});
Object.defineProperty(exports, "updateDataSourceNameInTimeline", {
  enumerable: true,
  get: function () {
    return _saved_objects.updateDataSourceNameInTimeline;
  }
});
Object.defineProperty(exports, "updateDataSourceNameInVegaSpec", {
  enumerable: true,
  get: function () {
    return _saved_objects.updateDataSourceNameInVegaSpec;
  }
});
Object.defineProperty(exports, "validBodyOutput", {
  enumerable: true,
  get: function () {
    return _http.validBodyOutput;
  }
});
var _opensearch = require("./opensearch");
var _http_resources = require("./http_resources");
var _plugins = require("./plugins");
var _context = require("./context");
var _capabilities = require("./capabilities");
var _audit_trail = require("./audit_trail");
var _logging = require("./logging");
var _types = require("./cross_compatibility/types");
var _core_usage_data = require("./core_usage_data");
var _bootstrap = require("./bootstrap");
var _config = require("./config");
var _core_context = require("./core_context");
var _csp = require("./csp");
var _api_types = require("./opensearch/legacy/api_types");
Object.keys(_api_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _api_types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _api_types[key];
    }
  });
});
var _http = require("./http");
var _rendering = require("./rendering");
var _saved_objects = require("./saved_objects");
var _ui_settings = require("./ui_settings");
var _metrics = require("./metrics");
var _types2 = require("../types");
var _utils = require("../utils");
var _types3 = require("./types");
var _legacy = require("./legacy");
var _status = require("./status");
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
 * The OpenSearch Dashboards Core APIs for server-side plugins.
 *
 * A plugin requires a `opensearch_dashboards.json` file at it's root directory that follows
 * {@link PluginManifest | the manfiest schema} to define static plugin
 * information required to load the plugin.
 *
 * A plugin's `server/index` file must contain a named import, `plugin`, that
 * implements {@link PluginInitializer} which returns an object that implements
 * {@link Plugin}.
 *
 * The plugin integrates with the core system via lifecycle events: `setup`,
 * `start`, and `stop`. In each lifecycle method, the plugin will receive the
 * corresponding core services available (either {@link CoreSetup} or
 * {@link CoreStart}) and any interfaces returned by dependency plugins'
 * lifecycle method. Anything returned by the plugin's lifecycle method will be
 * exposed to downstream dependencies when their corresponding lifecycle methods
 * are invoked.
 *
 * @packageDocumentation
 */

// Because of #79265 we need to explicity import, then export these types for
// scripts/telemetry_check.js to work as expected

/**
 * Plugin specific context passed to a route handler.
 *
 * Provides the following clients and services:
 *    - {@link SavedObjectsClient | savedObjects.client} - Saved Objects client
 *      which uses the credentials of the incoming request
 *    - {@link ISavedObjectTypeRegistry | savedObjects.typeRegistry} - Type registry containing
 *      all the registered types.
 *    - {@link IScopedClusterClient | opensearch.client} - OpenSearch
 *      data client which uses the credentials of the incoming request
 *    - {@link LegacyScopedClusterClient | opensearch.legacy.client} - The legacy OpenSearch
 *      data client which uses the credentials of the incoming request
 *    - {@link IUiSettingsClient | uiSettings.client} - uiSettings client
 *      which uses the credentials of the incoming request
 *    - {@link Auditor | uiSettings.auditor} - AuditTrail client scoped to the incoming request
 *    - {@link IDynamicConfigurationClient | dynamicConfig.client} - Dynamic configuration client
 *
 * @public
 */

/**
 * Context passed to the plugins `setup` method.
 *
 * @typeParam TPluginsStart - the type of the consuming plugin's start dependencies. Should be the same
 *                            as the consuming {@link Plugin}'s `TPluginsStart` type. Used by `getStartServices`.
 * @typeParam TStart - the type of the consuming plugin's start contract. Should be the same as the
 *                     consuming {@link Plugin}'s `TStart` type. Used by `getStartServices`.
 * @public
 */

/**
 * Allows plugins to get access to APIs available in start inside async handlers.
 * Promise will not resolve until Core and plugin dependencies have completed `start`.
 * This should only be used inside handlers registered during `setup` that will only be executed
 * after `start` lifecycle.
 *
 * @public
 */

/**
 * Context passed to the plugins `start` method.
 *
 * @public
 */

/**
 * Config schemas for the platform services.
 *
 * @alpha
 */
const config = exports.config = {
  opensearch: {
    schema: _opensearch.configSchema
  },
  logging: {
    appenders: _logging.appendersSchema
  }
};