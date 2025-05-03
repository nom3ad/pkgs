"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PPLPlugin = void 0;
var _shared = require("../../framework/utils/shared");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const PPLPlugin = function (Client, config, components) {
  const ca = components.clientAction.factory;
  Client.prototype.ppl = components.clientAction.namespaceFactory();
  const ppl = Client.prototype.ppl.prototype;
  ppl.pplQuery = ca({
    url: {
      fmt: `${_shared.PPL_ENDPOINT}`,
      params: {
        format: {
          type: 'string',
          required: true
        }
      }
    },
    needBody: true,
    method: 'POST'
  });
  ppl.sqlQuery = ca({
    url: {
      fmt: `${_shared.SQL_ENDPOINT}`,
      params: {
        format: {
          type: 'string',
          required: true
        }
      }
    },
    needBody: true,
    method: 'POST'
  });
  ppl.getDataConnectionById = ca({
    url: {
      fmt: `${_shared.OPENSEARCH_DATACONNECTIONS_API.DATACONNECTION}/<%=dataconnection%>`,
      req: {
        dataconnection: {
          type: 'string',
          required: true
        }
      }
    },
    method: 'GET'
  });
  ppl.deleteDataConnection = ca({
    url: {
      fmt: `${_shared.OPENSEARCH_DATACONNECTIONS_API.DATACONNECTION}/<%=dataconnection%>`,
      req: {
        dataconnection: {
          type: 'string',
          required: true
        }
      }
    },
    method: 'DELETE'
  });
  ppl.createDataSource = ca({
    url: {
      fmt: `${_shared.OPENSEARCH_DATACONNECTIONS_API.DATACONNECTION}`
    },
    needBody: true,
    method: 'POST'
  });
  ppl.modifyDataConnection = ca({
    url: {
      fmt: `${_shared.OPENSEARCH_DATACONNECTIONS_API.DATACONNECTION}`
    },
    needBody: true,
    method: 'PATCH'
  });
  ppl.getDataConnections = ca({
    url: {
      fmt: `${_shared.OPENSEARCH_DATACONNECTIONS_API.DATACONNECTION}`
    },
    method: 'GET'
  });
};
exports.PPLPlugin = PPLPlugin;