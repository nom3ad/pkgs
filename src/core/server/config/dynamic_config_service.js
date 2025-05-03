"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DynamicConfigService = void 0;
var _async_hooks = require("async_hooks");
var _operators = require("rxjs/operators");
var _internal_dynamic_configuration_client = require("./service/internal_dynamic_configuration_client");
var _utils = require("./utils/utils");
var _dynamic_configuration_client = require("./service/dynamic_configuration_client");
var _opensearch_config_store_factory = require("./service/config_store_client/opensearch_config_store_factory");
var _dummy_config_store_factory = require("./service/config_store_client/dummy_config_store_factory");
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet2(e, t) { var r = _classPrivateFieldGet(t, e); return _classApplyDescriptorGet(e, r); }
function _classApplyDescriptorGet(e, t) { return t.get ? t.get.call(e) : t.value; }
function _classPrivateFieldSet(e, t, r) { var s = _classPrivateFieldGet(t, e); return _classApplyDescriptorSet(e, s, r), r; }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function _classApplyDescriptorSet(e, t, l) { if (t.set) t.set.call(e, l);else { if (!t.writable) throw new TypeError("attempted to set read only private field"); t.value = l; } } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
var _configService = /*#__PURE__*/new WeakMap();
var _envService = /*#__PURE__*/new WeakMap();
var _logger = /*#__PURE__*/new WeakMap();
var _schemas = /*#__PURE__*/new WeakMap();
var _config$ = /*#__PURE__*/new WeakMap();
var _asyncLocalStorage = /*#__PURE__*/new WeakMap();
var _requestHeaders = /*#__PURE__*/new WeakMap();
var _configStoreClientFactory = /*#__PURE__*/new WeakMap();
var _started = /*#__PURE__*/new WeakMap();
var _startPromiseResolver = /*#__PURE__*/new WeakMap();
var _startPromise = /*#__PURE__*/new WeakMap();
/** @internal */
class DynamicConfigService {
  constructor(configService, envService, logger) {
    _classPrivateFieldInitSpec(this, _configService, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _envService, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _logger, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _schemas, {
      writable: true,
      value: new Map()
    });
    _classPrivateFieldInitSpec(this, _config$, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _asyncLocalStorage, {
      writable: true,
      value: new _async_hooks.AsyncLocalStorage()
    });
    _classPrivateFieldInitSpec(this, _requestHeaders, {
      writable: true,
      value: []
    });
    _classPrivateFieldInitSpec(this, _configStoreClientFactory, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _started, {
      writable: true,
      value: false
    });
    _classPrivateFieldInitSpec(this, _startPromiseResolver, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _startPromise, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet(this, _configService, configService);
    _classPrivateFieldSet(this, _envService, envService);
    _classPrivateFieldSet(this, _logger, logger.get('dynamic-config-service'));
    _classPrivateFieldSet(this, _startPromise, new Promise(resolve => _classPrivateFieldSet(this, _startPromiseResolver, resolve)));
    _classPrivateFieldSet(this, _config$, configService.atPath('dynamic_config_service').pipe((0, _operators.first)()));
  }
  async setup() {
    return {
      registerDynamicConfigClientFactory: factory => {
        if (_classPrivateFieldGet2(this, _configStoreClientFactory)) {
          throw new Error('Dynamic config store client factory is already set');
        }
        if (_classPrivateFieldGet2(this, _started)) {
          throw new Error('Cannot set config store client factory because dynamic configuration service has already started');
        }
        _classPrivateFieldSet(this, _configStoreClientFactory, factory);
      },
      registerAsyncLocalStoreRequestHeader: key => {
        if (typeof key === 'string') {
          _classPrivateFieldGet2(this, _requestHeaders).push(key);
        } else {
          _classPrivateFieldGet2(this, _requestHeaders).push(...key);
        }
      },
      getStartService: async () => {
        return await _classPrivateFieldGet2(this, _startPromise);
      }
    };
  }
  async start({
    opensearch
  }) {
    _classPrivateFieldGet2(this, _logger).info('initiating start()');
    const config = await _classPrivateFieldGet2(this, _config$).pipe((0, _operators.first)()).toPromise();
    let configStoreClient;
    if (!config.enabled) {
      const dummyDynamicConfigStoreClientFactory = new _dummy_config_store_factory.DummyDynamicConfigStoreFactory();
      configStoreClient = dummyDynamicConfigStoreClientFactory.create();
    } else {
      if (_classPrivateFieldGet2(this, _configStoreClientFactory)) {
        configStoreClient = _classPrivateFieldGet2(this, _configStoreClientFactory).create();
      } else {
        const defaultDynamicConfigStoreClientFactory = new _opensearch_config_store_factory.OpenSearchDynamicConfigStoreFactory(opensearch);
        const defaultConfigStoreClient = defaultDynamicConfigStoreClientFactory.create();
        if (!config.skipMigrations) {
          await defaultConfigStoreClient.createDynamicConfigIndex();
        }
        configStoreClient = defaultConfigStoreClient;
      }
    }

    // Create the clients
    const internalClient = new _internal_dynamic_configuration_client.InternalDynamicConfigurationClient({
      client: configStoreClient,
      configService: _classPrivateFieldGet2(this, _configService),
      env: _classPrivateFieldGet2(this, _envService),
      logger: _classPrivateFieldGet2(this, _logger),
      schemas: _classPrivateFieldGet2(this, _schemas)
    });
    const client = new _dynamic_configuration_client.DynamicConfigurationClient(internalClient);
    const startServices = {
      getClient: () => {
        return client;
      },
      getAsyncLocalStore: () => {
        return _classPrivateFieldGet2(this, _asyncLocalStorage).getStore();
      },
      createStoreFromRequest: request => {
        return (0, _utils.createLocalStoreFromOsdRequest)(_classPrivateFieldGet2(this, _logger), request, _classPrivateFieldGet2(this, _requestHeaders));
      }
    };
    _classPrivateFieldGet2(this, _logger).info('finished start()');
    _classPrivateFieldSet(this, _started, true);
    if (_classPrivateFieldGet2(this, _startPromiseResolver)) {
      _classPrivateFieldGet2(this, _startPromiseResolver).call(this, startServices);
    }
    return startServices;
  }

  /**
   * Extra setup step to register any HTTP routes and the async local store. This should be called after all plugins are setup but before dynamicConfigService is started
   *
   * @param setupDeps
   */
  async registerRoutesAndHandlers(setupDeps) {
    const {
      http
    } = setupDeps;

    /**
     * TODO Register the routes
     *  - validate (needed for CP)
     *  - Optional:
     *    - create
     *    - bulkCreate
     *    - get
     *    - bulkGet
     *    - list
     *    - delete
     *    - bulkDelete
     */

    // FIXME: This seems not working as expected, as sometimes the context is not available to request handlers after registering
    //        in the PostAuth handler. Needs to do more research.
    //        For now, we can use DynamicConfigService.createStoreFromRequest(request) to create context store when it needs to
    //        fetch configrations from DynamicConfigStore.
    _classPrivateFieldGet2(this, _logger).info('registering middleware to inject context to AsyncLocalStorage');
    http.registerOnPostAuth((request, response, context) => {
      if (request.auth.isAuthenticated) {
        const localStore = (0, _utils.createLocalStoreFromOsdRequest)(_classPrivateFieldGet2(this, _logger), request, _classPrivateFieldGet2(this, _requestHeaders));
        _classPrivateFieldGet2(this, _asyncLocalStorage).enterWith(localStore);
      }
      return context.next();
    });
  }
  async stop() {}

  /**
   * Mimics Config Service schema registration, which should be finished calling before start() is called. Validation is not needed as the Config Service handles that
   *
   * @param path {string} the core ID, plugin ID, or the plugin configPath (if specified)
   * @param schema {Type<unknown>} the schema object defined in config.ts
   */
  setSchema(path, schema) {
    // Even though server configs are not pluginConfigPaths, the logic to parse the namespace will not change
    const namespace = (0, _utils.pathToString)({
      pluginConfigPath: path
    });
    if (_classPrivateFieldGet2(this, _schemas).has(namespace)) {
      throw new Error(`Validation schema for [${namespace}] was already registered.`);
    }
    _classPrivateFieldGet2(this, _schemas).set(namespace, schema);
  }

  /**
   * Checks if a certain config already exists
   *
   * @param configIdentifier {ConfigIdentifier} the core ID, plugin ID, or the plugin configPath (if specified)
   */
  hasDefaultConfigs(configIdentifier) {
    const namespace = (0, _utils.pathToString)(configIdentifier);
    return _classPrivateFieldGet2(this, _schemas).has(namespace);
  }
}
exports.DynamicConfigService = DynamicConfigService;