"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _courier_inspector_stats = require("./courier_inspector_stats");
Object.keys(_courier_inspector_stats).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _courier_inspector_stats[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _courier_inspector_stats[key];
    }
  });
});