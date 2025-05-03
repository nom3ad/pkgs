"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PPLDataSource = void 0;
var _lodash = _interopRequireDefault(require("lodash"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
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