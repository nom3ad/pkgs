"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DateConversion = void 0;
var _momentTimezone = _interopRequireDefault(require("moment-timezone"));
var _lodash = require("lodash");
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

const dateRegExp = /%date({(?<format>[^}]+)})?({(?<timezone>[^}]+)})?/g;
const formats = {
  ISO8601: 'ISO8601',
  ISO8601_TZ: 'ISO8601_TZ',
  ABSOLUTE: 'ABSOLUTE',
  UNIX: 'UNIX',
  UNIX_MILLIS: 'UNIX_MILLIS'
};
function formatDate(date, dateFormat = formats.ISO8601, timezone) {
  const momentDate = (0, _momentTimezone.default)(date);
  if (timezone) {
    momentDate.tz(timezone);
  }
  switch (dateFormat) {
    case formats.ISO8601:
      return momentDate.toISOString();
    case formats.ISO8601_TZ:
      return momentDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    case formats.ABSOLUTE:
      return momentDate.format('HH:mm:ss.SSS');
    case formats.UNIX:
      return momentDate.format('X');
    case formats.UNIX_MILLIS:
      return momentDate.format('x');
    default:
      throw new Error(`Unknown format: ${dateFormat}`);
  }
}
function validateDateFormat(input) {
  if (!Reflect.has(formats, input)) {
    throw new Error(`Date format expected one of ${Reflect.ownKeys(formats).join(', ')}, but given: ${input}`);
  }
}
function validateTimezone(timezone) {
  if (_momentTimezone.default.tz.zone(timezone)) return;
  throw new Error(`Unknown timezone: ${timezone}`);
}
function validate(rawString) {
  for (const matched of rawString.matchAll(dateRegExp)) {
    const {
      format,
      timezone
    } = matched.groups;
    if (format) {
      validateDateFormat(format);
    }
    if (timezone) {
      validateTimezone(timezone);
    }
  }
}
const DateConversion = exports.DateConversion = {
  pattern: dateRegExp,
  convert(record, highlight, ...matched) {
    const groups = (0, _lodash.last)(matched);
    const {
      format,
      timezone
    } = groups;
    return formatDate(record.timestamp, format, timezone);
  },
  validate
};