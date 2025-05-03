"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logWithMetadata = void 0;
var _lodash = require("lodash");
var _legacy_logging_server = require("../../../../src/core/server/legacy/logging/legacy_logging_server");
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

const logWithMetadata = exports.logWithMetadata = {
  isLogEvent(eventData) {
    return Boolean((0, _lodash.isPlainObject)(eventData) && eventData[_legacy_logging_server.metadataSymbol]);
  },
  getLogEventData(eventData) {
    const {
      message,
      metadata
    } = eventData[_legacy_logging_server.metadataSymbol];
    return {
      ...metadata,
      message
    };
  },
  decorateServer(server) {
    server.decorate('server', 'logWithMetadata', (tags, message, metadata = {}) => {
      server.log(tags, (0, _legacy_logging_server.attachMetaData)(message, metadata));
    });
  }
};