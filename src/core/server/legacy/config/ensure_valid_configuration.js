"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ensureValidConfiguration = ensureValidConfiguration;
var _get_unused_config_keys = require("./get_unused_config_keys");
var _errors = require("../../errors");
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

async function ensureValidConfiguration(configService, {
  legacyConfig,
  settings
}) {
  const unusedConfigKeys = await (0, _get_unused_config_keys.getUnusedConfigKeys)({
    coreHandledConfigPaths: await configService.getUsedPaths(),
    settings,
    legacyConfig
  });
  if (unusedConfigKeys.length > 0) {
    const message = `Unknown configuration key(s): ${unusedConfigKeys.map(key => `"${key}"`).join(', ')}. Check for spelling errors and ensure that expected plugins are installed.`;
    throw new InvalidConfigurationError(message);
  }
}
class InvalidConfigurationError extends _errors.CriticalError {
  constructor(message) {
    super(message, 'InvalidConfig', 64);
    Object.setPrototypeOf(this, InvalidConfigurationError.prototype);
  }
}