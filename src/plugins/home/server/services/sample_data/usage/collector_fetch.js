"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchProvider = fetchProvider;
var _lodash = require("lodash");
var _moment = _interopRequireDefault(require("moment"));
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

function fetchProvider(index) {
  return async callCluster => {
    const response = await callCluster('search', {
      index,
      body: {
        query: {
          term: {
            type: {
              value: 'sample-data-telemetry'
            }
          }
        },
        _source: {
          includes: ['sample-data-telemetry', 'type', 'updated_at']
        }
      },
      filter_path: 'hits.hits._id,hits.hits._source',
      ignore: [404]
    });
    const getLast = (dataSet, dataDate, accumSet, accumDate) => {
      let lastDate = accumDate;
      let lastSet = accumSet;
      if (!accumDate || accumDate && dataDate > accumDate) {
        // if a max date has not been accumulated yet, or if the current date is the new max
        lastDate = dataDate;
        lastSet = dataSet;
      }
      return {
        lastDate,
        lastSet
      };
    };
    const initial = {
      installed: [],
      uninstalled: [],
      last_install_date: null,
      last_install_set: null,
      last_uninstall_date: null,
      last_uninstall_set: null
    };
    const hits = (0, _lodash.get)(response, 'hits.hits', []);
    if (hits == null || hits.length === 0) {
      return;
    }
    return hits.reduce((telemetry, hit) => {
      const {
        installCount = 0,
        unInstallCount = 0
      } = hit._source['sample-data-telemetry'] || {
        installCount: 0,
        unInstallCount: 0
      };
      if (installCount === 0 && unInstallCount === 0) {
        return telemetry;
      }
      const isSampleDataSetInstalled = installCount - unInstallCount > 0;
      const dataSet = hit._id.replace('sample-data-telemetry:', ''); // sample-data-telemetry:ecommerce => ecommerce
      const dataDate = _moment.default.utc(hit._source.updated_at);
      if (isSampleDataSetInstalled) {
        const {
          lastDate,
          lastSet
        } = getLast(dataSet, dataDate, telemetry.last_install_set, telemetry.last_install_date);
        return {
          ...telemetry,
          installed: telemetry.installed.concat(dataSet),
          last_install_date: lastDate,
          last_install_set: lastSet
        };
      } else {
        const {
          lastDate,
          lastSet
        } = getLast(dataSet, dataDate, telemetry.last_uninstall_set, telemetry.last_uninstall_date);
        return {
          ...telemetry,
          uninstalled: telemetry.uninstalled.concat(dataSet),
          last_uninstall_date: lastDate,
          last_uninstall_set: lastSet
        };
      }
    }, initial);
  };
}