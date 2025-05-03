"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeQuery = normalizeQuery;
var _lodash = _interopRequireDefault(require("lodash"));
var _helpers = require("../../helpers");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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

const isEmptyFilter = (filter = {}) => Boolean(filter.match_all) && _lodash.default.isEmpty(filter.match_all);
const hasSiblingPipelineAggregation = (aggs = {}) => Object.keys(aggs).length > 1;

/* Last query handler in the chain. You can use this handler
 * as the last place where you can modify the "doc" (request body) object before sending it to OpenSearch.

 * Important: for Sibling Pipeline aggregation we cannot apply this logic
 *
 */
function normalizeQuery() {
  return () => doc => {
    const series = _lodash.default.get(doc, 'aggs.pivot.aggs');
    const normalizedSeries = {};
    _lodash.default.forEach(series, (value, seriesId) => {
      const filter = _lodash.default.get(value, `filter`);
      if (isEmptyFilter(filter) && !hasSiblingPipelineAggregation(value.aggs)) {
        const agg = _lodash.default.get(value, 'aggs.timeseries');
        const meta = {
          ..._lodash.default.get(value, 'meta'),
          seriesId
        };
        (0, _helpers.overwrite)(normalizedSeries, `${seriesId}`, agg);
        (0, _helpers.overwrite)(normalizedSeries, `${seriesId}.meta`, meta);
      } else {
        (0, _helpers.overwrite)(normalizedSeries, `${seriesId}`, value);
      }
    });
    (0, _helpers.overwrite)(doc, 'aggs.pivot.aggs', normalizedSeries);
    return doc;
  };
}