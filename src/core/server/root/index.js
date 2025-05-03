"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Root = void 0;
var _operators = require("rxjs/operators");
var _logging = require("../logging");
var _server = require("../server");
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
 * Top-level entry point to kick off the app and start the OpenSearch Dashboards server.
 */
class Root {
  constructor(rawConfigProvider, env, onShutdown) {
    this.onShutdown = onShutdown;
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "log", void 0);
    _defineProperty(this, "loggingSystem", void 0);
    _defineProperty(this, "server", void 0);
    _defineProperty(this, "loggingConfigSubscription", void 0);
    this.loggingSystem = new _logging.LoggingSystem();
    this.logger = this.loggingSystem.asLoggerFactory();
    this.log = this.logger.get('root');
    this.server = new _server.Server(rawConfigProvider, env, this.loggingSystem);
  }
  async setup() {
    try {
      await this.server.setupCoreConfig();
      await this.setupLogging();
      this.log.debug('setting up root');
      return await this.server.setup();
    } catch (e) {
      await this.shutdown(e);
      throw e;
    }
  }
  async start() {
    this.log.debug('starting root');
    try {
      return await this.server.start();
    } catch (e) {
      await this.shutdown(e);
      throw e;
    }
  }
  async shutdown(reason) {
    this.log.debug('shutting root down');
    if (reason) {
      if (reason.code === 'EADDRINUSE' && Number.isInteger(reason.port)) {
        reason = new Error(`Port ${reason.port} is already in use. Another instance of OpenSearch Dashboards may be running!`);
      }
      this.log.fatal(reason);
    }
    await this.server.stop();
    if (this.loggingConfigSubscription !== undefined) {
      this.loggingConfigSubscription.unsubscribe();
      this.loggingConfigSubscription = undefined;
    }
    await this.loggingSystem.stop();
    if (this.onShutdown !== undefined) {
      this.onShutdown(reason);
    }
  }
  async setupLogging() {
    const {
      configService
    } = this.server;
    // Stream that maps config updates to logger updates, including update failures.
    const update$ = configService.getConfig$().pipe(
    // always read the logging config when the underlying config object is re-read
    (0, _operators.switchMap)(() => configService.atPath('logging')), (0, _operators.map)(config => this.loggingSystem.upgrade(config)),
    // This specifically console.logs because we were not able to configure the logger.
    // eslint-disable-next-line no-console
    (0, _operators.tap)({
      error: err => console.error('Configuring logger failed:', err)
    }), (0, _operators.publishReplay)(1));

    // Subscription and wait for the first update to complete and throw if it fails.
    const connectSubscription = update$.connect();
    await update$.pipe((0, _operators.first)()).toPromise();

    // Send subsequent update failures to this.shutdown(), stopped via loggingConfigSubscription.
    this.loggingConfigSubscription = update$.subscribe({
      error: err => this.shutdown(err)
    });

    // Add subscription we got from `connect` so that we can dispose both of them
    // at once. We can't inverse this and add consequent updates subscription to
    // the one we got from `connect` because in the error case the latter will be
    // automatically disposed before the error is forwarded to the former one so
    // the shutdown logic won't be called.
    this.loggingConfigSubscription.add(connectSubscription);
  }
}
exports.Root = Root;