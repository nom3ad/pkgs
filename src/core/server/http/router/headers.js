"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterHeaders = filterHeaders;
var _std = require("@osd/std");
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

/**
 * Creates a Union type of all known keys of a given interface.
 * @example
 * ```ts
 * interface Person {
 *   name: string;
 *   age: number;
 *   [attributes: string]: string | number;
 * }
 * type PersonKnownKeys = KnownKeys<Person>; // "age" | "name"
 * ```
 */

/**
 * Set of well-known HTTP headers.
 * @public
 */

/**
 * Http request headers to read.
 * @public
 */

/**
 * Http response headers to set.
 * @public
 */

const normalizeHeaderField = field => field.trim().toLowerCase();
function filterHeaders(headers, fieldsToKeep, fieldsToExclude = []) {
  const fieldsToExcludeNormalized = fieldsToExclude.map(normalizeHeaderField);
  // Normalize list of headers we want to allow in upstream request
  const fieldsToKeepNormalized = fieldsToKeep.map(normalizeHeaderField).filter(name => !fieldsToExcludeNormalized.includes(name));
  return (0, _std.pick)(headers, fieldsToKeepNormalized);
}