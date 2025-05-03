"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.URI = exports.UI_SETTINGS = exports.SEARCH_STRATEGY = exports.S3_PARTITION_INFO_COLUMN = exports.PLUGIN_NAME = exports.PLUGIN_ID = exports.OPENSEARCH_API = exports.ERROR_DETAILS = exports.DATASET = exports.BASE_API_ASSISTANT = exports.BASE_API = exports.API = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const PLUGIN_ID = exports.PLUGIN_ID = 'queryEnhancements';
const PLUGIN_NAME = exports.PLUGIN_NAME = 'queryEnhancements';
const BASE_API = exports.BASE_API = '/api/enhancements';
const BASE_API_ASSISTANT = exports.BASE_API_ASSISTANT = '/api/assistant';
const DATASET = exports.DATASET = {
  S3: 'S3'
};
const SEARCH_STRATEGY = exports.SEARCH_STRATEGY = {
  PPL: 'ppl',
  PPL_RAW: 'pplraw',
  SQL: 'sql',
  SQL_ASYNC: 'sqlasync',
  PPL_ASYNC: 'pplasync'
};
const API = exports.API = {
  SEARCH: `${BASE_API}/search`,
  PPL_SEARCH: `${BASE_API}/search/${SEARCH_STRATEGY.PPL}`,
  SQL_SEARCH: `${BASE_API}/search/${SEARCH_STRATEGY.SQL}`,
  SQL_ASYNC_SEARCH: `${BASE_API}/search/${SEARCH_STRATEGY.SQL_ASYNC}`,
  PPL_ASYNC_SEARCH: `${BASE_API}/search/${SEARCH_STRATEGY.PPL_ASYNC}`,
  QUERY_ASSIST: {
    LANGUAGES: `${BASE_API}/assist/languages`,
    GENERATE: `${BASE_API}/assist/generate`
  },
  DATA_SOURCE: {
    ASYNC_JOBS: `${BASE_API}/jobs`,
    CONNECTIONS: `${BASE_API}/connections`
  },
  AGENT_API: {
    CONFIG_EXISTS: `${BASE_API_ASSISTANT}/agent_config/_exists`
  }
};
const URI = exports.URI = {
  PPL: '/_plugins/_ppl',
  SQL: '/_plugins/_sql',
  ASYNC_QUERY: '/_plugins/_async_query',
  ML: '/_plugins/_ml',
  OBSERVABILITY: '/_plugins/_observability',
  DATA_CONNECTIONS: '/_plugins/_query/_datasources'
};
const OPENSEARCH_API = exports.OPENSEARCH_API = {
  PANELS: `${URI.OBSERVABILITY}/object`,
  DATA_CONNECTIONS: URI.DATA_CONNECTIONS
};
const UI_SETTINGS = exports.UI_SETTINGS = {
  QUERY_ENHANCEMENTS_ENABLED: 'query:enhancements:enabled',
  STATE_STORE_IN_SESSION_STORAGE: 'state:storeInSessionStorage'
};
const ERROR_DETAILS = exports.ERROR_DETAILS = {
  GUARDRAILS_TRIGGERED: 'guardrails triggered'
};
const S3_PARTITION_INFO_COLUMN = exports.S3_PARTITION_INFO_COLUMN = '# Partition Information';