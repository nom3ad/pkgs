"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dropLastBucket = dropLastBucket;
var _lodash = require("lodash");
var _get_timerange_mode = require("../../helpers/get_timerange_mode");
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

function dropLastBucket(resp, panel, series) {
  return next => results => {
    const shouldDropLastBucket = (0, _get_timerange_mode.isLastValueTimerangeMode)(panel, series);
    if (shouldDropLastBucket) {
      const seriesDropLastBucket = (0, _lodash.get)(series, 'override_drop_last_bucket', 1);
      const dropLastBucket = (0, _lodash.get)(panel, 'drop_last_bucket', seriesDropLastBucket);
      if (dropLastBucket) {
        results.forEach(item => {
          item.data = item.data.slice(0, item.data.length - 1);
        });
      }
    }
    return next(results);
  };
}