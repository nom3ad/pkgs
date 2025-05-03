"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _adapters = require("./adapters");
Object.keys(_adapters).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _adapters[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _adapters[key];
    }
  });
});