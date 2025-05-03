"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isGeoShapeFilter = exports.getGeoShapeFilterField = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// TODO: support other geometries too.

const isGeoShapeFilter = filter => filter === null || filter === void 0 ? void 0 : filter.geo_shape;
exports.isGeoShapeFilter = isGeoShapeFilter;
const getGeoShapeFilterField = filter => {
  if ((filter === null || filter === void 0 ? void 0 : filter.geo_shape) === undefined) {
    return undefined;
  }
  return (filter === null || filter === void 0 ? void 0 : filter.geo_shape) && Object.keys(filter.geo_shape).find(key => key !== 'ignore_unmapped');
};
exports.getGeoShapeFilterField = getGeoShapeFilterField;