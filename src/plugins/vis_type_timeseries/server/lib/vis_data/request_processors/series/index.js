"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processors = void 0;
var _query = require("./query");
var _split_by_everything = require("./split_by_everything");
var _split_by_filter = require("./split_by_filter");
var _split_by_filters = require("./split_by_filters");
var _split_by_terms = require("./split_by_terms");
var _date_histogram = require("./date_histogram");
var _metric_buckets = require("./metric_buckets");
var _sibling_buckets = require("./sibling_buckets");
var _filter_ratios = require("./filter_ratios");
var _positive_rate = require("./positive_rate");
var _normalize_query = require("./normalize_query");
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

const processors = exports.processors = [_query.query, _split_by_terms.splitByTerms, _split_by_filter.splitByFilter, _split_by_filters.splitByFilters, _split_by_everything.splitByEverything, _date_histogram.dateHistogram, _metric_buckets.metricBuckets, _sibling_buckets.siblingBuckets, _filter_ratios.ratios, _positive_rate.positiveRate, _normalize_query.normalizeQuery];