"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.query = query;
var _offset_time = require("../../offset_time");
var _get_interval_and_timefield = require("../../get_interval_and_timefield");
var _server = require("../../../../../../data/server");
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

function query(req, panel, series, opensearchQueryConfig, indexPatternObject) {
  return next => doc => {
    const {
      timeField
    } = (0, _get_interval_and_timefield.getIntervalAndTimefield)(panel, series, indexPatternObject);
    const {
      from,
      to
    } = (0, _offset_time.offsetTime)(req, series.offset_time);
    doc.size = 0;
    const queries = !panel.ignore_global_filter ? req.payload.query : [];
    const filters = !panel.ignore_global_filter ? req.payload.filters : [];
    doc.query = _server.opensearchQuery.buildOpenSearchQuery(indexPatternObject, queries, filters, opensearchQueryConfig);
    const timerange = {
      range: {
        [timeField]: {
          gte: from.toISOString(),
          lte: to.toISOString(),
          format: 'strict_date_optional_time'
        }
      }
    };
    doc.query.bool.must.push(timerange);
    if (panel.filter) {
      doc.query.bool.must.push(_server.opensearchQuery.buildOpenSearchQuery(indexPatternObject, [panel.filter], [], opensearchQueryConfig));
    }
    if (series.filter) {
      doc.query.bool.must.push(_server.opensearchQuery.buildOpenSearchQuery(indexPatternObject, [series.filter], [], opensearchQueryConfig));
    }
    return next(doc);
  };
}