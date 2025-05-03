"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.capabilitiesProvider = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const capabilitiesProvider = () => ({
  visAugmenter: {
    show: false,
    delete: true,
    save: true,
    saveQuery: true
  }
});
exports.capabilitiesProvider = capabilitiesProvider;