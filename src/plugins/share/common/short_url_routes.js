"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUrlPath = exports.getUrlIdFromGotoRoute = exports.getGotoPath = exports.GOTO_PREFIX = exports.GETTER_PREFIX = exports.CREATE_PATH = void 0;
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

const GOTO_PREFIX = exports.GOTO_PREFIX = '/goto';
const getUrlIdFromGotoRoute = path => {
  var _path$match;
  return (_path$match = path.match(new RegExp(`${GOTO_PREFIX}/(.*)$`))) === null || _path$match === void 0 ? void 0 : _path$match[1];
};
exports.getUrlIdFromGotoRoute = getUrlIdFromGotoRoute;
const getGotoPath = urlId => `${GOTO_PREFIX}/${urlId}`;
exports.getGotoPath = getGotoPath;
const GETTER_PREFIX = exports.GETTER_PREFIX = '/api/short_url';
const getUrlPath = urlId => `${GETTER_PREFIX}/${urlId}`;
exports.getUrlPath = getUrlPath;
const CREATE_PATH = exports.CREATE_PATH = '/api/shorten_url';