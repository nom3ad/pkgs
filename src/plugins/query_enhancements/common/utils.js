"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.throwFacetError = exports.removeKeyword = exports.handleQueryStatus = exports.getFields = exports.formatDate = exports.fetch = exports.buildQueryStatusConfig = void 0;
var _rxjs = require("rxjs");
var _operators = require("rxjs/operators");
var _std = require("@osd/std");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const formatDate = dateString => {
  const date = new Date(dateString);
  return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
};
exports.formatDate = formatDate;
const getFields = rawResponse => {
  var _rawResponse$data$sch;
  return (_rawResponse$data$sch = rawResponse.data.schema) === null || _rawResponse$data$sch === void 0 ? void 0 : _rawResponse$data$sch.map((field, index) => {
    var _rawResponse$data$dat;
    return {
      ...field,
      values: (_rawResponse$data$dat = rawResponse.data.datarows) === null || _rawResponse$data$dat === void 0 ? void 0 : _rawResponse$data$dat.map(row => row[index])
    };
  });
};
exports.getFields = getFields;
const removeKeyword = queryString => {
  var _queryString$replace;
  return (_queryString$replace = queryString === null || queryString === void 0 ? void 0 : queryString.replace(new RegExp('.keyword'), '')) !== null && _queryString$replace !== void 0 ? _queryString$replace : '';
};
exports.removeKeyword = removeKeyword;
const throwFacetError = response => {
  var _ref, _response$data$body$m, _response$data$body, _ref2, _response$data$status;
  const error = new Error((_ref = (_response$data$body$m = (_response$data$body = response.data.body) === null || _response$data$body === void 0 ? void 0 : _response$data$body.message) !== null && _response$data$body$m !== void 0 ? _response$data$body$m : response.data.body) !== null && _ref !== void 0 ? _ref : response.data);
  error.name = (_ref2 = (_response$data$status = response.data.status) !== null && _response$data$status !== void 0 ? _response$data$status : response.status) !== null && _ref2 !== void 0 ? _ref2 : response.data.statusCode;
  error.status = error.name;
  throw error;
};
exports.throwFacetError = throwFacetError;
const fetch = (context, query, aggConfig) => {
  var _context$body, _context$body2;
  const {
    http,
    path,
    signal
  } = context;
  const body = (0, _std.stringify)({
    query: {
      ...query,
      format: 'jdbc'
    },
    aggConfig,
    pollQueryResultsParams: (_context$body = context.body) === null || _context$body === void 0 ? void 0 : _context$body.pollQueryResultsParams,
    timeRange: (_context$body2 = context.body) === null || _context$body2 === void 0 ? void 0 : _context$body2.timeRange
  });
  return (0, _rxjs.from)(http.fetch({
    method: 'POST',
    path,
    body,
    signal
  }));
};
exports.fetch = fetch;
const handleQueryStatus = options => {
  const {
    fetchStatus,
    interval = 5000,
    isServer = false
  } = options;
  return (0, _rxjs.timer)(0, interval).pipe((0, _operators.mergeMap)(() => fetchStatus()), (0, _operators.takeWhile)(response => {
    var _data, _status;
    const status = isServer ? response === null || response === void 0 || (_data = response.data) === null || _data === void 0 || (_data = _data.status) === null || _data === void 0 ? void 0 : _data.toUpperCase() : response === null || response === void 0 || (_status = response.status) === null || _status === void 0 ? void 0 : _status.toUpperCase();
    return status !== 'SUCCESS' && status !== 'FAILED';
  }, true), (0, _operators.filter)(response => {
    var _data2, _status2;
    const status = isServer ? response === null || response === void 0 || (_data2 = response.data) === null || _data2 === void 0 || (_data2 = _data2.status) === null || _data2 === void 0 ? void 0 : _data2.toUpperCase() : response === null || response === void 0 || (_status2 = response.status) === null || _status2 === void 0 ? void 0 : _status2.toUpperCase();
    if (status === 'FAILED') {
      throw new Error('Job failed');
    }
    return status === 'SUCCESS';
  }), (0, _operators.take)(1)).toPromise();
};
exports.handleQueryStatus = handleQueryStatus;
const buildQueryStatusConfig = response => {
  return {
    queryId: response.data.queryId,
    sessionId: response.data.sessionId
  };
};
exports.buildQueryStatusConfig = buildQueryStatusConfig;