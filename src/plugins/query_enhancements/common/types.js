"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.S3_FIELD_TYPES = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
let S3_FIELD_TYPES = exports.S3_FIELD_TYPES = /*#__PURE__*/function (S3_FIELD_TYPES) {
  S3_FIELD_TYPES["BOOLEAN"] = "boolean";
  S3_FIELD_TYPES["BYTE"] = "byte";
  S3_FIELD_TYPES["SHORT"] = "short";
  S3_FIELD_TYPES["INTEGER"] = "integer";
  S3_FIELD_TYPES["INT"] = "int";
  S3_FIELD_TYPES["LONG"] = "long";
  S3_FIELD_TYPES["FLOAT"] = "float";
  S3_FIELD_TYPES["DOUBLE"] = "double";
  S3_FIELD_TYPES["KEYWORD"] = "keyword";
  S3_FIELD_TYPES["TEXT"] = "text";
  S3_FIELD_TYPES["STRING"] = "string";
  S3_FIELD_TYPES["TIMESTAMP"] = "timestamp";
  S3_FIELD_TYPES["DATE"] = "date";
  S3_FIELD_TYPES["DATE_NANOS"] = "date_nanos";
  S3_FIELD_TYPES["TIME"] = "time";
  S3_FIELD_TYPES["INTERVAL"] = "interval";
  S3_FIELD_TYPES["IP"] = "ip";
  S3_FIELD_TYPES["GEO_POINT"] = "geo_point";
  S3_FIELD_TYPES["BINARY"] = "binary";
  S3_FIELD_TYPES["STRUCT"] = "struct";
  S3_FIELD_TYPES["ARRAY"] = "array";
  S3_FIELD_TYPES["UNKNOWN"] = "unknown";
  return S3_FIELD_TYPES;
}({}); // For unmapped or unsupported types