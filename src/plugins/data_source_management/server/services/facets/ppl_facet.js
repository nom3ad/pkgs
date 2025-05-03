"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PPLFacet = void 0;
var _ppl_datasource = require("../../adaptors/ppl_datasource");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
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