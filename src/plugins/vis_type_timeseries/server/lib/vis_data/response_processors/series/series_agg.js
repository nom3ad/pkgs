"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.seriesAgg = seriesAgg;
var _series_agg = require("./_series_agg");
var _lodash = _interopRequireDefault(require("lodash"));
var _get_default_decoration = require("../../helpers/get_default_decoration");
var _calculate_label = require("../../../../../common/calculate_label");
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

function seriesAgg(resp, panel, series) {
  return next => results => {
    if (series.metrics.some(m => m.type === 'series_agg')) {
      const decoration = (0, _get_default_decoration.getDefaultDecoration)(series);
      const targetSeries = [];
      // Filter out the seires with the matching metric and store them
      // in targetSeries
      results = results.filter(s => {
        if (s.id.split(/:/)[0] === series.id) {
          targetSeries.push(s.data);
          return false;
        }
        return true;
      });
      const data = series.metrics.filter(m => m.type === 'series_agg').reduce((acc, m) => {
        const fn = _series_agg.SeriesAgg[m.function];
        return fn && fn(acc) || acc;
      }, targetSeries);
      results.push({
        id: `${series.id}`,
        label: series.label || (0, _calculate_label.calculateLabel)(_lodash.default.last(series.metrics), series.metrics),
        color: series.color,
        data: _lodash.default.first(data),
        ...decoration
      });
    }
    return next(results);
  };
}