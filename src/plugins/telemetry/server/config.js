"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configSchema = void 0;
var _configSchema = require("@osd/config-schema");
var _utils = require("@osd/utils");
var _constants = require("../common/constants");
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

const configSchema = exports.configSchema = _configSchema.schema.object({
  enabled: _configSchema.schema.boolean({
    defaultValue: true
  }),
  allowChangingOptInStatus: _configSchema.schema.boolean({
    defaultValue: true
  }),
  optIn: _configSchema.schema.conditional(_configSchema.schema.siblingRef('allowChangingOptInStatus'), _configSchema.schema.literal(false), _configSchema.schema.maybe(_configSchema.schema.literal(true)), _configSchema.schema.boolean({
    defaultValue: true
  }), {
    defaultValue: true
  }),
  // `config` is used internally and not intended to be set
  config: _configSchema.schema.string({
    defaultValue: (0, _utils.getConfigPath)()
  }),
  banner: _configSchema.schema.boolean({
    defaultValue: true
  }),
  url: _configSchema.schema.conditional(_configSchema.schema.contextRef('dist'), _configSchema.schema.literal(false),
  // Point to staging if it's not a distributable release
  _configSchema.schema.string({
    defaultValue: `https://telemetry-staging.opensearch.org/xpack/${_constants.ENDPOINT_VERSION}/send`
  }), _configSchema.schema.string({
    defaultValue: `https://telemetry.opensearch.org/xpack/${_constants.ENDPOINT_VERSION}/send`
  })),
  optInStatusUrl: _configSchema.schema.conditional(_configSchema.schema.contextRef('dist'), _configSchema.schema.literal(false),
  // Point to staging if it's not a distributable release
  _configSchema.schema.string({
    defaultValue: `https://telemetry-staging.opensearch.org/opt_in_status/${_constants.ENDPOINT_VERSION}/send`
  }), _configSchema.schema.string({
    defaultValue: `https://telemetry.opensearch.org/opt_in_status/${_constants.ENDPOINT_VERSION}/send`
  })),
  sendUsageFrom: _configSchema.schema.oneOf([_configSchema.schema.literal('server'), _configSchema.schema.literal('browser')], {
    defaultValue: 'server'
  })
});