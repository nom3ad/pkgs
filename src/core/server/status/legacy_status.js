"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateLegacyStatus = void 0;
var _lodash = require("lodash");
var _i18n = require("@osd/i18n");
var _std = require("@osd/std");
var _types = require("./types");
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

const calculateLegacyStatus = ({
  core,
  overall,
  plugins,
  versionWithoutSnapshot
}) => {
  const since = new Date().toISOString();
  const overallLegacy = {
    since,
    ...(0, _lodash.pick)(STATUS_LEVEL_LEGACY_ATTRS[overall.level.toString()], ['state', 'title', 'nickname', 'icon', 'uiColor'])
  };
  const coreStatuses = Object.entries(core).map(([serviceName, s]) => serviceStatusToHttpComponent(`core:${serviceName}@${versionWithoutSnapshot}`, s, since));
  const pluginStatuses = Object.entries(plugins).map(([pluginName, s]) => serviceStatusToHttpComponent(`plugin:${pluginName}@${versionWithoutSnapshot}`, s, since));
  const componentStatuses = [...coreStatuses, ...pluginStatuses];
  return {
    overall: overallLegacy,
    statuses: componentStatuses
  };
};
exports.calculateLegacyStatus = calculateLegacyStatus;
const serviceStatusToHttpComponent = (serviceName, status, since) => ({
  id: serviceName,
  message: status.summary,
  since,
  ...serviceStatusAttrs(status)
});
const serviceStatusAttrs = status => (0, _lodash.pick)(STATUS_LEVEL_LEGACY_ATTRS[status.level.toString()], ['state', 'icon', 'uiColor']);
const STATUS_LEVEL_LEGACY_ATTRS = (0, _std.deepFreeze)({
  [_types.ServiceStatusLevels.critical.toString()]: {
    id: 'red',
    state: 'red',
    title: _i18n.i18n.translate('core.status.redTitle', {
      defaultMessage: 'Red'
    }),
    icon: 'danger',
    uiColor: 'danger',
    nickname: 'Danger Will Robinson! Danger!'
  },
  [_types.ServiceStatusLevels.unavailable.toString()]: {
    id: 'red',
    state: 'red',
    title: _i18n.i18n.translate('core.status.redTitle', {
      defaultMessage: 'Red'
    }),
    icon: 'danger',
    uiColor: 'danger',
    nickname: 'Danger Will Robinson! Danger!'
  },
  [_types.ServiceStatusLevels.degraded.toString()]: {
    id: 'yellow',
    state: 'yellow',
    title: _i18n.i18n.translate('core.status.yellowTitle', {
      defaultMessage: 'Yellow'
    }),
    icon: 'warning',
    uiColor: 'warning',
    nickname: "I'll be back"
  },
  [_types.ServiceStatusLevels.available.toString()]: {
    id: 'green',
    state: 'green',
    title: _i18n.i18n.translate('core.status.greenTitle', {
      defaultMessage: 'Green'
    }),
    icon: 'success',
    uiColor: 'secondary',
    nickname: 'Looking good'
  }
});