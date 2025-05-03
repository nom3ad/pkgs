"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RepositoryWrapper = void 0;
var _utils = require("../../../../core/server/utils");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
class RepositoryWrapper {
  constructor() {
    _defineProperty(this, "wrapperFactory", wrapperOptions => {
      const ACLAuditDecorator = function (fn, getCount = () => 1) {
        return function (...args) {
          const result = fn.apply(wrapperOptions.client, args);
          const ACLAuditor = (0, _utils.getACLAuditor)(wrapperOptions.request);
          ACLAuditor === null || ACLAuditor === void 0 || ACLAuditor.increment(_utils.ACLAuditorStateKey.DATABASE_OPERATION, getCount(args));
          return result;
        };
      };
      return {
        ...wrapperOptions.client,
        get: ACLAuditDecorator(wrapperOptions.client.get),
        checkConflicts: wrapperOptions.client.checkConflicts,
        find: wrapperOptions.client.find,
        bulkGet: ACLAuditDecorator(wrapperOptions.client.bulkGet, args => {
          var _args$;
          return ((_args$ = args[0]) === null || _args$ === void 0 ? void 0 : _args$.length) || 0;
        }),
        errors: wrapperOptions.client.errors,
        addToNamespaces: wrapperOptions.client.addToNamespaces,
        deleteFromNamespaces: wrapperOptions.client.deleteFromNamespaces,
        create: ACLAuditDecorator(wrapperOptions.client.create),
        bulkCreate: ACLAuditDecorator(wrapperOptions.client.bulkCreate, args => {
          var _args$2;
          return ((_args$2 = args[0]) === null || _args$2 === void 0 ? void 0 : _args$2.length) || 0;
        }),
        delete: ACLAuditDecorator(wrapperOptions.client.delete),
        update: ACLAuditDecorator(wrapperOptions.client.update),
        bulkUpdate: ACLAuditDecorator(wrapperOptions.client.bulkUpdate, args => {
          var _args$3;
          return ((_args$3 = args[0]) === null || _args$3 === void 0 ? void 0 : _args$3.length) || 0;
        }),
        deleteByWorkspace: ACLAuditDecorator(wrapperOptions.client.deleteByWorkspace),
        addToWorkspaces: ACLAuditDecorator(wrapperOptions.client.addToWorkspaces),
        deleteFromWorkspaces: ACLAuditDecorator(wrapperOptions.client.deleteFromWorkspaces)
      };
    });
  }
}
exports.RepositoryWrapper = RepositoryWrapper;