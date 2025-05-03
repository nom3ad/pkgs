"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  getPrincipalsFromRequest: true,
  getWorkspaceIdFromUrl: true,
  cleanWorkspaceId: true,
  updateWorkspaceState: true,
  getWorkspaceState: true,
  ACLAuditorStateKey: true,
  initializeACLAuditor: true,
  getACLAuditor: true,
  cleanUpACLAuditor: true,
  CLIENT_CALL_AUDITOR_KEY: true,
  getClientCallAuditor: true,
  initializeClientCallAuditor: true,
  cleanUpClientCallAuditor: true
};
Object.defineProperty(exports, "ACLAuditorStateKey", {
  enumerable: true,
  get: function () {
    return _acl_auditor.ACLAuditorStateKey;
  }
});
Object.defineProperty(exports, "CLIENT_CALL_AUDITOR_KEY", {
  enumerable: true,
  get: function () {
    return _client_call_auditor.CLIENT_CALL_AUDITOR_KEY;
  }
});
Object.defineProperty(exports, "cleanUpACLAuditor", {
  enumerable: true,
  get: function () {
    return _acl_auditor.cleanUpACLAuditor;
  }
});
Object.defineProperty(exports, "cleanUpClientCallAuditor", {
  enumerable: true,
  get: function () {
    return _client_call_auditor.cleanUpClientCallAuditor;
  }
});
Object.defineProperty(exports, "cleanWorkspaceId", {
  enumerable: true,
  get: function () {
    return _utils.cleanWorkspaceId;
  }
});
Object.defineProperty(exports, "getACLAuditor", {
  enumerable: true,
  get: function () {
    return _acl_auditor.getACLAuditor;
  }
});
Object.defineProperty(exports, "getClientCallAuditor", {
  enumerable: true,
  get: function () {
    return _client_call_auditor.getClientCallAuditor;
  }
});
Object.defineProperty(exports, "getPrincipalsFromRequest", {
  enumerable: true,
  get: function () {
    return _auth_info.getPrincipalsFromRequest;
  }
});
Object.defineProperty(exports, "getWorkspaceIdFromUrl", {
  enumerable: true,
  get: function () {
    return _utils.getWorkspaceIdFromUrl;
  }
});
Object.defineProperty(exports, "getWorkspaceState", {
  enumerable: true,
  get: function () {
    return _workspace.getWorkspaceState;
  }
});
Object.defineProperty(exports, "initializeACLAuditor", {
  enumerable: true,
  get: function () {
    return _acl_auditor.initializeACLAuditor;
  }
});
Object.defineProperty(exports, "initializeClientCallAuditor", {
  enumerable: true,
  get: function () {
    return _client_call_auditor.initializeClientCallAuditor;
  }
});
Object.defineProperty(exports, "updateWorkspaceState", {
  enumerable: true,
  get: function () {
    return _workspace.updateWorkspaceState;
  }
});
var _crypto = require("./crypto");
Object.keys(_crypto).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _crypto[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _crypto[key];
    }
  });
});
var _from_root = require("./from_root");
Object.keys(_from_root).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _from_root[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _from_root[key];
    }
  });
});
var _package_json = require("./package_json");
Object.keys(_package_json).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _package_json[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _package_json[key];
    }
  });
});
var _streams = require("./streams");
Object.keys(_streams).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _streams[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _streams[key];
    }
  });
});
var _auth_info = require("./auth_info");
var _utils = require("../../utils");
var _workspace = require("./workspace");
var _acl_auditor = require("./acl_auditor");
var _client_call_auditor = require("./client_call_auditor");