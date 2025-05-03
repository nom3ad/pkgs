"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PPLDataSource = void 0;
var _lodash = _interopRequireDefault(require("lodash"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class PPLDataSource {
  constructor(pplDataSource, dataType) {
    this.pplDataSource = pplDataSource;
    this.dataType = dataType;
    _defineProperty(this, "addStatsMapping", () => {
      var _visData$metadata;
      const visData = this.pplDataSource;

      /**
       * Add vis mapping for runtime fields
       * json data structure added to response will be
       * [{
       *  agent: "mozilla",
       *  avg(bytes): 5756
       *  ...
       * }, {
       *  agent: "MSIE",
       *  avg(bytes): 5605
       *  ...
       * }, {
       *  agent: "chrome",
       *  avg(bytes): 5648
       *  ...
       * }]
       */
      const res = [];
      if (visData !== null && visData !== void 0 && (_visData$metadata = visData.metadata) !== null && _visData$metadata !== void 0 && _visData$metadata.fields) {
        const queriedFields = visData.metadata.fields;
        for (let i = 0; i < visData.size; i++) {
          const entry = {};
          queriedFields.map(field => {
            const statsDataSet = visData === null || visData === void 0 ? void 0 : visData.data;
            entry[field.name] = statsDataSet[field.name][i];
          });
          res.push(entry);
        }
        visData.jsonData = res;
      }
    });
    /**
     * Add 'schemaName: data' entries for UI rendering
     */
    _defineProperty(this, "addSchemaRowMapping", () => {
      const pplRes = this.pplDataSource;
      const data = [];
      _lodash.default.forEach(pplRes.datarows, row => {
        const record = {};
        for (let i = 0; i < pplRes.schema.length; i++) {
          const cur = pplRes.schema[i];
          if (typeof row[i] === 'object') {
            record[cur.name] = JSON.stringify(row[i]);
          } else if (typeof row[i] === 'boolean') {
            record[cur.name] = row[i].toString();
          } else {
            record[cur.name] = row[i];
          }
        }
        data.push(record);
      });
      pplRes.jsonData = data;
    });
    _defineProperty(this, "getDataSource", () => this.pplDataSource);
    if (this.dataType === 'jdbc') {
      this.addSchemaRowMapping();
    } else if (this.dataType === 'viz') {
      this.addStatsMapping();
    }
  }
}
exports.PPLDataSource = PPLDataSource;