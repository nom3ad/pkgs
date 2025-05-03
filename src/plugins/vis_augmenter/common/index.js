"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  AugmentVisSavedObjectAttributes: true
};
Object.defineProperty(exports, "AugmentVisSavedObjectAttributes", {
  enumerable: true,
  get: function () {
    return _augment_vis_saved_object_attributes.AugmentVisSavedObjectAttributes;
  }
});
var _constants = require("./constants");
Object.keys(_constants).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _constants[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _constants[key];
    }
  });
});
var _augment_vis_saved_object_attributes = require("./augment_vis_saved_object_attributes");