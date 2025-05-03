"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _validation_telemetry_service = require("./validation_telemetry_service");
Object.keys(_validation_telemetry_service).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _validation_telemetry_service[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _validation_telemetry_service[key];
    }
  });
});