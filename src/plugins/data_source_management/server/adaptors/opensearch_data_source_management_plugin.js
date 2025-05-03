"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenSearchDataSourceManagementPlugin = OpenSearchDataSourceManagementPlugin;
var _shared = require("../../framework/utils/shared");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

function OpenSearchDataSourceManagementPlugin(Client, config, components) {
  const clientAction = components.clientAction.factory;
  Client.prototype.datasourcemanagement = components.clientAction.namespaceFactory();
  const datasourcemanagement = Client.prototype.datasourcemanagement.prototype;

  // Get async job status
  datasourcemanagement.getJobStatus = clientAction({
    url: {
      fmt: `${_shared.JOBS_ENDPOINT_BASE}/<%=queryId%>`,
      req: {
        queryId: {
          type: 'string',
          required: true
        }
      }
    },
    method: 'GET'
  });

  // Delete async job
  datasourcemanagement.deleteJob = clientAction({
    url: {
      fmt: `${_shared.JOBS_ENDPOINT_BASE}/<%=queryId%>`,
      req: {
        queryId: {
          type: 'string',
          required: true
        }
      }
    },
    method: 'DELETE'
  });

  // Run async job
  datasourcemanagement.runDirectQuery = clientAction({
    url: {
      fmt: `${_shared.JOBS_ENDPOINT_BASE}`
    },
    method: 'POST',
    needBody: true
  });
}