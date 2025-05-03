"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.splitByTerms = splitByTerms;
var _helpers = require("../../helpers");
var _basic_aggs = require("../../../../../common/basic_aggs");
var _get_buckets_path = require("../../helpers/get_buckets_path");
var _bucket_transform = require("../../helpers/bucket_transform");
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

function splitByTerms(req, panel, series) {
  return next => doc => {
    if (series.split_mode === 'terms' && series.terms_field) {
      const direction = series.terms_direction || 'desc';
      const metric = series.metrics.find(item => item.id === series.terms_order_by);
      (0, _helpers.overwrite)(doc, `aggs.${series.id}.terms.field`, series.terms_field);
      (0, _helpers.overwrite)(doc, `aggs.${series.id}.terms.size`, series.terms_size);
      if (series.terms_include) {
        (0, _helpers.overwrite)(doc, `aggs.${series.id}.terms.include`, series.terms_include);
      }
      if (series.terms_exclude) {
        (0, _helpers.overwrite)(doc, `aggs.${series.id}.terms.exclude`, series.terms_exclude);
      }
      if (metric && metric.type !== 'count' && ~_basic_aggs.basicAggs.indexOf(metric.type)) {
        const sortAggKey = `${series.terms_order_by}-SORT`;
        const fn = _bucket_transform.bucketTransform[metric.type];
        const bucketPath = (0, _get_buckets_path.getBucketsPath)(series.terms_order_by, series.metrics).replace(series.terms_order_by, sortAggKey);
        (0, _helpers.overwrite)(doc, `aggs.${series.id}.terms.order`, {
          [bucketPath]: direction
        });
        (0, _helpers.overwrite)(doc, `aggs.${series.id}.aggs`, {
          [sortAggKey]: fn(metric)
        });
      } else if (['_key', '_count'].includes(series.terms_order_by)) {
        (0, _helpers.overwrite)(doc, `aggs.${series.id}.terms.order`, {
          [series.terms_order_by]: direction
        });
      } else {
        (0, _helpers.overwrite)(doc, `aggs.${series.id}.terms.order`, {
          _count: direction
        });
      }
    }
    return next(doc);
  };
}