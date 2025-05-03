"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RequestAdapter = void 0;
var _events = require("events");
var _v = _interopRequireDefault(require("uuid/v4"));
var _request_responder = require("./request_responder");
var _types = require("./types");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
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
 * An generic inspector adapter to log requests.
 * These can be presented in the inspector using the requests view.
 * The adapter is not coupled to a specific implementation or even OpenSearch
 * instead it offers a generic API to log requests of any kind.
 * @extends EventEmitter
 */
class RequestAdapter extends _events.EventEmitter {
  constructor() {
    super();
    _defineProperty(this, "requests", void 0);
    this.requests = new Map();
  }

  /**
   * Start logging a new request into this request adapter. The new request will
   * by default be in a processing state unless you explicitly finish it via
   * {@link RequestResponder#finish}, {@link RequestResponder#ok} or
   * {@link RequestResponder#error}.
   *
   * @param  {string} name The name of this request as it should be shown in the UI.
   * @param  {object} args Additional arguments for the request.
   * @return {RequestResponder} An instance to add information to the request and finish it.
   */
  start(name, params = {}) {
    var _params$id;
    const req = {
      ...params,
      name,
      startTime: Date.now(),
      status: _types.RequestStatus.PENDING,
      id: (_params$id = params.id) !== null && _params$id !== void 0 ? _params$id : (0, _v.default)()
    };
    this.requests.set(req.id, req);
    this._onChange();
    return new _request_responder.RequestResponder(req, () => this._onChange());
  }
  reset() {
    this.requests = new Map();
    this._onChange();
  }
  resetRequest(id) {
    this.requests.delete(id);
    this._onChange();
  }
  getRequests() {
    return Array.from(this.requests.values());
  }
  _onChange() {
    this.emit('change');
  }
}
exports.RequestAdapter = RequestAdapter;