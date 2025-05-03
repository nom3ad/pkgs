"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processors = void 0;
var _percentile = require("./percentile");
var _percentile_rank = require("./percentile_rank");
var _series_agg = require("./series_agg");
var _std_deviation_bands = require("./std_deviation_bands");
var _std_deviation_sibling = require("./std_deviation_sibling");
var _std_metric = require("./std_metric");
var _std_sibling = require("./std_sibling");
var _time_shift = require("./time_shift");
var _drop_last_bucket = require("./drop_last_bucket");
var _math = require("./math");
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

const processors = exports.processors = [_percentile.percentile, _percentile_rank.percentileRank, _std_deviation_bands.stdDeviationBands, _std_deviation_sibling.stdDeviationSibling, _std_metric.stdMetric, _std_sibling.stdSibling, _math.mathAgg, _series_agg.seriesAgg, _time_shift.timeShift, _drop_last_bucket.dropLastBucket];