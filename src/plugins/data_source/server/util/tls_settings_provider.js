"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readCertificateAuthorities = void 0;
var _fs = require("fs");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const readCertificateAuthorities = listOfCertificateAuthorities => {
  let certificateAuthorities;
  const addCertificateAuthorities = ca => {
    if (ca && ca.length) {
      certificateAuthorities = [...(certificateAuthorities || []), ...ca];
    }
  };
  const ca = listOfCertificateAuthorities;
  if (ca) {
    const parsed = [];
    const paths = Array.isArray(ca) ? ca : [ca];
    for (const path of paths) {
      parsed.push(readFile(path));
    }
    addCertificateAuthorities(parsed);
  }
  return {
    certificateAuthorities
  };
};
exports.readCertificateAuthorities = readCertificateAuthorities;
const readFile = file => {
  return (0, _fs.readFileSync)(file, 'utf8');
};