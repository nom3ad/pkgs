"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoggingSystem = void 0;
var _logging = require("@osd/logging");
var _appenders = require("./appenders/appenders");
var _buffer_appender = require("./appenders/buffer/buffer_appender");
var _logger = require("./logger");
var _logger_adapter = require("./logger_adapter");
var _logging_config = require("./logging_config");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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
/**
 * System that is responsible for maintaining loggers and logger appenders.
 * @internal
 */
class LoggingSystem {
  constructor() {
    /** The configuration set by the user. */
    _defineProperty(this, "baseConfig", void 0);
    /** The fully computed configuration extended by context-specific configurations set programmatically */
    _defineProperty(this, "computedConfig", void 0);
    _defineProperty(this, "appenders", new Map());
    _defineProperty(this, "bufferAppender", new _buffer_appender.BufferAppender());
    _defineProperty(this, "loggers", new Map());
    _defineProperty(this, "contextConfigs", new Map());
  }
  get(...contextParts) {
    const context = _logging_config.LoggingConfig.getLoggerContext(contextParts);
    if (!this.loggers.has(context)) {
      this.loggers.set(context, new _logger_adapter.LoggerAdapter(this.createLogger(context, this.computedConfig)));
    }
    return this.loggers.get(context);
  }

  /**
   * Safe wrapper that allows passing logging service as immutable LoggerFactory.
   */
  asLoggerFactory() {
    return {
      get: (...contextParts) => this.get(...contextParts)
    };
  }

  /**
   * Updates all current active loggers with the new config values.
   * @param rawConfig New config instance.
   */
  upgrade(rawConfig) {
    const config = new _logging_config.LoggingConfig(rawConfig);
    this.applyBaseConfig(config);
  }

  /**
   * Customizes the logging config for a specific context.
   *
   * @remarks
   * Assumes that that the `context` property of the individual items in `rawConfig.loggers`
   * are relative to the `baseContextParts`.
   *
   * @example
   * Customize the configuration for the plugins.data.search context.
   * ```ts
   * loggingSystem.setContextConfig(
   *   ['plugins', 'data'],
   *   {
   *     loggers: [{ context: 'search', appenders: ['default'] }]
   *   }
   * )
   * ```
   *
   * @param baseContextParts
   * @param rawConfig
   */
  setContextConfig(baseContextParts, rawConfig) {
    const context = _logging_config.LoggingConfig.getLoggerContext(baseContextParts);
    const contextConfig = _logging_config.loggerContextConfigSchema.validate(rawConfig);
    this.contextConfigs.set(context, {
      ...contextConfig,
      // Automatically prepend the base context to the logger sub-contexts
      loggers: contextConfig.loggers.map(l => ({
        ...l,
        context: _logging_config.LoggingConfig.getLoggerContext(l.context.length > 0 ? [context, l.context] : [context])
      }))
    });

    // If we already have a base config, apply the config. If not, custom context configs
    // will be picked up on next call to `upgrade`.
    if (this.baseConfig) {
      this.applyBaseConfig(this.baseConfig);
    }
  }

  /**
   * Disposes all loggers (closes log files, clears buffers etc.). Service is not usable after
   * calling of this method until new config is provided via `upgrade` method.
   * @returns Promise that is resolved once all loggers are successfully disposed.
   */
  async stop() {
    await Promise.all([...this.appenders.values()].map(a => a.dispose()));
    await this.bufferAppender.dispose();
    this.appenders.clear();
    this.loggers.clear();
  }
  createLogger(context, config) {
    if (config === undefined) {
      // If we don't have config yet, use `buffered` appender that will store all logged messages in the memory
      // until the config is ready.
      return new _logger.BaseLogger(context, _logging.LogLevel.All, [this.bufferAppender], this.asLoggerFactory());
    }
    const {
      level,
      appenders
    } = this.getLoggerConfigByContext(config, context);
    const loggerLevel = _logging.LogLevel.fromId(level);
    const loggerAppenders = appenders.map(appenderKey => this.appenders.get(appenderKey));
    return new _logger.BaseLogger(context, loggerLevel, loggerAppenders, this.asLoggerFactory());
  }
  getLoggerConfigByContext(config, context) {
    const loggerConfig = config.loggers.get(context);
    if (loggerConfig !== undefined) {
      return loggerConfig;
    }

    // If we don't have configuration for the specified context and it's the "nested" one (eg. `foo.bar.baz`),
    // let's move up to the parent context (eg. `foo.bar`) and check if it has config we can rely on. Otherwise
    // we fallback to the `root` context that should always be defined (enforced by configuration schema).
    return this.getLoggerConfigByContext(config, _logging_config.LoggingConfig.getParentLoggerContext(context));
  }
  applyBaseConfig(newBaseConfig) {
    const computedConfig = [...this.contextConfigs.values()].reduce((baseConfig, contextConfig) => baseConfig.extend(contextConfig), newBaseConfig);

    // Appenders must be reset, so we first dispose of the current ones, then
    // build up a new set of appenders.
    for (const appender of this.appenders.values()) {
      appender.dispose();
    }
    this.appenders.clear();
    for (const [appenderKey, appenderConfig] of computedConfig.appenders) {
      this.appenders.set(appenderKey, _appenders.Appenders.create(appenderConfig));
    }
    for (const [loggerKey, loggerAdapter] of this.loggers) {
      loggerAdapter.updateLogger(this.createLogger(loggerKey, computedConfig));
    }

    // We keep a reference to the base config so we can properly extend it
    // on each config change.
    this.baseConfig = newBaseConfig;
    this.computedConfig = computedConfig;

    // Re-log all buffered log records with newly configured appenders.
    for (const logRecord of this.bufferAppender.flush()) {
      this.get(logRecord.context).log(logRecord);
    }
  }
}
exports.LoggingSystem = LoggingSystem;