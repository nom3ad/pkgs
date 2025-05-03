"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RequestResponder = void 0;
var _i18n = require("@osd/i18n");
var _types = require("./types");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */ /*
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
/**
 * An API to specify information about a specific request that will be logged.
 * Create a new instance to log a request using {@link RequestAdapter#start}.
 */
class RequestResponder {
  constructor(request, onChange) {
    _defineProperty(this, "request", void 0);
    _defineProperty(this, "onChange", void 0);
    this.request = request;
    this.onChange = onChange;
  }
  json(reqJson) {
    this.request.json = reqJson;
    this.onChange();
    return this;
  }
  stats(stats) {
    this.request.stats = {
      ...(this.request.stats || {}),
      ...stats
    };
    const startDate = new Date(this.request.startTime);
    this.request.stats.requestTimestamp = {
      label: _i18n.i18n.translate('inspector.reqTimestampKey', {
        defaultMessage: 'Request timestamp'
      }),
      value: startDate.toISOString(),
      description: _i18n.i18n.translate('inspector.reqTimestampDescription', {
        defaultMessage: 'Time when the start of the request has been logged'
      })
    };
    this.onChange();
    return this;
  }
  finish(status, response) {
    this.request.time = Date.now() - this.request.startTime;
    this.request.status = status;
    this.request.response = response;
    this.onChange();
  }
  ok(response) {
    this.finish(_types.RequestStatus.OK, response);
  }
  error(response) {
    this.finish(_types.RequestStatus.ERROR, response);
  }
  getTime() {
    return this.request.time;
  }
}
exports.RequestResponder = RequestResponder;