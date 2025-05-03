"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildBufferedBody = void 0;
/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

const buildBufferedBody = body => {
  return new Promise((resolve, reject) => {
    let buff = Buffer.alloc(0);
    body.on('data', function (chunk) {
      buff = Buffer.concat([buff, chunk]);
    });
    body.on('end', function () {
      resolve(buff);
    });
    body.on('error', function (err) {
      reject(err);
    });
  });
};
exports.buildBufferedBody = buildBufferedBody;