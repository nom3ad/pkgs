"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  OpenSearchService: true,
  config: true,
  configSchema: true,
  OpenSearchConfig: true,
  NodesVersionCompatibility: true,
  OpenSearchServiceSetup: true,
  OpenSearchServiceStart: true,
  OpenSearchStatusMeta: true,
  InternalOpenSearchServiceSetup: true,
  InternalOpenSearchServiceStart: true,
  FakeRequest: true,
  ScopeableRequest: true,
  IClusterClient: true,
  ICustomClusterClient: true,
  OpenSearchClientConfig: true,
  OpenSearchClient: true,
  IScopedClusterClient: true,
  SearchResponse: true,
  CountResponse: true,
  ShardsInfo: true,
  ShardsResponse: true,
  Explanation: true,
  GetResponse: true,
  DeleteDocumentResponse: true
};
Object.defineProperty(exports, "CountResponse", {
  enumerable: true,
  get: function () {
    return _client.CountResponse;
  }
});
Object.defineProperty(exports, "DeleteDocumentResponse", {
  enumerable: true,
  get: function () {
    return _client.DeleteDocumentResponse;
  }
});
Object.defineProperty(exports, "Explanation", {
  enumerable: true,
  get: function () {
    return _client.Explanation;
  }
});
Object.defineProperty(exports, "FakeRequest", {
  enumerable: true,
  get: function () {
    return _types.FakeRequest;
  }
});
Object.defineProperty(exports, "GetResponse", {
  enumerable: true,
  get: function () {
    return _client.GetResponse;
  }
});
Object.defineProperty(exports, "IClusterClient", {
  enumerable: true,
  get: function () {
    return _client.IClusterClient;
  }
});
Object.defineProperty(exports, "ICustomClusterClient", {
  enumerable: true,
  get: function () {
    return _client.ICustomClusterClient;
  }
});
Object.defineProperty(exports, "IScopedClusterClient", {
  enumerable: true,
  get: function () {
    return _client.IScopedClusterClient;
  }
});
Object.defineProperty(exports, "InternalOpenSearchServiceSetup", {
  enumerable: true,
  get: function () {
    return _types.InternalOpenSearchServiceSetup;
  }
});
Object.defineProperty(exports, "InternalOpenSearchServiceStart", {
  enumerable: true,
  get: function () {
    return _types.InternalOpenSearchServiceStart;
  }
});
Object.defineProperty(exports, "NodesVersionCompatibility", {
  enumerable: true,
  get: function () {
    return _ensure_opensearch_version.NodesVersionCompatibility;
  }
});
Object.defineProperty(exports, "OpenSearchClient", {
  enumerable: true,
  get: function () {
    return _client.OpenSearchClient;
  }
});
Object.defineProperty(exports, "OpenSearchClientConfig", {
  enumerable: true,
  get: function () {
    return _client.OpenSearchClientConfig;
  }
});
Object.defineProperty(exports, "OpenSearchConfig", {
  enumerable: true,
  get: function () {
    return _opensearch_config.OpenSearchConfig;
  }
});
Object.defineProperty(exports, "OpenSearchService", {
  enumerable: true,
  get: function () {
    return _opensearch_service.OpenSearchService;
  }
});
Object.defineProperty(exports, "OpenSearchServiceSetup", {
  enumerable: true,
  get: function () {
    return _types.OpenSearchServiceSetup;
  }
});
Object.defineProperty(exports, "OpenSearchServiceStart", {
  enumerable: true,
  get: function () {
    return _types.OpenSearchServiceStart;
  }
});
Object.defineProperty(exports, "OpenSearchStatusMeta", {
  enumerable: true,
  get: function () {
    return _types.OpenSearchStatusMeta;
  }
});
Object.defineProperty(exports, "ScopeableRequest", {
  enumerable: true,
  get: function () {
    return _types.ScopeableRequest;
  }
});
Object.defineProperty(exports, "SearchResponse", {
  enumerable: true,
  get: function () {
    return _client.SearchResponse;
  }
});
Object.defineProperty(exports, "ShardsInfo", {
  enumerable: true,
  get: function () {
    return _client.ShardsInfo;
  }
});
Object.defineProperty(exports, "ShardsResponse", {
  enumerable: true,
  get: function () {
    return _client.ShardsResponse;
  }
});
Object.defineProperty(exports, "config", {
  enumerable: true,
  get: function () {
    return _opensearch_config.config;
  }
});
Object.defineProperty(exports, "configSchema", {
  enumerable: true,
  get: function () {
    return _opensearch_config.configSchema;
  }
});
var _opensearch_service = require("./opensearch_service");
var _opensearch_config = require("./opensearch_config");
var _ensure_opensearch_version = require("./version_check/ensure_opensearch_version");
var _types = require("./types");
var _legacy = require("./legacy");
Object.keys(_legacy).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _legacy[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _legacy[key];
    }
  });
});
var _client = require("./client");