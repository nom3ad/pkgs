"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _data_connection_saved_object_attributes = require("./data_connection_saved_object_attributes");
Object.keys(_data_connection_saved_object_attributes).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _data_connection_saved_object_attributes[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _data_connection_saved_object_attributes[key];
    }
  });
});