"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writePidFile = void 0;
var _fs = require("fs");
var _once = _interopRequireDefault(require("lodash/once"));
var _fs2 = require("./fs");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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

const writePidFile = async ({
  pidConfig,
  logger
}) => {
  const path = pidConfig.file;
  if (!path) {
    return;
  }
  const pid = String(process.pid);
  if (await (0, _fs2.exists)(path)) {
    const message = `pid file already exists at ${path}`;
    if (pidConfig.exclusive) {
      throw new Error(message);
    } else {
      logger.warn(message, {
        path,
        pid
      });
    }
  }
  await (0, _fs2.writeFile)(path, pid);
  logger.debug(`wrote pid file to ${path}`, {
    path,
    pid
  });
  const clean = (0, _once.default)(() => {
    (0, _fs.unlinkSync)(path);
  });
  process.once('exit', clean); // for "natural" exits
  process.once('SIGINT', () => {
    // for Ctrl-C exits
    clean();
    // resend SIGINT
    process.kill(process.pid, 'SIGINT');
  });
};
exports.writePidFile = writePidFile;