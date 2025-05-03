"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTableData = getTableData;
var _build_request_body = require("./table/build_request_body");
var _handle_error_response = require("./handle_error_response");
var _lodash = require("lodash");
var _process_bucket = require("./table/process_bucket");
var _get_opensearch_query_uisettings = require("./helpers/get_opensearch_query_uisettings");
var _get_index_pattern = require("./helpers/get_index_pattern");
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

async function getTableData(req, panel) {
  const panelIndexPattern = panel.index_pattern;
  const panelDataSourceId = panel.data_source_id;
  const {
    searchStrategy,
    capabilities
  } = await req.framework.searchStrategyRegistry.getViableStrategy(req, panelIndexPattern);
  const opensearchQueryConfig = await (0, _get_opensearch_query_uisettings.getOpenSearchQueryConfig)(req);
  const {
    indexPatternObject
  } = await (0, _get_index_pattern.getIndexPatternObject)(req, panelIndexPattern);
  const meta = {
    type: panel.type,
    uiRestrictions: capabilities.uiRestrictions
  };
  try {
    const body = (0, _build_request_body.buildRequestBody)(req, panel, opensearchQueryConfig, indexPatternObject, capabilities);
    const [resp] = await searchStrategy.search(req, [{
      body,
      index: panelIndexPattern
    }], {}, panelDataSourceId);
    const buckets = (0, _lodash.get)(resp.rawResponse ? resp.rawResponse : resp, 'aggregations.pivot.buckets', []);
    return {
      ...meta,
      series: buckets.map((0, _process_bucket.processBucket)(panel))
    };
  } catch (err) {
    if (err.body || err.name === 'DQLSyntaxError') {
      err.response = err.body;
      return {
        ...meta,
        ...(0, _handle_error_response.handleErrorResponse)(panel)(err)
      };
    }
  }
}