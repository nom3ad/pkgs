"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSummaryStatus = void 0;
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

/**
 * Returns a single {@link ServiceStatus} that summarizes the most severe status level from a group of statuses.
 * @param statuses
 */
const getSummaryStatus = (statuses, {
  allAvailableSummary = `All services are available`
} = {}) => {
  const {
    highestLevel,
    highestStatuses
  } = highestLevelSummary(statuses);
  if (highestLevel === _types.ServiceStatusLevels.available) {
    return {
      level: _types.ServiceStatusLevels.available,
      summary: allAvailableSummary
    };
  } else if (highestStatuses.length === 1) {
    var _status$detail;
    const [serviceName, status] = highestStatuses[0];
    return {
      ...status,
      summary: `[${serviceName}]: ${status.summary}`,
      // TODO: include URL to status page
      detail: (_status$detail = status.detail) !== null && _status$detail !== void 0 ? _status$detail : `See the status page for more information`,
      meta: {
        affectedServices: {
          [serviceName]: status
        }
      }
    };
  } else {
    return {
      level: highestLevel,
      summary: `[${highestStatuses.length}] services are ${highestLevel.toString()}`,
      // TODO: include URL to status page
      detail: `See the status page for more information`,
      meta: {
        affectedServices: Object.fromEntries(highestStatuses)
      }
    };
  }
};
exports.getSummaryStatus = getSummaryStatus;
const highestLevelSummary = statuses => {
  let highestLevel = _types.ServiceStatusLevels.available;
  let highestStatuses = [];
  for (const pair of statuses) {
    if (pair[1].level === highestLevel) {
      highestStatuses.push(pair);
    } else if (pair[1].level > highestLevel) {
      highestLevel = pair[1].level;
      highestStatuses = [pair];
    }
  }
  return {
    highestLevel,
    highestStatuses
  };
};