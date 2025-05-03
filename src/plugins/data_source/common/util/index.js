"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _decide_client = require("./decide_client");
Object.keys(_decide_client).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _decide_client[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _decide_client[key];
    }
  });
});