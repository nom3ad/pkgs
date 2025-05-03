"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dateHistogram = dateHistogram;
var _helpers = require("../../helpers");
var _get_bucket_size = require("../../helpers/get_bucket_size");
var _get_timerange_mode = require("../../helpers/get_timerange_mode");
var _get_interval_and_timefield = require("../../get_interval_and_timefield");
var _get_timerange = require("../../helpers/get_timerange");
var _calculate_agg_root = require("./calculate_agg_root");
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

const {
  dateHistogramInterval
} = _server.search.aggs;
function dateHistogram(req, panel, opensearchQueryConfig, indexPatternObject, capabilities) {
  return next => doc => {
    const {
      timeField,
      interval
    } = (0, _get_interval_and_timefield.getIntervalAndTimefield)(panel, {}, indexPatternObject);
    const meta = {
      timeField
    };
    const getDateHistogramForLastBucketMode = () => {
      const {
        bucketSize,
        intervalString
      } = (0, _get_bucket_size.getBucketSize)(req, interval, capabilities);
      const {
        from,
        to
      } = (0, _get_timerange.getTimerange)(req);
      const timezone = capabilities.searchTimezone;
      panel.series.forEach(column => {
        const aggRoot = (0, _calculate_agg_root.calculateAggRoot)(doc, column);
        (0, _helpers.overwrite)(doc, `${aggRoot}.timeseries.date_histogram`, {
          field: timeField,
          min_doc_count: 0,
          time_zone: timezone,
          extended_bounds: {
            min: from.valueOf(),
            max: to.valueOf()
          },
          ...dateHistogramInterval(intervalString)
        });
        (0, _helpers.overwrite)(doc, aggRoot.replace(/\.aggs$/, '.meta'), {
          timeField,
          intervalString,
          bucketSize
        });
      });
    };
    const getDateHistogramForEntireTimerangeMode = () => {
      panel.series.forEach(column => {
        const aggRoot = (0, _calculate_agg_root.calculateAggRoot)(doc, column);
        (0, _helpers.overwrite)(doc, `${aggRoot}.timeseries.auto_date_histogram`, {
          field: timeField,
          buckets: 1
        });
        (0, _helpers.overwrite)(doc, aggRoot.replace(/\.aggs$/, '.meta'), meta);
      });
    };
    (0, _get_timerange_mode.isLastValueTimerangeMode)(panel) ? getDateHistogramForLastBucketMode() : getDateHistogramForEntireTimerangeMode();
    return next(doc);
  };
}