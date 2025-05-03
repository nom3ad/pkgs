"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getShardDelayBucketAgg = exports.SHARD_DELAY_AGG_NAME = void 0;
var _bucket_agg_type = require("./bucket_agg_type");
var _shard_delay_fn = require("./shard_delay_fn");
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

const SHARD_DELAY_AGG_NAME = exports.SHARD_DELAY_AGG_NAME = 'shard_delay';
const getShardDelayBucketAgg = () => new _bucket_agg_type.BucketAggType({
  name: SHARD_DELAY_AGG_NAME,
  title: 'Shard Delay',
  expressionName: _shard_delay_fn.aggShardDelayFnName,
  createFilter: () => ({
    match_all: {}
  }),
  customLabels: false,
  params: [{
    name: 'delay',
    type: 'string',
    default: '5s',
    write(aggConfig, output) {
      output.params = {
        ...output.params,
        value: aggConfig.params.delay
      };
    }
  }]
});
exports.getShardDelayBucketAgg = getShardDelayBucketAgg;