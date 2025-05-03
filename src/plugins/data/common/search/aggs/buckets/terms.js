"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.termsAggFilter = exports.getTermsBucketAgg = void 0;
var _lodash = require("lodash");
var _i18n = require("@osd/i18n");
var _bucket_agg_type = require("./bucket_agg_type");
var _bucket_agg_types = require("./bucket_agg_types");
var _terms = require("./create_filter/terms");
var _migrate_include_exclude_format = require("./migrate_include_exclude_format");
var _common = require("../../../../common");
var _expressions = require("../../expressions");
var _terms_other_bucket_helper = require("./_terms_other_bucket_helper");
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

const termsAggFilter = exports.termsAggFilter = ['!top_hits', '!percentiles', '!median', '!std_dev', '!derivative', '!moving_avg', '!serial_diff', '!cumulative_sum', '!avg_bucket', '!max_bucket', '!min_bucket', '!sum_bucket'];
const termsTitle = _i18n.i18n.translate('data.search.aggs.buckets.termsTitle', {
  defaultMessage: 'Terms'
});
const getTermsBucketAgg = () => new _bucket_agg_type.BucketAggType({
  name: _bucket_agg_types.BUCKET_TYPES.TERMS,
  expressionName: 'aggTerms',
  title: termsTitle,
  makeLabel(agg) {
    const params = agg.params;
    return agg.getFieldDisplayName() + ': ' + params.order.text;
  },
  getSerializedFormat(agg) {
    const format = agg.params.field ? agg.aggConfigs.indexPattern.getFormatterForField(agg.params.field).toJSON() : {
      id: undefined,
      params: undefined
    };
    return {
      id: 'terms',
      params: {
        id: format.id,
        otherBucketLabel: agg.params.otherBucketLabel,
        missingBucketLabel: agg.params.missingBucketLabel,
        ...format.params
      }
    };
  },
  createFilter: _terms.createFilterTerms,
  postFlightRequest: async (resp, aggConfigs, aggConfig, searchSource, inspectorRequestAdapter, abortSignal) => {
    if (!resp.aggregations) return resp;
    const nestedSearchSource = searchSource.createChild();
    if (aggConfig.params.otherBucket) {
      const filterAgg = (0, _terms_other_bucket_helper.buildOtherBucketAgg)(aggConfigs, aggConfig, resp);
      if (!filterAgg) return resp;
      nestedSearchSource.setField('aggs', filterAgg);
      const request = inspectorRequestAdapter.start(_i18n.i18n.translate('data.search.aggs.buckets.terms.otherBucketTitle', {
        defaultMessage: 'Other bucket'
      }), {
        description: _i18n.i18n.translate('data.search.aggs.buckets.terms.otherBucketDescription', {
          defaultMessage: 'This request counts the number of documents that fall ' + 'outside the criterion of the data buckets.'
        })
      });
      nestedSearchSource.getSearchRequestBody().then(body => {
        request.json(body);
      });
      request.stats((0, _expressions.getRequestInspectorStats)(nestedSearchSource));
      const response = await nestedSearchSource.fetch({
        abortSignal
      });
      request.stats((0, _expressions.getResponseInspectorStats)(response, nestedSearchSource)).ok({
        json: response
      });
      resp = (0, _terms_other_bucket_helper.mergeOtherBucketAggResponse)(aggConfigs, resp, response, aggConfig, filterAgg());
    }
    if (aggConfig.params.missingBucket) {
      resp = (0, _terms_other_bucket_helper.updateMissingBucket)(resp, aggConfigs, aggConfig);
    }
    return resp;
  },
  params: [{
    name: 'field',
    type: 'field',
    filterFieldTypes: [_common.OSD_FIELD_TYPES.NUMBER, _common.OSD_FIELD_TYPES.BOOLEAN, _common.OSD_FIELD_TYPES.DATE, _common.OSD_FIELD_TYPES.IP, _common.OSD_FIELD_TYPES.STRING]
  }, {
    name: 'orderBy',
    write: _lodash.noop // prevent default write, it's handled by orderAgg
  }, {
    name: 'orderAgg',
    type: 'agg',
    allowedAggs: termsAggFilter,
    default: null,
    makeAgg(termsAgg, state = {
      type: 'count'
    }) {
      state.schema = 'orderAgg';
      const orderAgg = termsAgg.aggConfigs.createAggConfig(state, {
        addToAggConfigs: false
      });
      orderAgg.id = termsAgg.id + '-orderAgg';
      return orderAgg;
    },
    write(agg, output, aggs) {
      const dir = agg.params.order.value;
      const order = output.params.order = {};
      let orderAgg = agg.params.orderAgg || aggs.getResponseAggById(agg.params.orderBy);

      // TODO: This works around an OpenSearch bug the always casts terms agg scripts to strings
      // thus causing issues with filtering. This probably causes other issues since float might not
      // be able to contain the number on the OpenSearch side
      if (output.params.script) {
        output.params.value_type = agg.getField().type === 'number' ? 'float' : agg.getField().type;
      }
      if (agg.params.missingBucket && agg.params.field.type === 'string') {
        output.params.missing = '__missing__';
      }
      if (!orderAgg) {
        order[agg.params.orderBy || '_count'] = dir;
        return;
      }
      if (orderAgg.type.name === 'count') {
        order._count = dir;
        return;
      }
      const orderAggId = orderAgg.id;
      if (orderAgg.parentId && aggs) {
        orderAgg = aggs.byId(orderAgg.parentId);
      }
      output.subAggs = (output.subAggs || []).concat(orderAgg);
      order[orderAggId] = dir;
    }
  }, {
    name: 'order',
    type: 'optioned',
    default: 'desc',
    options: [{
      text: _i18n.i18n.translate('data.search.aggs.buckets.terms.orderDescendingTitle', {
        defaultMessage: 'Descending'
      }),
      value: 'desc'
    }, {
      text: _i18n.i18n.translate('data.search.aggs.buckets.terms.orderAscendingTitle', {
        defaultMessage: 'Ascending'
      }),
      value: 'asc'
    }],
    write: _lodash.noop // prevent default write, it's handled by orderAgg
  }, {
    name: 'size',
    default: 5
  }, {
    name: 'otherBucket',
    default: false,
    write: _lodash.noop
  }, {
    name: 'otherBucketLabel',
    type: 'string',
    default: _i18n.i18n.translate('data.search.aggs.buckets.terms.otherBucketLabel', {
      defaultMessage: 'Other'
    }),
    displayName: _i18n.i18n.translate('data.search.aggs.otherBucket.labelForOtherBucketLabel', {
      defaultMessage: 'Label for other bucket'
    }),
    shouldShow: agg => agg.getParam('otherBucket'),
    write: _lodash.noop
  }, {
    name: 'missingBucket',
    default: false,
    write: _lodash.noop
  }, {
    name: 'missingBucketLabel',
    default: _i18n.i18n.translate('data.search.aggs.buckets.terms.missingBucketLabel', {
      defaultMessage: 'Missing',
      description: `Default label used in charts when documents are missing a field.
          Visible when you create a chart with a terms aggregation and enable "Show missing values"`
    }),
    type: 'string',
    displayName: _i18n.i18n.translate('data.search.aggs.otherBucket.labelForMissingValuesLabel', {
      defaultMessage: 'Label for missing values'
    }),
    shouldShow: agg => agg.getParam('missingBucket'),
    write: _lodash.noop
  }, {
    name: 'exclude',
    displayName: _i18n.i18n.translate('data.search.aggs.buckets.terms.excludeLabel', {
      defaultMessage: 'Exclude'
    }),
    type: 'string',
    advanced: true,
    shouldShow: _migrate_include_exclude_format.isStringOrNumberType,
    ..._migrate_include_exclude_format.migrateIncludeExcludeFormat
  }, {
    name: 'include',
    displayName: _i18n.i18n.translate('data.search.aggs.buckets.terms.includeLabel', {
      defaultMessage: 'Include'
    }),
    type: 'string',
    advanced: true,
    shouldShow: _migrate_include_exclude_format.isStringOrNumberType,
    ..._migrate_include_exclude_format.migrateIncludeExcludeFormat
  }]
});
exports.getTermsBucketAgg = getTermsBucketAgg;