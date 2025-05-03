"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDataStructureCache = createDataStructureCache;
exports.toCachedDataStructure = toCachedDataStructure;
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

function createDataStructureCache() {
  const cache = {};
  const dataStructureCache = {
    get: id => {
      return cache[id];
    },
    set: (id, value) => {
      cache[id] = value;
      return value;
    },
    clear: id => {
      delete cache[id];
    },
    // TODO: call this on log out
    clearAll: () => {
      Object.keys(cache).forEach(key => delete cache[key]);
    }
  };
  return dataStructureCache;
}
function toCachedDataStructure(dataStructure) {
  var _dataStructure$parent, _dataStructure$childr;
  return {
    id: dataStructure.id,
    title: dataStructure.title,
    type: dataStructure.type,
    parent: ((_dataStructure$parent = dataStructure.parent) === null || _dataStructure$parent === void 0 ? void 0 : _dataStructure$parent.id) || '',
    children: ((_dataStructure$childr = dataStructure.children) === null || _dataStructure$childr === void 0 ? void 0 : _dataStructure$childr.map(child => child.id)) || []
  };
}