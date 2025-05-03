"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loggerSchema = exports.loggerContextConfigSchema = exports.config = exports.LoggingConfig = void 0;
var _configSchema = require("@osd/config-schema");
var _appenders = require("./appenders/appenders");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */ /*
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
// We need this helper for the types to be correct
// (otherwise it assumes an array of A|B instead of a tuple [A,B])
const toTuple = (a, b) => [a, b];

/**
 * Separator string that used within nested context name (eg. plugins.pid).
 */
const CONTEXT_SEPARATOR = '.';

/**
 * Name of the `root` context that always exists and sits at the top of logger hierarchy.
 */
const ROOT_CONTEXT_NAME = 'root';

/**
 * Name of the appender that is always presented and used by `root` logger by default.
 */
const DEFAULT_APPENDER_NAME = 'default';
const levelSchema = _configSchema.schema.oneOf([_configSchema.schema.literal('all'), _configSchema.schema.literal('fatal'), _configSchema.schema.literal('error'), _configSchema.schema.literal('warn'), _configSchema.schema.literal('info'), _configSchema.schema.literal('debug'), _configSchema.schema.literal('trace'), _configSchema.schema.literal('off')], {
  defaultValue: 'info'
});

/**
 * Config schema for validating the `loggers` key in {@link LoggerContextConfigType} or {@link LoggingConfigType}.
 *
 * @public
 */
const loggerSchema = exports.loggerSchema = _configSchema.schema.object({
  appenders: _configSchema.schema.arrayOf(_configSchema.schema.string(), {
    defaultValue: []
  }),
  context: _configSchema.schema.string(),
  level: levelSchema
});

/** @public */

const config = exports.config = {
  path: 'logging',
  schema: _configSchema.schema.object({
    appenders: _configSchema.schema.mapOf(_configSchema.schema.string(), _appenders.Appenders.configSchema, {
      defaultValue: new Map()
    }),
    loggers: _configSchema.schema.arrayOf(loggerSchema, {
      defaultValue: []
    }),
    root: _configSchema.schema.object({
      appenders: _configSchema.schema.arrayOf(_configSchema.schema.string(), {
        defaultValue: [DEFAULT_APPENDER_NAME],
        minSize: 1
      }),
      level: levelSchema
    }, {
      validate(rawConfig) {
        if (!rawConfig.appenders.includes(DEFAULT_APPENDER_NAME)) {
          return `"${DEFAULT_APPENDER_NAME}" appender required for migration period till the next major release`;
        }
      }
    })
  })
};
/**
 * Config schema for validating the inputs to the {@link LoggingServiceStart.configure} API.
 * See {@link LoggerContextConfigType}.
 *
 * @public
 */
const loggerContextConfigSchema = exports.loggerContextConfigSchema = _configSchema.schema.object({
  appenders: _configSchema.schema.mapOf(_configSchema.schema.string(), _appenders.Appenders.configSchema, {
    defaultValue: new Map()
  }),
  loggers: _configSchema.schema.arrayOf(loggerSchema, {
    defaultValue: []
  })
});

/** @public */

/** @public */

/**
 * Describes the config used to fully setup logging subsystem.
 * @internal
 */
class LoggingConfig {
  /**
   * Helper method that joins separate string context parts into single context string.
   * In case joined context is an empty string, `root` context name is returned.
   * @param contextParts List of the context parts (e.g. ['parent', 'child'].
   * @returns {string} Joined context string (e.g. 'parent.child').
   */
  static getLoggerContext(contextParts) {
    return contextParts.join(CONTEXT_SEPARATOR) || ROOT_CONTEXT_NAME;
  }

  /**
   * Helper method that returns parent context for the specified one.
   * @param context Context to find parent for.
   * @returns Name of the parent context or `root` if the context is the top level one.
   */
  static getParentLoggerContext(context) {
    const lastIndexOfSeparator = context.lastIndexOf(CONTEXT_SEPARATOR);
    if (lastIndexOfSeparator === -1) {
      return ROOT_CONTEXT_NAME;
    }
    return context.slice(0, lastIndexOfSeparator);
  }

  /**
   * Map of the appender unique arbitrary key and its corresponding config.
   */

  constructor(configType) {
    this.configType = configType;
    _defineProperty(this, "appenders", new Map([['default', {
      kind: 'console',
      layout: {
        kind: 'pattern',
        highlight: true
      }
    }], ['console', {
      kind: 'console',
      layout: {
        kind: 'pattern',
        highlight: true
      }
    }]]));
    /**
     * Map of the logger unique arbitrary key (context) and its corresponding config.
     */
    _defineProperty(this, "loggers", new Map());
    this.fillAppendersConfig(configType);
    this.fillLoggersConfig(configType);
  }

  /**
   * Returns a new LoggingConfig that merges the existing config with the specified config.
   *
   * @remarks
   * Does not support merging the `root` config property.
   *
   * @param contextConfig
   */
  extend(contextConfig) {
    // Use a Map to de-dupe any loggers for the same context. contextConfig overrides existing config.
    const mergedLoggers = new Map([...this.configType.loggers.map(l => [l.context, l]), ...contextConfig.loggers.map(l => [l.context, l])]);
    const mergedConfig = {
      appenders: new Map([...this.configType.appenders, ...contextConfig.appenders]),
      loggers: [...mergedLoggers.values()],
      root: this.configType.root
    };
    return new LoggingConfig(mergedConfig);
  }
  fillAppendersConfig(loggingConfig) {
    for (const [appenderKey, appenderSchema] of loggingConfig.appenders) {
      this.appenders.set(appenderKey, appenderSchema);
    }
  }
  fillLoggersConfig(loggingConfig) {
    // Include `root` logger into common logger list so that it can easily be a part
    // of the logger hierarchy and put all the loggers in map for easier retrieval.
    const loggers = [{
      context: ROOT_CONTEXT_NAME,
      ...loggingConfig.root
    }, ...loggingConfig.loggers];
    const loggerConfigByContext = new Map(loggers.map(loggerConfig => toTuple(loggerConfig.context, loggerConfig)));
    for (const [loggerContext, loggerConfig] of loggerConfigByContext) {
      // Ensure logger config only contains valid appenders.
      const unsupportedAppenderKey = loggerConfig.appenders.find(appenderKey => !this.appenders.has(appenderKey));
      if (unsupportedAppenderKey) {
        throw new Error(`Logger "${loggerContext}" contains unsupported appender key "${unsupportedAppenderKey}".`);
      }
      const appenders = getAppenders(loggerConfig, loggerConfigByContext);

      // We expect `appenders` to never be empty at this point, since the `root` context config should always
      // have at least one appender that is enforced by the config schema validation.
      this.loggers.set(loggerContext, {
        ...loggerConfig,
        appenders
      });
    }
  }
}

/**
 * Get appenders for logger config.
 *
 * If config for current context doesn't have any defined appenders inherit
 * appenders from the parent context config.
 */
exports.LoggingConfig = LoggingConfig;
function getAppenders(loggerConfig, loggerConfigByContext) {
  let currentContext = loggerConfig.context;
  let appenders = loggerConfig.appenders;
  while (appenders.length === 0) {
    const parentContext = LoggingConfig.getParentLoggerContext(currentContext);
    const parentLogger = loggerConfigByContext.get(parentContext);
    if (parentLogger) {
      appenders = parentLogger.appenders;
    }
    currentContext = parentContext;
  }
  return appenders;
}