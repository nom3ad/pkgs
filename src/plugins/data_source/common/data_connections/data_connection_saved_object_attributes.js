"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataConnectionType = exports.DATA_CONNECTION_SAVED_OBJECT_TYPE = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const DATA_CONNECTION_SAVED_OBJECT_TYPE = exports.DATA_CONNECTION_SAVED_OBJECT_TYPE = 'data-connection';

/**
 * Represents the attributes of a data connection saved object.
 * @property connectionId: The name of the data connection.
 * @property type: The type of the data connection based on enum DataConnectionType
 * @property meta: Additional metadata associated with the data connection.
 */
let DataConnectionType = exports.DataConnectionType = /*#__PURE__*/function (DataConnectionType) {
  DataConnectionType["CloudWatch"] = "AWS CloudWatch";
  DataConnectionType["SecurityLake"] = "AWS Security Lake";
  DataConnectionType["NA"] = "None";
  return DataConnectionType;
}({});