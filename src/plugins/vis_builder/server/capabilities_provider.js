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
  'visualization-visbuilder': {
    // TODO: investigate which capabilities we need to provide
    // createNew: true,
    // createShortUrl: true,
    // delete: true,
    show: true,
    // showWriteControls: true,
    // save: true,
    saveQuery: true
  }
});
exports.capabilitiesProvider = capabilitiesProvider;