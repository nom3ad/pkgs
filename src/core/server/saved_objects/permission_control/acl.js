"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PrincipalType = exports.ACL = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
let PrincipalType = exports.PrincipalType = /*#__PURE__*/function (PrincipalType) {
  PrincipalType["Users"] = "users";
  PrincipalType["Groups"] = "groups";
  return PrincipalType;
}({});
const addToPrincipals = ({
  principals = {},
  users,
  groups
}) => {
  if (users) {
    if (!principals.users) {
      principals.users = [];
    }
    principals.users = Array.from(new Set([...principals.users, ...users]));
  }
  if (groups) {
    if (!principals.groups) {
      principals.groups = [];
    }
    principals.groups = Array.from(new Set([...principals.groups, ...groups]));
  }
  return principals;
};
const deleteFromPrincipals = ({
  principals,
  users,
  groups
}) => {
  if (!principals) {
    return principals;
  }
  if (users && principals.users) {
    principals.users = principals.users.filter(item => !users.includes(item));
  }
  if (groups && principals.groups) {
    principals.groups = principals.groups.filter(item => !groups.includes(item));
  }
  return principals;
};
const checkPermission = (allowedPrincipals, requestedPrincipals) => {
  return (allowedPrincipals === null || allowedPrincipals === void 0 ? void 0 : allowedPrincipals.users) && (requestedPrincipals === null || requestedPrincipals === void 0 ? void 0 : requestedPrincipals.users) && checkPermissionForSinglePrincipalType(allowedPrincipals.users, requestedPrincipals.users) || (allowedPrincipals === null || allowedPrincipals === void 0 ? void 0 : allowedPrincipals.groups) && (requestedPrincipals === null || requestedPrincipals === void 0 ? void 0 : requestedPrincipals.groups) && checkPermissionForSinglePrincipalType(allowedPrincipals.groups, requestedPrincipals.groups);
};
const checkPermissionForSinglePrincipalType = (allowedPrincipalArray, requestedPrincipalArray) => {
  return allowedPrincipalArray && requestedPrincipalArray && (allowedPrincipalArray.includes('*') || requestedPrincipalArray.some(item => allowedPrincipalArray.includes(item)));
};
class ACL {
  constructor(initialPermissions) {
    _defineProperty(this, "permissions", void 0);
    this.permissions = initialPermissions || {};
  }

  /**
   * A function that parses the permissions object to check whether the specific principal has the specific permission types or not
   *
   * @param {Array} permissionTypes permission types
   * @param {Object} principals the users or groups
   * @returns true if the principal has the specified permission types, false if the principal has no permission
   *
   * @public
   */
  hasPermission(permissionTypes, principals) {
    if (!permissionTypes || permissionTypes.length === 0 || !this.permissions || !principals) {
      return false;
    }
    const currentPermissions = this.permissions;
    return permissionTypes.some(permissionType => checkPermission(currentPermissions[permissionType], principals));
  }

  /**
   * A permissions object build function that adds principal with specific permission to the object
   *
   * This function is used to contruct a new permissions object or add principals with specified permissions to
   * the existing permissions object. The usage is:
   *
   * const permissionObject = new ACL()
   *  .addPermission(['write', 'library_write'], {
   *     users: ['user2'],
   *   })
   *   .addPermission(['write', 'library_write'], {
   *     groups: ['group1'],
   *   })
   *   .getPermissions();
   *
   * @param {Array} permissionTypes the permission types
   * @param {Object} principals the users or groups
   * @returns the permissions object
   *
   * @public
   */
  addPermission(permissionTypes, principals) {
    if (!permissionTypes || !principals) {
      return this;
    }
    if (!this.permissions) {
      this.permissions = {};
    }
    for (const permissionType of permissionTypes) {
      this.permissions[permissionType] = addToPrincipals({
        principals: this.permissions[permissionType],
        users: principals.users,
        groups: principals.groups
      });
    }
    return this;
  }

