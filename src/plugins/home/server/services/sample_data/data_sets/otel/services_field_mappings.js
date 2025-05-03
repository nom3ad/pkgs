"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.servicesFieldMappings = void 0;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const servicesFieldMappings = exports.servicesFieldMappings = {
  destination: {
    properties: {
      domain: {
        type: 'keyword',
        ignore_above: 1024
      },
      resource: {
        type: 'keyword',
        ignore_above: 1024
      }
    }
  },
  hashId: {
    type: 'keyword',
    ignore_above: 1024
  },
  kind: {
    type: 'keyword',
    ignore_above: 1024
  },
  serviceName: {
    type: 'keyword',
    ignore_above: 1024
  },
  target: {
    properties: {
      domain: {
        type: 'keyword',
        ignore_above: 1024
      },
      resource: {
        type: 'keyword',
        ignore_above: 1024
      }
    }
  },
  traceGroupName: {
    type: 'keyword',
    ignore_above: 1024
  }
};