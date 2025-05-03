"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MissingIndexPatternError = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

class MissingIndexPatternError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MissingIndexPatternError';
  }
}
exports.MissingIndexPatternError = MissingIndexPatternError;