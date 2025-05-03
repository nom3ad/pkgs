"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  ISearchStrategy: true,
  ISearchSetup: true,
  ISearchStart: true,
  SearchEnhancements: true,
  usageProvider: true,
  SearchUsage: true,
  shimHitsTotal: true
};
Object.defineProperty(exports, "ISearchSetup", {
  enumerable: true,
  get: function () {
    return _types.ISearchSetup;
  }
});
Object.defineProperty(exports, "ISearchStart", {
  enumerable: true,
  get: function () {
    return _types.ISearchStart;
  }
});
Object.defineProperty(exports, "ISearchStrategy", {
  enumerable: true,
  get: function () {
    return _types.ISearchStrategy;
  }
});
Object.defineProperty(exports, "SearchEnhancements", {
  enumerable: true,
  get: function () {
    return _types.SearchEnhancements;
  }
});
Object.defineProperty(exports, "SearchUsage", {
  enumerable: true,
  get: function () {
    return _collectors.SearchUsage;
  }
});
Object.defineProperty(exports, "shimHitsTotal", {
  enumerable: true,
  get: function () {
    return _routes.shimHitsTotal;
  }
});
Object.defineProperty(exports, "usageProvider", {
  enumerable: true,
  get: function () {
    return _collectors.usageProvider;
  }
});
var _types = require("./types");
var _opensearch_search = require("./opensearch_search");
Object.keys(_opensearch_search).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _opensearch_search[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _opensearch_search[key];
    }
  });
});
var _collectors = require("./collectors");
var _aggs = require("./aggs");
Object.keys(_aggs).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _aggs[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _aggs[key];
    }
  });
});
var _routes = require("./routes");