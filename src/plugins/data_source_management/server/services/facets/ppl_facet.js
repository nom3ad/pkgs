"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PPLFacet = void 0;
var _ppl_datasource = require("../../adaptors/ppl_datasource");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */ /* eslint-disable no-console */
class PPLFacet {
  constructor(client) {
    this.client = client;
    _defineProperty(this, "fetch", async (request, format, responseFormat) => {
      const res = {
        success: false,
        data: {}
      };
      try {
        const params = {
          body: {
            query: request.body.query
          }
        };
        if (request.body.format !== 'jdbc') {
          params.format = request.body.format;
        }
        const queryRes = await this.client.asScoped(request).callAsCurrentUser(format, params);
        const pplDataSource = new _ppl_datasource.PPLDataSource(queryRes, request.body.format);
        res.success = true;
        res.data = pplDataSource.getDataSource();
      } catch (err) {
        console.error('PPL query fetch err: ', err);
        res.data = err;
      }
      return res;
    });
    _defineProperty(this, "describeQuery", async request => {
      return this.fetch(request, 'ppl.pplQuery', 'json');
    });
    this.client = client;
  }
}
exports.PPLFacet = PPLFacet;