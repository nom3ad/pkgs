"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EnvironmentService = void 0;
var _operators = require("rxjs/operators");
var _utils = require("@osd/utils");
var _http = require("../http");
var _pid_config = require("./pid_config");
var _resolve_uuid = require("./resolve_uuid");
var _create_data_folder = require("./create_data_folder");
var _write_pid_file = require("./write_pid_file");
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
/**
 * @internal
 */

/** @internal */
class EnvironmentService {
  constructor(core) {
    _defineProperty(this, "log", void 0);
    _defineProperty(this, "configService", void 0);
    _defineProperty(this, "uuid", '');
    this.log = core.logger.get('environment');
    this.configService = core.configService;
  }
  async setup() {
    const [pathConfig, serverConfig, pidConfig] = await Promise.all([this.configService.atPath(_utils.config.path).pipe((0, _operators.take)(1)).toPromise(), this.configService.atPath(_http.config.path).pipe((0, _operators.take)(1)).toPromise(), this.configService.atPath(_pid_config.config.path).pipe((0, _operators.take)(1)).toPromise()]);

    // was present in the legacy `pid` file.
    process.on('unhandledRejection', reason => {
      this.log.warn(`Detected an unhandled Promise rejection.\n${reason}`);
    });
    await (0, _create_data_folder.createDataFolder)({
      pathConfig,
      logger: this.log
    });
    await (0, _write_pid_file.writePidFile)({
      pidConfig,
      logger: this.log
    });
    this.uuid = await (0, _resolve_uuid.resolveInstanceUuid)({
      pathConfig,
      serverConfig,
      logger: this.log
    });
    return {
      instanceUuid: this.uuid
    };
  }
}
exports.EnvironmentService = EnvironmentService;