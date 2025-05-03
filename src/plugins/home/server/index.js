"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ArtifactsSchema", {
  enumerable: true,
  get: function () {
    return _tutorials.ArtifactsSchema;
  }
});
Object.defineProperty(exports, "HomeServerPluginSetup", {
  enumerable: true,
  get: function () {
    return _plugin.HomeServerPluginSetup;
  }
});
Object.defineProperty(exports, "HomeServerPluginStart", {
  enumerable: true,
  get: function () {
    return _plugin.HomeServerPluginStart;
  }
});
Object.defineProperty(exports, "INSTRUCTION_VARIANT", {
  enumerable: true,
  get: function () {
    return _instruction_variant.INSTRUCTION_VARIANT;
  }
});
Object.defineProperty(exports, "SampleDataRegistrySetup", {
  enumerable: true,
  get: function () {
    return _services.SampleDataRegistrySetup;
  }
});
Object.defineProperty(exports, "SampleDatasetProvider", {
  enumerable: true,
  get: function () {
    return _services.SampleDatasetProvider;
  }
});
Object.defineProperty(exports, "TutorialProvider", {
  enumerable: true,
  get: function () {
    return _services.TutorialProvider;
  }
});
Object.defineProperty(exports, "TutorialsCategory", {
  enumerable: true,
  get: function () {
    return _tutorials.TutorialsCategory;
  }
});
exports.plugin = exports.config = void 0;
var _plugin = require("./plugin");
var _services = require("./services");
var _config = require("../config");
var _instruction_variant = require("../common/instruction_variant");
var _tutorials = require("./services/tutorials");
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
  exposeToBrowser: {
    disableWelcomeScreen: true,
    disableNewThemeModal: true
  },
  schema: _config.configSchema,
  deprecations: ({
    renameFromRoot
  }) => [renameFromRoot('opensearchDashboards.disableWelcomeScreen', 'home.disableWelcomeScreen'), renameFromRoot('kibana.disableWelcomeScreen', 'home.disableWelcomeScreen')]
};
const plugin = initContext => new _plugin.HomeServerPlugin(initContext);
exports.plugin = plugin;