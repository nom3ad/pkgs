"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SORT_DEFAULT_ORDER_SETTING = exports.SEARCH_ON_PAGE_LOAD_SETTING = exports.SAMPLE_SIZE_SETTING = exports.QUERY_ENHANCEMENT_ENABLED_SETTING = exports.PLUGIN_ID = exports.MODIFY_COLUMNS_ON_SWITCH = exports.FIELDS_LIMIT_SETTING = exports.DOC_HIDE_TIME_COLUMN_SETTING = exports.DEFAULT_COLUMNS_SETTING = exports.CONTEXT_TIE_BREAKER_FIELDS_SETTING = exports.CONTEXT_STEP_SETTING = exports.CONTEXT_DEFAULT_SIZE_SETTING = exports.AGGS_TERMS_SIZE_SETTING = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const PLUGIN_ID = exports.PLUGIN_ID = 'discover';
const DEFAULT_COLUMNS_SETTING = exports.DEFAULT_COLUMNS_SETTING = 'defaultColumns';
const SAMPLE_SIZE_SETTING = exports.SAMPLE_SIZE_SETTING = 'discover:sampleSize';
const AGGS_TERMS_SIZE_SETTING = exports.AGGS_TERMS_SIZE_SETTING = 'discover:aggs:terms:size';
const SORT_DEFAULT_ORDER_SETTING = exports.SORT_DEFAULT_ORDER_SETTING = 'discover:sort:defaultOrder';
const SEARCH_ON_PAGE_LOAD_SETTING = exports.SEARCH_ON_PAGE_LOAD_SETTING = 'discover:searchOnPageLoad';
const DOC_HIDE_TIME_COLUMN_SETTING = exports.DOC_HIDE_TIME_COLUMN_SETTING = 'doc_table:hideTimeColumn';
const FIELDS_LIMIT_SETTING = exports.FIELDS_LIMIT_SETTING = 'fields:popularLimit';
const CONTEXT_DEFAULT_SIZE_SETTING = exports.CONTEXT_DEFAULT_SIZE_SETTING = 'context:defaultSize';
const CONTEXT_STEP_SETTING = exports.CONTEXT_STEP_SETTING = 'context:step';
const CONTEXT_TIE_BREAKER_FIELDS_SETTING = exports.CONTEXT_TIE_BREAKER_FIELDS_SETTING = 'context:tieBreakerFields';
const MODIFY_COLUMNS_ON_SWITCH = exports.MODIFY_COLUMNS_ON_SWITCH = 'discover:modifyColumnsOnSwitch';
const QUERY_ENHANCEMENT_ENABLED_SETTING = exports.QUERY_ENHANCEMENT_ENABLED_SETTING = 'query:enhancements:enabled';