"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shortUrlAssertValid = shortUrlAssertValid;
var _url = require("url");
var _lodash = require("lodash");
var _boom = _interopRequireDefault(require("@hapi/boom"));
var _server = require("../../../../../core/server");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

function shortUrlAssertValid(url) {
  const {
    protocol,
    hostname,
    pathname
  } = (0, _url.parse)(url, false /* parseQueryString */, true /* slashesDenoteHost */);

  if (protocol !== null) {
    throw _boom.default.notAcceptable(`Short url targets cannot have a protocol, found "${protocol}"`);
  }
  if (hostname !== null) {
    throw _boom.default.notAcceptable(`Short url targets cannot have a hostname, found "${hostname}"`);
  }
  let pathnameParts = (0, _lodash.trim)(pathname === null ? undefined : pathname, '/').split('/');

  // Workspace introduced paths like `/w/${workspaceId}/app`
  // ignore the first 2 elements if it starts with /w
  if (`/${pathnameParts[0]}` === _server.WORKSPACE_PATH_PREFIX) {
    pathnameParts = pathnameParts.slice(2);
  }
  if (pathnameParts[0] !== 'app' || !pathnameParts[1]) {
    throw _boom.default.notAcceptable(`Short url target path must be in the format "/app/{{appId}}", found "${pathname}"`);
  }
}