  /**
   * A permissions object build function that removes specific permission of specific principal from the object
   *
   * This function is used to remove principals with specified permissions to
   * the existing permissions object. The usage is:
   *
   * const newPermissionObject = new ACL()
   *  .removePermission(['write', 'library_write'], {
   *     users: ['user2'],
   *   })
   *   .removePermission(['write', 'library_write'], {
   *     groups: ['group1'],
   *   })
   *   .getPermissions();
   *
   * @param {Array} permissionTypes the permission types
   * @param {Object} principals the users or groups
   * @returns the permissions object
   *
   * @public
   */
  removePermission(permissionTypes, principals) {
    if (!permissionTypes || !principals) {
      return this;
    }
    if (!this.permissions) {
      this.permissions = {};
    }
    for (const permissionType of permissionTypes) {
      const result = deleteFromPrincipals({
        principals: this.permissions[permissionType],
        users: principals.users,
        groups: principals.groups
      });
      if (result) {
        this.permissions[permissionType] = result;
      }
    }
    return this;
  }

  /**
   * A function that transforms permissions format, change the format from permissionType->principals to principal->permissionTypes,
   * which is used to clearyly dispaly user/group list and their granted permissions in the UI
   *
   * for example:
   * the original permissions object is:   {
   *     read: {
   *         users:['user1']
   *     },
   *     write:{
   *         groups:['group1']
   *     }
   * }
   *
   * the transformed permissions object will be: [
   *     {type:'users', name:'user1', permissions:['read']},
   *     {type:'groups', name:'group1', permissions:['write']},
   * ]
   *
   * @returns the flat list of the permissions object
   *
   * @public
   */
  toFlatList() {
    const result = [];
    if (!this.permissions) {
      return result;
    }
    for (const permissionType in this.permissions) {
      if (Object.prototype.hasOwnProperty.call(this.permissions, permissionType)) {
        var _this$permissions$per;
        const {
          users = [],
          groups = []
        } = (_this$permissions$per = this.permissions[permissionType]) !== null && _this$permissions$per !== void 0 ? _this$permissions$per : {};
        users.forEach(user => {
          const found = result.find(r => r.type === PrincipalType.Users && r.name === user);
          if (found) {
            found.permissions.push(permissionType);
          } else {
            result.push({
              type: PrincipalType.Users,
              name: user,
              permissions: [permissionType]
            });
          }
        });
        groups.forEach(group => {
          const found = result.find(r => r.type === PrincipalType.Groups && r.name === group);
          if (found) {
            found.permissions.push(permissionType);
          } else {
            result.push({
              type: PrincipalType.Groups,
              name: group,
              permissions: [permissionType]
            });
          }
        });
      }
    }
    return result;
  }

  /**
   * A permissions object build function that resets the permissions object
   *
   * @public
   */
  resetPermissions() {
    // reset permissions
    this.permissions = {};
  }

  /**
   * A function that gets the premissions object
   *
   * @public
   */
  getPermissions() {
    return this.permissions;
  }

  /**
   * A function that generates query DSL by the specific conditions, used for fetching saved objects from the saved objects index
   *
   * @param {Array} permissionTypes the permission types
   * @param {Object} principals the users or groups
   * @param {String | Array} savedObjectType saved object type, such as workspace, index-pattern etc.
   * @returns the generated query DSL
   *
   * @public
   * @static
   */
  static generateGetPermittedSavedObjectsQueryDSL(permissionTypes, principals, savedObjectType) {
    if (!principals || !permissionTypes) {
      return {
        query: {
          match_none: {}
        }
      };
    }
    const bool = {
      filter: []
    };
    const subBool = {
      should: []
    };
    permissionTypes.forEach(permissionType => {
      Object.entries(principals).forEach(([principalType, principalsInCurrentType]) => {
        subBool.should.push({
          terms: {
            ['permissions.' + permissionType + `.${principalType}`]: principalsInCurrentType
          }
        });
        subBool.should.push({
          term: {
            ['permissions.' + permissionType + `.${principalType}`]: '*'
          }
        });
      });
    });
    bool.filter.push({
      bool: subBool
    });
    if (savedObjectType) {
      bool.filter.push({
        terms: {
          type: Array.isArray(savedObjectType) ? savedObjectType : [savedObjectType]
        }
      });
    }
    return {
      query: {
        bool
      }
    };
  }
}
exports.ACL = ACL;