"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "APMOSSPluginSetup", {
  enumerable: true,
  get: function () {
    return _plugin.APMOSSPluginSetup;
  }
});
Object.defineProperty(exports, "APM_STATIC_INDEX_PATTERN_ID", {
  enumerable: true,
  get: function () {
    return _index_pattern_constants.APM_STATIC_INDEX_PATTERN_ID;
  }
});
Object.defineProperty(exports, "apmIndexPattern", {
  enumerable: true,
  get: function () {
    return _index_pattern.default;
  }
});
exports.config = void 0;
Object.defineProperty(exports, "createDjangoAgentInstructions", {
  enumerable: true,
  get: function () {
    return _apm_agent_instructions.createDjangoAgentInstructions;
  }
});
Object.defineProperty(exports, "createDotNetAgentInstructions", {
  enumerable: true,
  get: function () {
    return _apm_agent_instructions.createDotNetAgentInstructions;
  }
});
Object.defineProperty(exports, "createFlaskAgentInstructions", {
  enumerable: true,
  get: function () {
    return _apm_agent_instructions.createFlaskAgentInstructions;
  }
});
Object.defineProperty(exports, "createGoAgentInstructions", {
  enumerable: true,
  get: function () {
    return _apm_agent_instructions.createGoAgentInstructions;
  }
});
Object.defineProperty(exports, "createJavaAgentInstructions", {
  enumerable: true,
  get: function () {
    return _apm_agent_instructions.createJavaAgentInstructions;
  }
});
Object.defineProperty(exports, "createJsAgentInstructions", {
  enumerable: true,
  get: function () {
    return _apm_agent_instructions.createJsAgentInstructions;
  }
});
Object.defineProperty(exports, "createNodeAgentInstructions", {
  enumerable: true,
  get: function () {
    return _apm_agent_instructions.createNodeAgentInstructions;
  }
});
Object.defineProperty(exports, "createRackAgentInstructions", {
  enumerable: true,
  get: function () {
    return _apm_agent_instructions.createRackAgentInstructions;
  }
});
Object.defineProperty(exports, "createRailsAgentInstructions", {
  enumerable: true,
  get: function () {
    return _apm_agent_instructions.createRailsAgentInstructions;
  }
});
exports.plugin = plugin;
var _configSchema = require("@osd/config-schema");
var _index_pattern = _interopRequireDefault(require("./tutorial/index_pattern.json"));
var _plugin = require("./plugin");
var _index_pattern_constants = require("../common/index_pattern_constants");
var _apm_agent_instructions = require("./tutorial/instructions/apm_agent_instructions");
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

const config = exports.config = {
  schema: _configSchema.schema.object({
    enabled: _configSchema.schema.boolean({
      defaultValue: true
    }),
    transactionIndices: _configSchema.schema.string({
      defaultValue: 'apm-*'
    }),
    spanIndices: _configSchema.schema.string({
      defaultValue: 'apm-*'
    }),
    errorIndices: _configSchema.schema.string({
      defaultValue: 'apm-*'
    }),
    metricsIndices: _configSchema.schema.string({
      defaultValue: 'apm-*'
    }),
    sourcemapIndices: _configSchema.schema.string({
      defaultValue: 'apm-*'
    }),
    onboardingIndices: _configSchema.schema.string({
      defaultValue: 'apm-*'
    }),
    indexPattern: _configSchema.schema.string({
      defaultValue: 'apm-*'
    })
  })
};
function plugin(initializerContext) {
  return new _plugin.APMOSSPlugin(initializerContext);
}