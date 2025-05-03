"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.visPayloadSchema = exports.seriesItems = exports.panel = exports.metricsItems = void 0;
var _configSchema = require("@osd/config-schema");
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

const stringOptionalNullable = _configSchema.schema.maybe(_configSchema.schema.nullable(_configSchema.schema.string()));
const stringRequired = _configSchema.schema.string();
const arrayNullable = _configSchema.schema.arrayOf(_configSchema.schema.nullable(_configSchema.schema.any()));
const validateInteger = value => {
  if (!Number.isInteger(value)) {
    return `${value} is not an integer`;
  }
};
const numberIntegerOptional = _configSchema.schema.maybe(_configSchema.schema.number({
  validate: validateInteger
}));
const numberIntegerRequired = _configSchema.schema.number({
  validate: validateInteger
});
const numberOptional = _configSchema.schema.maybe(_configSchema.schema.number());
const queryObject = _configSchema.schema.object({
  language: _configSchema.schema.string(),
  query: _configSchema.schema.string()
});
const stringOrNumberOptionalNullable = _configSchema.schema.nullable(_configSchema.schema.oneOf([stringOptionalNullable, numberOptional]));
const numberOptionalOrEmptyString = _configSchema.schema.maybe(_configSchema.schema.oneOf([numberOptional, _configSchema.schema.literal('')]));
const annotationsItems = _configSchema.schema.object({
  color: stringOptionalNullable,
  fields: stringOptionalNullable,
  hidden: _configSchema.schema.maybe(_configSchema.schema.boolean()),
  icon: stringOptionalNullable,
  id: stringOptionalNullable,
  ignore_global_filters: numberIntegerOptional,
  ignore_panel_filters: numberIntegerOptional,
  index_pattern: stringOptionalNullable,
  query_string: _configSchema.schema.maybe(queryObject),
  template: stringOptionalNullable,
  time_field: stringOptionalNullable
});
const backgroundColorRulesItems = _configSchema.schema.object({
  value: _configSchema.schema.maybe(_configSchema.schema.nullable(_configSchema.schema.number())),
  id: stringOptionalNullable,
  background_color: stringOptionalNullable,
  color: stringOptionalNullable,
  operator: stringOptionalNullable
});
const gaugeColorRulesItems = _configSchema.schema.object({
  gauge: stringOptionalNullable,
  text: stringOptionalNullable,
  id: stringOptionalNullable,
  operator: stringOptionalNullable,
  value: _configSchema.schema.maybe(_configSchema.schema.nullable(_configSchema.schema.number()))
});
const metricsItems = exports.metricsItems = _configSchema.schema.object({
  field: stringOptionalNullable,
  id: stringRequired,
  metric_agg: stringOptionalNullable,
  numerator: _configSchema.schema.maybe(queryObject),
  denominator: _configSchema.schema.maybe(queryObject),
  sigma: stringOptionalNullable,
  unit: stringOptionalNullable,
  model_type: stringOptionalNullable,
  mode: stringOptionalNullable,
  lag: numberOptionalOrEmptyString,
  alpha: numberOptional,
  beta: numberOptional,
  gamma: numberOptional,
  period: numberOptional,
  multiplicative: _configSchema.schema.maybe(_configSchema.schema.boolean()),
  window: numberOptional,
  function: stringOptionalNullable,
  script: stringOptionalNullable,
  variables: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.object({
    field: stringOptionalNullable,
    id: stringRequired,
    name: stringOptionalNullable
  }))),
  percentiles: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.object({
    id: stringRequired,
    field: stringOptionalNullable,
    mode: _configSchema.schema.oneOf([_configSchema.schema.literal('line'), _configSchema.schema.literal('band')]),
    shade: _configSchema.schema.oneOf([numberOptional, stringOptionalNullable]),
    value: _configSchema.schema.maybe(_configSchema.schema.oneOf([numberOptional, stringOptionalNullable])),
    percentile: stringOptionalNullable
  }))),
  type: stringRequired,
  value: stringOptionalNullable,
  values: _configSchema.schema.maybe(_configSchema.schema.nullable(_configSchema.schema.arrayOf(_configSchema.schema.nullable(_configSchema.schema.string())))),
  size: stringOptionalNullable,
  agg_with: stringOptionalNullable,
  order: stringOptionalNullable,
  order_by: stringOptionalNullable
});
const splitFiltersItems = _configSchema.schema.object({
  id: stringOptionalNullable,
  color: stringOptionalNullable,
  filter: _configSchema.schema.maybe(queryObject),
  label: stringOptionalNullable
});
const seriesItems = exports.seriesItems = _configSchema.schema.object({
  aggregate_by: stringOptionalNullable,
  aggregate_function: stringOptionalNullable,
  axis_position: stringRequired,
  axis_max: stringOrNumberOptionalNullable,
  axis_min: stringOrNumberOptionalNullable,
  chart_type: stringRequired,
  color: stringRequired,
  color_rules: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.object({
    value: numberOptional,
    id: stringRequired,
    text: stringOptionalNullable,
    operator: stringOptionalNullable
  }))),
  fill: numberOptionalOrEmptyString,
  filter: _configSchema.schema.maybe(_configSchema.schema.oneOf([_configSchema.schema.object({
    query: stringRequired,
    language: stringOptionalNullable
  }), _configSchema.schema.literal('')])),
  formatter: stringRequired,
  hide_in_legend: numberIntegerOptional,
  hidden: _configSchema.schema.maybe(_configSchema.schema.boolean()),
  id: stringRequired,
  label: stringOptionalNullable,
  line_width: numberOptionalOrEmptyString,
  metrics: _configSchema.schema.arrayOf(metricsItems),
  offset_time: stringOptionalNullable,
  override_index_pattern: numberOptional,
  point_size: numberOptionalOrEmptyString,
  separate_axis: numberIntegerOptional,
  seperate_axis: numberIntegerOptional,
  series_index_pattern: stringOptionalNullable,
  series_time_field: stringOptionalNullable,
  series_interval: stringOptionalNullable,
  series_drop_last_bucket: numberIntegerOptional,
  split_color_mode: stringOptionalNullable,
  split_filters: _configSchema.schema.maybe(_configSchema.schema.arrayOf(splitFiltersItems)),
  split_mode: stringRequired,
  stacked: stringRequired,
  steps: numberIntegerOptional,
  terms_field: stringOptionalNullable,
  terms_order_by: stringOptionalNullable,
  terms_size: stringOptionalNullable,
  terms_direction: stringOptionalNullable,
  terms_include: stringOptionalNullable,
  terms_exclude: stringOptionalNullable,
  time_range_mode: stringOptionalNullable,
  trend_arrows: numberOptional,
  type: stringOptionalNullable,
  value_template: stringOptionalNullable,
  var_name: stringOptionalNullable
});
const panel = exports.panel = _configSchema.schema.object({
  annotations: _configSchema.schema.maybe(_configSchema.schema.arrayOf(annotationsItems)),
  axis_formatter: stringRequired,
  axis_position: stringRequired,
  axis_scale: stringRequired,
  axis_min: stringOrNumberOptionalNullable,
  axis_max: stringOrNumberOptionalNullable,
  bar_color_rules: _configSchema.schema.maybe(arrayNullable),
  background_color: stringOptionalNullable,
  background_color_rules: _configSchema.schema.maybe(_configSchema.schema.arrayOf(backgroundColorRulesItems)),
  default_index_pattern: stringOptionalNullable,
  default_timefield: stringOptionalNullable,
  drilldown_url: stringOptionalNullable,
  drop_last_bucket: numberIntegerOptional,
  filter: _configSchema.schema.nullable(_configSchema.schema.oneOf([stringOptionalNullable, _configSchema.schema.object({
    language: stringOptionalNullable,
    query: stringOptionalNullable
  })])),
  gauge_color_rules: _configSchema.schema.maybe(_configSchema.schema.arrayOf(gaugeColorRulesItems)),
  gauge_width: _configSchema.schema.nullable(_configSchema.schema.oneOf([stringOptionalNullable, numberOptional])),
  gauge_inner_color: stringOptionalNullable,
  gauge_inner_width: stringOrNumberOptionalNullable,
  gauge_style: stringOptionalNullable,
  gauge_max: stringOrNumberOptionalNullable,
  id: stringRequired,
  ignore_global_filters: numberOptional,
  ignore_global_filter: numberOptional,
  index_pattern: stringRequired,
  data_source_id: stringOptionalNullable,
  interval: stringRequired,
  isModelInvalid: _configSchema.schema.maybe(_configSchema.schema.boolean()),
  legend_position: stringOptionalNullable,
  markdown: stringOptionalNullable,
  markdown_scrollbars: numberIntegerOptional,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  markdown_openLinksInNewTab: numberIntegerOptional,
  markdown_vertical_align: stringOptionalNullable,
  markdown_less: stringOptionalNullable,
  markdown_css: stringOptionalNullable,
  pivot_id: stringOptionalNullable,
  pivot_label: stringOptionalNullable,
  pivot_type: stringOptionalNullable,
  pivot_rows: stringOptionalNullable,
  series: _configSchema.schema.arrayOf(seriesItems),
  show_grid: numberIntegerRequired,
  show_legend: numberIntegerRequired,
  tooltip_mode: _configSchema.schema.maybe(_configSchema.schema.oneOf([_configSchema.schema.literal('show_all'), _configSchema.schema.literal('show_focused')])),
  time_field: stringOptionalNullable,
  time_range_mode: stringOptionalNullable,
  type: stringRequired
});
const visPayloadSchema = exports.visPayloadSchema = _configSchema.schema.object({
  filters: arrayNullable,
  panels: _configSchema.schema.arrayOf(panel),
  // general
  query: _configSchema.schema.nullable(_configSchema.schema.arrayOf(queryObject)),
  state: _configSchema.schema.object({
    sort: _configSchema.schema.maybe(_configSchema.schema.object({
      column: stringRequired,
      order: _configSchema.schema.oneOf([_configSchema.schema.literal('asc'), _configSchema.schema.literal('desc')])
    }))
  }),
  savedObjectId: _configSchema.schema.maybe(_configSchema.schema.string()),
  timerange: _configSchema.schema.object({
    timezone: stringRequired,
    min: stringRequired,
    max: stringRequired
  })
});