"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Facet = void 0;
var _ = require(".");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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
      if (response.success === false || !this.shimResponse) return response;
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