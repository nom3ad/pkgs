"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createOrUpgradeSavedConfig = createOrUpgradeSavedConfig;
var _lodash = require("lodash");
var _saved_objects = require("../../saved_objects/");
var _get_upgradeable_config = require("./get_upgradeable_config");
var _types = require("../types");
var _utils = require("../utils");
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

async function createOrUpgradeSavedConfig(options) {
  const {
    savedObjectsClient,
    version,
    buildNum,
    log,
    handleWriteErrors,
    scope
  } = options;

  // try to find an older config we can upgrade
  let upgradeableConfig;
  if (scope === _types.UiSettingScope.USER) {
    upgradeableConfig = undefined;
  } else {
    upgradeableConfig = await (0, _get_upgradeable_config.getUpgradeableConfig)({
      savedObjectsClient,
      version
    });
  }

  // default to the attributes of the upgradeableConfig if available
  const attributes = (0, _lodash.defaults)({
    buildNum
  }, upgradeableConfig ? upgradeableConfig.attributes : {});
  try {
    const docId = (0, _utils.buildDocIdWithScope)(version, scope);
    // create the new SavedConfig
    await savedObjectsClient.create('config', attributes, {
      id: docId
    });
  } catch (error) {
    if (handleWriteErrors) {
      if (_saved_objects.SavedObjectsErrorHelpers.isConflictError(error)) {
        return;
      }
      if (_saved_objects.SavedObjectsErrorHelpers.isNotAuthorizedError(error) || _saved_objects.SavedObjectsErrorHelpers.isForbiddenError(error)) {
        return attributes;
      }
    }
    throw error;
  }
  if (upgradeableConfig) {
    log.debug(`Upgrade config from ${upgradeableConfig.id} to ${version}`, {
      prevVersion: upgradeableConfig.id,
      newVersion: version,
      scope
    });
  }
}