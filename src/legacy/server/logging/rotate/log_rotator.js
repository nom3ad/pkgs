"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LogRotator = void 0;
var chokidar = _interopRequireWildcard(require("chokidar"));
var _cluster = require("cluster");
var _fs = _interopRequireDefault(require("fs"));
var _lodash = require("lodash");
var _os = require("os");
var _path = require("path");
var _rxjs = require("rxjs");
var _operators = require("rxjs/operators");
var _util = require("util");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
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
const mkdirAsync = (0, _util.promisify)(_fs.default.mkdir);
const readdirAsync = (0, _util.promisify)(_fs.default.readdir);
const renameAsync = (0, _util.promisify)(_fs.default.rename);
const statAsync = (0, _util.promisify)(_fs.default.stat);
const unlinkAsync = (0, _util.promisify)(_fs.default.unlink);
const writeFileAsync = (0, _util.promisify)(_fs.default.writeFile);
class LogRotator {
  constructor(config, server) {
    _defineProperty(this, "config", void 0);
    _defineProperty(this, "log", void 0);
    _defineProperty(this, "logFilePath", void 0);
    _defineProperty(this, "everyBytes", void 0);
    _defineProperty(this, "keepFiles", void 0);
    _defineProperty(this, "running", void 0);
    _defineProperty(this, "logFileSize", void 0);
    _defineProperty(this, "isRotating", void 0);
    _defineProperty(this, "throttledRotate", void 0);
    _defineProperty(this, "stalker", void 0);
    _defineProperty(this, "usePolling", void 0);
    _defineProperty(this, "pollingInterval", void 0);
    _defineProperty(this, "stalkerUsePollingPolicyTestTimeout", void 0);
    _defineProperty(this, "shouldUsePolling", void 0);
    _defineProperty(this, "_logFileSizeMonitorHandler", async (filename, stats) => {
      if (!filename || !stats) {
        return;
      }
      this.logFileSize = stats.size || 0;
      await this.throttledRotate();
    });
    this.config = config;
    this.log = server.log.bind(server);
    this.logFilePath = config.get('logging.dest');
    this.everyBytes = config.get('logging.rotate.everyBytes');
    this.keepFiles = config.get('logging.rotate.keepFiles');
    this.running = false;
    this.logFileSize = 0;
    this.isRotating = false;
    this.throttledRotate = (0, _lodash.throttle)(async () => await this._rotate(), 5000);
    this.stalker = null;
    this.usePolling = config.get('logging.rotate.usePolling');
    this.pollingInterval = config.get('logging.rotate.pollingInterval');
    this.shouldUsePolling = false;
    this.stalkerUsePollingPolicyTestTimeout = null;
  }
  async start() {
    if (this.running) {
      return;
    }
    this.running = true;

    // create exit listener for cleanup purposes
    this._createExitListener();

    // call rotate on startup
    await this._callRotateOnStartup();

    // init log file size monitor
    await this._startLogFileSizeMonitor();
  }
  async stop() {
    if (!this.running) {
      return;
    }

    // cleanup exit listener
    this._deleteExitListener();

    // stop log file size monitor
    await this._stopLogFileSizeMonitor();
    this.running = false;
  }
  async _shouldUsePolling() {
    try {
      // Setup a test file in order to try the fs env
      // and understand if we need to usePolling or not
      const tempFileDir = (0, _os.tmpdir)();
      const tempFile = (0, _path.join)(tempFileDir, 'osd_log_rotation_use_polling_test_file.log');
      await mkdirAsync(tempFileDir, {
        recursive: true
      });
      await writeFileAsync(tempFile, '');

      // setup fs.watch for the temp test file
      const testWatcher = _fs.default.watch(tempFile, {
        persistent: false
      });

      // await writeFileAsync(tempFile, 'test');

      const usePollingTest$ = new _rxjs.Observable(observer => {
        // observable complete function
        const completeFn = completeStatus => {
          if (this.stalkerUsePollingPolicyTestTimeout) {
            clearTimeout(this.stalkerUsePollingPolicyTestTimeout);
          }
          testWatcher.close();
          observer.next(completeStatus);
          observer.complete();
        };

        // setup conditions that would fire the observable
        this.stalkerUsePollingPolicyTestTimeout = setTimeout(() => completeFn(true), 15000);
        testWatcher.on('change', () => completeFn(false));
        testWatcher.on('error', () => completeFn(true));

        // fire test watcher events
        setTimeout(() => {
          _fs.default.writeFileSync(tempFile, 'test');
        }, 0);
      });

      // wait for the first observable result and consider it as the result
      // for our use polling test
      const usePollingTestResult = await usePollingTest$.pipe((0, _operators.first)()).toPromise();

      // delete the temp file used for the test
      await unlinkAsync(tempFile);
      return usePollingTestResult;
    } catch {
      return true;
    }
  }
  async _startLogFileSizeMonitor() {
    this.usePolling = this.config.get('logging.rotate.usePolling');
    this.shouldUsePolling = await this._shouldUsePolling();
    if (this.usePolling && !this.shouldUsePolling) {
      this.log(['warning', 'logging:rotate'], 'Looks like your current environment support a faster algorithm then polling. You can try to disable `usePolling`');
    }
    if (!this.usePolling && this.shouldUsePolling) {
      this.log(['error', 'logging:rotate'], 'Looks like within your current environment you need to use polling in order to enable log rotator. Please enable `usePolling`');
    }
    this.stalker = chokidar.watch(this.logFilePath, {
      ignoreInitial: true,
      awaitWriteFinish: false,
      useFsEvents: false,
      usePolling: this.usePolling,
      interval: this.pollingInterval,
      binaryInterval: this.pollingInterval,
      alwaysStat: true,
      atomic: false
    });
    this.stalker.on('change', this._logFileSizeMonitorHandler);
  }
  async _stopLogFileSizeMonitor() {
    if (!this.stalker) {
      return;
    }
    await this.stalker.close();
    if (this.stalkerUsePollingPolicyTestTimeout) {
      clearTimeout(this.stalkerUsePollingPolicyTestTimeout);
    }
  }
  _createExitListener() {
    process.on('exit', this.stop);
  }
  _deleteExitListener() {
    process.removeListener('exit', this.stop);
  }
  async _getLogFileSizeAndCreateIfNeeded() {
    try {
      const logFileStats = await statAsync(this.logFilePath);
      return logFileStats.size;
    } catch {
      // touch the file to make the watcher being able to register
      // change events
      await writeFileAsync(this.logFilePath, '');
      return 0;
    }
  }
  async _callRotateOnStartup() {
    this.logFileSize = await this._getLogFileSizeAndCreateIfNeeded();
    await this._rotate();
  }
  _shouldRotate() {
    // should rotate evaluation
    // 1. should rotate if current log size exceeds
    //    the defined one on everyBytes
    // 2. should not rotate if is already rotating or if any
    //    of the conditions on 1. do not apply
    if (this.isRotating) {
      return false;
    }
    return this.logFileSize >= this.everyBytes;
  }
  async _rotate() {
    if (!this._shouldRotate()) {
      return;
    }
    await this._rotateNow();
  }
  async _rotateNow() {
    // rotate process
    // 1. get rotated files metadata (list of log rotated files present on the log folder, numerical sorted)
    // 2. delete last file
    // 3. rename all files to the correct index +1
    // 4. rename + compress current log into 1
    // 5. send SIGHUP to reload log config

    // rotate process is starting
    this.isRotating = true;

    // get rotated files metadata
    const foundRotatedFiles = await this._readRotatedFilesMetadata();

    // delete number of rotated files exceeding the keepFiles limit setting
    const rotatedFiles = await this._deleteFoundRotatedFilesAboveKeepFilesLimit(foundRotatedFiles);

    // delete last file
    await this._deleteLastRotatedFile(rotatedFiles);

    // rename all files to correct index + 1
    // and normalize numbering if by some reason
    // (for example log file deletion) that numbering
    // was interrupted
    await this._renameRotatedFilesByOne(rotatedFiles);

    // rename current log into 0
    await this._rotateCurrentLogFile();

    // send SIGHUP to reload log configuration
    this._sendReloadLogConfigSignal();

    // Reset log file size
    this.logFileSize = 0;

    // rotate process is finished
    this.isRotating = false;
  }
  async _readRotatedFilesMetadata() {
    const logFileBaseName = (0, _path.basename)(this.logFilePath);
    const logFilesFolder = (0, _path.dirname)(this.logFilePath);
    const foundLogFiles = await readdirAsync(logFilesFolder);
    return foundLogFiles.filter(file => new RegExp(`${logFileBaseName}\\.\\d`).test(file))
    // we use .slice(-1) here in order to retrieve the last number match in the read filenames
    .sort((a, b) => Number(a.match(/(\d+)/g).slice(-1)) - Number(b.match(/(\d+)/g).slice(-1))).map(filename => `${logFilesFolder}${_path.sep}${filename}`);
  }
  async _deleteFoundRotatedFilesAboveKeepFilesLimit(foundRotatedFiles) {
    if (foundRotatedFiles.length <= this.keepFiles) {
      return foundRotatedFiles;
    }
    const finalRotatedFiles = foundRotatedFiles.slice(0, this.keepFiles);
    const rotatedFilesToDelete = foundRotatedFiles.slice(finalRotatedFiles.length, foundRotatedFiles.length);
    await Promise.all(rotatedFilesToDelete.map(rotatedFilePath => unlinkAsync(rotatedFilePath)));
    return finalRotatedFiles;
  }
  async _deleteLastRotatedFile(rotatedFiles) {
    if (rotatedFiles.length < this.keepFiles) {
      return;
    }
    const lastFilePath = rotatedFiles.pop();
    await unlinkAsync(lastFilePath);
  }
  async _renameRotatedFilesByOne(rotatedFiles) {
    const logFileBaseName = (0, _path.basename)(this.logFilePath);
    const logFilesFolder = (0, _path.dirname)(this.logFilePath);
    for (let i = rotatedFiles.length - 1; i >= 0; i--) {
      const oldFilePath = rotatedFiles[i];
      const newFilePath = `${logFilesFolder}${_path.sep}${logFileBaseName}.${i + 1}`;
      await renameAsync(oldFilePath, newFilePath);
    }
  }
  async _rotateCurrentLogFile() {
    const newFilePath = `${this.logFilePath}.0`;
    await renameAsync(this.logFilePath, newFilePath);
  }
  _sendReloadLogConfigSignal() {
    if (_cluster.isMaster) {
      process.emit('SIGHUP');
      return;
    }

    // Send a special message to the cluster manager
    // so it can forward it correctly
    // It will only run when we are under cluster mode (not under a production environment)
    if (!process.send) {
      this.log(['error', 'logging:rotate'], 'For some unknown reason process.send is not defined, the rotation was not successful');
      return;
    }
    process.send(['RELOAD_LOGGING_CONFIG_FROM_SERVER_WORKER']);
  }
}
exports.LogRotator = LogRotator;