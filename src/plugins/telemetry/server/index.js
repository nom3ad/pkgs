"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "DATA_TELEMETRY_ID", {
  enumerable: true,
  get: function () {
    return _telemetry_collection.DATA_TELEMETRY_ID;
  }
});
Object.defineProperty(exports, "DataTelemetryIndex", {
  enumerable: true,
  get: function () {
    return _telemetry_collection.DataTelemetryIndex;
  }
});
Object.defineProperty(exports, "DataTelemetryPayload", {
  enumerable: true,
  get: function () {
    return _telemetry_collection.DataTelemetryPayload;
  }
});
Object.defineProperty(exports, "FetcherTask", {
  enumerable: true,
  get: function () {
    return _fetcher.FetcherTask;
  }
});
Object.defineProperty(exports, "TelemetryLocalStats", {
  enumerable: true,
  get: function () {
    return _telemetry_collection.TelemetryLocalStats;
  }
});
Object.defineProperty(exports, "TelemetryPluginSetup", {
  enumerable: true,
  get: function () {
    return _plugin.TelemetryPluginSetup;
  }
});
Object.defineProperty(exports, "TelemetryPluginStart", {
  enumerable: true,
  get: function () {
    return _plugin.TelemetryPluginStart;
  }
});
Object.defineProperty(exports, "buildDataTelemetryPayload", {
  enumerable: true,
  get: function () {
    return _telemetry_collection.buildDataTelemetryPayload;
  }
});
exports.constants = exports.config = void 0;
Object.defineProperty(exports, "getClusterUuids", {
  enumerable: true,
  get: function () {
    return _telemetry_collection.getClusterUuids;
  }
});
Object.defineProperty(exports, "getLocalLicense", {
  enumerable: true,
  get: function () {
    return _telemetry_collection.getLocalLicense;
  }
});
Object.defineProperty(exports, "getLocalStats", {
  enumerable: true,
  get: function () {
    return _telemetry_collection.getLocalStats;
  }
});
Object.defineProperty(exports, "handleOldSettings", {
  enumerable: true,
  get: function () {
    return _handle_old_settings.handleOldSettings;
  }
});
exports.plugin = void 0;
var _plugin = require("./plugin");
var constants = _interopRequireWildcard(require("../common/constants"));
exports.constants = constants;
var _config = require("./config");
var _fetcher = require("./fetcher");
var _handle_old_settings = require("./handle_old_settings");
var _telemetry_collection = require("./telemetry_collection");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
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
  schema: _config.configSchema,
  exposeToBrowser: {
    enabled: true,
    url: true,
    banner: true,
    allowChangingOptInStatus: true,
    optIn: true,
    optInStatusUrl: true,
    sendUsageFrom: true
  }
};
const plugin = initializerContext => new _plugin.TelemetryPlugin(initializerContext);
exports.plugin = plugin;