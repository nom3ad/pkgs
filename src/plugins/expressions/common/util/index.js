"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _create_error = require("./create_error");
Object.keys(_create_error).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _create_error[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _create_error[key];
    }
  });
});
var _get_by_alias = require("./get_by_alias");
Object.keys(_get_by_alias).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _get_by_alias[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _get_by_alias[key];
    }
  });
});