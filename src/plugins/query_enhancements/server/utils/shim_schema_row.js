"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shimSchemaRow = shimSchemaRow;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

function shimSchemaRow(response) {
  const schemaLength = response.schema.length;
  const data = response.datarows.map(row => {
    return row.reduce((record, item, index) => {
      if (index < schemaLength) {
        const cur = response.schema[index];
        const value = typeof item === 'object' ? JSON.stringify(item) : typeof item === 'boolean' ? item.toString() : item;
        record[cur.name] = value;
      }
      return record;
    }, {});
  });
  return {
    ...response,
    jsonData: data
  };
}