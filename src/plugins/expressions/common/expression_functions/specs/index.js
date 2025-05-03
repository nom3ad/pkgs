"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  functionSpecs: true
};
exports.functionSpecs = void 0;
var _clog = require("./clog");
Object.keys(_clog).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _clog[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _clog[key];
    }
  });
});
var _font = require("./font");
Object.keys(_font).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _font[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _font[key];
    }
  });
});
var _opensearch_dashboards = require("./opensearch_dashboards");
Object.keys(_opensearch_dashboards).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _opensearch_dashboards[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _opensearch_dashboards[key];
    }
  });
});
var _opensearch_dashboards_context = require("./opensearch_dashboards_context");
Object.keys(_opensearch_dashboards_context).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _opensearch_dashboards_context[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _opensearch_dashboards_context[key];
    }
  });
});
var _var_set = require("./var_set");
Object.keys(_var_set).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _var_set[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _var_set[key];
    }
  });
});
var _var = require("./var");
Object.keys(_var).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _var[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _var[key];
    }
  });
});
var _theme = require("./theme");
Object.keys(_theme).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _theme[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _theme[key];
    }
  });
});
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

const functionSpecs = exports.functionSpecs = [_clog.clog, _font.font, _opensearch_dashboards.opensearchDashboards, _opensearch_dashboards_context.opensearchDashboardsContextFunction, _var_set.variableSet, _var.variable, _theme.theme];