"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DSLFacet = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-console*/

class DSLFacet {
  constructor(client) {
    this.client = client;
    _defineProperty(this, "fetch", async (request, format, responseFormat) => {
      const res = {
        success: false,
        data: {}
      };
      try {
        const params = {
          query: JSON.stringify(request.body)
        };
        const queryRes = await this.client.asScoped(request).callAsCurrentUser(format, params);
        const dslDataSource = queryRes;
        res.success = true;
        res.data = dslDataSource;
      } catch (err) {
        console.error(err);
        res.data = err.body;
      }
      return res;
    });
    _defineProperty(this, "describeQuery", async request => {
      return this.fetch(request, 'dsl.dslQuery', 'json');
    });
    this.client = client;
  }
}
exports.DSLFacet = DSLFacet;