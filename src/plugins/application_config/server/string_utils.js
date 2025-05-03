"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validate = validate;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const ERROR_MESSSAGE_FOR_EMPTY_INPUT = 'Input cannot be empty!';
const ERROR_FOR_EMPTY_INPUT = new Error(ERROR_MESSSAGE_FOR_EMPTY_INPUT);
function isEmpty(input) {
  if (!input) {
    return true;
  }
  return !input.trim();
}
function validate(input, logger) {
  if (isEmpty(input)) {
    logger.error(ERROR_MESSSAGE_FOR_EMPTY_INPUT);
    throw ERROR_FOR_EMPTY_INPUT;
  }
  return input.trim();
}