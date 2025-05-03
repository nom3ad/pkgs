"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  DATA_FRAME_TYPES: true
};
exports.DATA_FRAME_TYPES = void 0;
var _df_cache = require("./_df_cache");
Object.keys(_df_cache).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _df_cache[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _df_cache[key];
    }
  });
});
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/** @public **/
let DATA_FRAME_TYPES = exports.DATA_FRAME_TYPES = /*#__PURE__*/function (DATA_FRAME_TYPES) {
  DATA_FRAME_TYPES["DEFAULT"] = "data_frame";
  DATA_FRAME_TYPES["POLLING"] = "data_frame_polling";
  DATA_FRAME_TYPES["ERROR"] = "data_frame_error";
  return DATA_FRAME_TYPES;
}({});
/**
 * A data frame is a two-dimensional labeled data structure with columns of potentially different types.
 */
/**
 * An aggregation is a process where the values of multiple rows are grouped together to form a single summary value.
 */
/**
 * A bucket aggregation is a type of aggregation that creates buckets or sets of data.
 */
/**
 * This configuration is used to define how the aggregation should be performed.
 */
/**
 * To be utilize with aggregations and will map to buckets
 * Plugins can get the aggregated value by their own logic
 * Setting to null will disable the aggregation if plugin wishes
 * In future, if the plugin doesn't intentionally set the value to null,
 * we can calculate the value based on the fields.
 */
// TODO: handle composite