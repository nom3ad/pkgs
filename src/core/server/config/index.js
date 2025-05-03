"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  coreDeprecationProvider: true,
  config: true,
  ConfigService: true,
  IConfigService: true,
  RawConfigService: true,
  RawConfigurationProvider: true,
  Config: true,
  ConfigPath: true,
  isConfigPath: true,
  hasConfigPathIntersection: true,
  ObjectToConfigAdapter: true,
  CliArgs: true,
  Env: true,
  ConfigDeprecation: true,
  ConfigDeprecationLogger: true,
  ConfigDeprecationProvider: true,
  ConfigDeprecationFactory: true,
  EnvironmentMode: true,
  PackageInfo: true,
  LegacyObjectToConfigAdapter: true
};
Object.defineProperty(exports, "CliArgs", {
  enumerable: true,
  get: function () {
    return _config.CliArgs;
  }
});
Object.defineProperty(exports, "Config", {
  enumerable: true,
  get: function () {
    return _config.Config;
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
Object.defineProperty(exports, "Env", {
  enumerable: true,
  get: function () {
    return _config.Env;
  }
});
Object.defineProperty(exports, "EnvironmentMode", {
  enumerable: true,
  get: function () {
    return _config.EnvironmentMode;
  }
});
Object.defineProperty(exports, "IConfigService", {
  enumerable: true,
  get: function () {
    return _config.IConfigService;
  }
});
Object.defineProperty(exports, "LegacyObjectToConfigAdapter", {
  enumerable: true,
  get: function () {
    return _config.LegacyObjectToConfigAdapter;
  }
});
Object.defineProperty(exports, "ObjectToConfigAdapter", {
  enumerable: true,
  get: function () {
    return _config.ObjectToConfigAdapter;
  }
});
Object.defineProperty(exports, "PackageInfo", {
  enumerable: true,
  get: function () {
    return _config.PackageInfo;
  }
});
Object.defineProperty(exports, "RawConfigService", {
  enumerable: true,
  get: function () {
    return _config.RawConfigService;
  }
});
Object.defineProperty(exports, "RawConfigurationProvider", {
  enumerable: true,
  get: function () {
    return _config.RawConfigurationProvider;
  }
});
Object.defineProperty(exports, "config", {
  enumerable: true,
  get: function () {
    return _dynamic_config_service_config.config;
  }
});
Object.defineProperty(exports, "coreDeprecationProvider", {
  enumerable: true,
  get: function () {
    return _deprecation.coreDeprecationProvider;
  }
});
Object.defineProperty(exports, "hasConfigPathIntersection", {
  enumerable: true,
  get: function () {
    return _config.hasConfigPathIntersection;
  }
});
Object.defineProperty(exports, "isConfigPath", {
  enumerable: true,
  get: function () {
    return _config.isConfigPath;
  }
});
var _deprecation = require("./deprecation");
var _dynamic_config_service_config = require("./dynamic_config_service_config");
var _config = require("@osd/config");
var _types = require("./types");
Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});