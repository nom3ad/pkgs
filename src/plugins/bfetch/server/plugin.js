"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BfetchServerPlugin = void 0;
var _configSchema = require("@osd/config-schema");
var _rxjs = require("rxjs");
var _common = require("../common");
var _streaming = require("./streaming");
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
// eslint-disable-next-line

// eslint-disable-next-line

/** @public */

// eslint-disable-next-line

const streamingHeaders = {
  'Content-Type': 'application/x-ndjson',
  Connection: 'keep-alive',
  'Transfer-Encoding': 'chunked'
};
class BfetchServerPlugin {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;
    _defineProperty(this, "addStreamingResponseRoute", ({
      router,
      logger
    }) => (path, handler) => {
      router.post({
        path: `/${(0, _common.removeLeadingSlash)(path)}`,
        validate: {
          body: _configSchema.schema.any()
        }
      }, async (context, request, response) => {
        const handlerInstance = handler(request);
        const data = request.body;
        return response.ok({
          headers: streamingHeaders,
          body: (0, _streaming.createNDJSONStream)(handlerInstance.getResponseStream(data), logger)
        });
      });
    });
    _defineProperty(this, "createStreamingRequestHandler", ({
      logger
    }) => streamHandler => async (context, request, response) => {
      const response$ = await streamHandler(context, request);
      return response.ok({
        headers: streamingHeaders,
        body: (0, _streaming.createNDJSONStream)(response$, logger)
      });
    });
    _defineProperty(this, "addBatchProcessingRoute", addStreamingResponseRoute => (path, handler) => {
      addStreamingResponseRoute(path, request => {
        const handlerInstance = handler(request);
        return {
          getResponseStream: ({
            batch
          }) => {
            const subject = new _rxjs.Subject();
            let cnt = batch.length;
            batch.forEach(async (batchItem, id) => {
              try {
                const result = await handlerInstance.onBatchItem(batchItem);
                subject.next({
                  id,
                  result
                });
              } catch (err) {
                const error = (0, _common.normalizeError)(err);
                subject.next({
                  id,
                  error
                });
              } finally {
                cnt--;
                if (!cnt) subject.complete();
              }
            });
            return subject;
          }
        };
      });
    });
  }
  setup(core, plugins) {
    const logger = this.initializerContext.logger.get();
    const router = core.http.createRouter();
    const addStreamingResponseRoute = this.addStreamingResponseRoute({
      router,
      logger
    });
    const addBatchProcessingRoute = this.addBatchProcessingRoute(addStreamingResponseRoute);
    const createStreamingRequestHandler = this.createStreamingRequestHandler({
      logger
    });
    return {
      addBatchProcessingRoute,
      addStreamingResponseRoute,
      createStreamingRequestHandler
    };
  }
  start(core, plugins) {
    return {};
  }
  stop() {}
}
exports.BfetchServerPlugin = BfetchServerPlugin;