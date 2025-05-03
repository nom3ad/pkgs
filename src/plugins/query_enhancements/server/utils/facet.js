"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Facet = void 0;
var _ = require(".");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class Facet {
  constructor({
    client: _client,
    logger,
    endpoint: _endpoint,
    useJobs = false,
    shimResponse = false
  }) {
    _defineProperty(this, "defaultClient", void 0);
    _defineProperty(this, "logger", void 0);
    _defineProperty(this, "endpoint", void 0);
    _defineProperty(this, "useJobs", void 0);
    _defineProperty(this, "shimResponse", void 0);
    _defineProperty(this, "fetch", async (context, request, endpoint) => {
      try {
        var _query$dataset;
        const query = request.body.query;
        const dataSource = (_query$dataset = query.dataset) === null || _query$dataset === void 0 ? void 0 : _query$dataset.dataSource;
        const meta = dataSource === null || dataSource === void 0 ? void 0 : dataSource.meta;
        const {
          format,
          lang
        } = request.body;
        const params = {
          body: {
            query: query.query,
            ...((meta === null || meta === void 0 ? void 0 : meta.name) && {
              datasource: meta.name
            }),
            ...((meta === null || meta === void 0 ? void 0 : meta.sessionId) && {
              sessionId: meta.sessionId
            }),
            ...(lang && {
              lang
            })
          },
          ...(format !== 'jdbc' && {
            format
          })
        };
        const clientId = dataSource === null || dataSource === void 0 ? void 0 : dataSource.id;
        const client = clientId ? context.dataSource.opensearch.legacy.getClient(clientId).callAPI : this.defaultClient.asScoped(request).callAsCurrentUser;
        const queryRes = await client(endpoint, params);
        return {
          success: true,
          data: queryRes
        };
      } catch (err) {
        this.logger.error(`Facet fetch: ${endpoint}: ${err}`);
        return {
          success: false,
          data: err
        };
      }
    });
    _defineProperty(this, "fetchJobs", async (context, request, endpoint) => {
      try {
        var _query$dataset2;
        const query = request.body.query;
        const params = request.params;
        const clientId = (_query$dataset2 = query.dataset) === null || _query$dataset2 === void 0 || (_query$dataset2 = _query$dataset2.dataSource) === null || _query$dataset2 === void 0 ? void 0 : _query$dataset2.id;
        const client = clientId ? context.dataSource.opensearch.legacy.getClient(clientId).callAPI : this.defaultClient.asScoped(request).callAsCurrentUser;
        const queryRes = await client(endpoint, params);
        return {
          success: true,
          data: queryRes
        };
      } catch (err) {
        this.logger.error(`Facet fetch: ${endpoint}: ${err}`);
        return {
          success: false,
          data: err
        };
      }
    });
    _defineProperty(this, "describeQuery", async (context, request) => {
      const response = this.useJobs ? await this.fetchJobs(context, request, this.endpoint) : await this.fetch(context, request, this.endpoint);
      if (!this.shimResponse) return response;
      const {
        format: dataType
      } = request.body;
      const shimFunctions = {
        jdbc: data => (0, _.shimSchemaRow)(data),
        viz: data => (0, _.shimStats)(data)
      };
      return shimFunctions[dataType] ? {
        ...response,
        data: shimFunctions[dataType](response.data)
      } : response;
    });
    this.defaultClient = _client;
    this.logger = logger;
    this.endpoint = _endpoint;
    this.useJobs = useJobs;
    this.shimResponse = shimResponse;
  }
}
exports.Facet = Facet;