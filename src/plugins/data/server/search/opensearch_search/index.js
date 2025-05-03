"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  opensearchSearchStrategyProvider: true,
  getTotalLoaded: true,
  shimAbortSignal: true,
  OPENSEARCH_SEARCH_STRATEGY: true,
  IOpenSearchSearchRequest: true,
  IOpenSearchSearchResponse: true
};
Object.defineProperty(exports, "IOpenSearchSearchRequest", {
  enumerable: true,
  get: function () {
    return _common.IOpenSearchSearchRequest;
  }
});
Object.defineProperty(exports, "IOpenSearchSearchResponse", {
  enumerable: true,
  get: function () {
    return _common.IOpenSearchSearchResponse;
  }
});
Object.defineProperty(exports, "OPENSEARCH_SEARCH_STRATEGY", {
  enumerable: true,
  get: function () {
    return _common.OPENSEARCH_SEARCH_STRATEGY;
  }
});
Object.defineProperty(exports, "getTotalLoaded", {
  enumerable: true,
  get: function () {
    return _get_total_loaded.getTotalLoaded;
  }
});
Object.defineProperty(exports, "opensearchSearchStrategyProvider", {
  enumerable: true,
  get: function () {
    return _opensearch_search_strategy.opensearchSearchStrategyProvider;
  }
});
Object.defineProperty(exports, "shimAbortSignal", {
  enumerable: true,
  get: function () {
    return _shim_abort_signal.shimAbortSignal;
  }
});
var _opensearch_search_strategy = require("./opensearch_search_strategy");
var _get_default_search_params = require("./get_default_search_params");
Object.keys(_get_default_search_params).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _get_default_search_params[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _get_default_search_params[key];
    }
  });
});
var _get_total_loaded = require("./get_total_loaded");
var _to_snake_case = require("./to_snake_case");
Object.keys(_to_snake_case).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _to_snake_case[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _to_snake_case[key];
    }
  });
});
var _shim_abort_signal = require("./shim_abort_signal");
var _common = require("../../../common");