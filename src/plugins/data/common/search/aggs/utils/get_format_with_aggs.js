"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFormatWithAggs = getFormatWithAggs;
var _i18n = require("@osd/i18n");
var _field_formats = require("../../../../common/field_formats");
var _date_range = require("../buckets/lib/date_range");
var _ip_range = require("../buckets/lib/ip_range");
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
 * Certain aggs have custom field formats that are not part of the field formats
 * registry. This function will take the `getFormat` function which is used inside
 * `deserializeFieldFormat` and decorate it with the additional custom formats
 * that the field formats service doesn't know anything about.
 *
 * This function is internal to the data plugin, and only exists for use inside
 * the field formats service.
 *
 * @internal
 */
function getFormatWithAggs(getFieldFormat) {
  return mapping => {
    const {
      id,
      params = {}
    } = mapping;
    const customFormats = {
      range: () => {
        const RangeFormat = _field_formats.FieldFormat.from(range => {
          const nestedFormatter = params;
          const format = getFieldFormat({
            id: nestedFormatter.id,
            params: nestedFormatter.params
          });
          const gte = '\u2265';
          const lt = '\u003c';
          return _i18n.i18n.translate('data.aggTypes.buckets.ranges.rangesFormatMessage', {
            defaultMessage: '{gte} {from} and {lt} {to}',
            values: {
              gte,
              from: format.convert(range.gte),
              lt,
              to: format.convert(range.lt)
            }
          });
        });
        return new RangeFormat();
      },
      date_range: () => {
        const nestedFormatter = params;
        const DateRangeFormat = _field_formats.FieldFormat.from(range => {
          const format = getFieldFormat({
            id: nestedFormatter.id,
            params: nestedFormatter.params
          });
          return (0, _date_range.convertDateRangeToString)(range, format.convert.bind(format));
        });
        return new DateRangeFormat();
      },
      ip_range: () => {
        const nestedFormatter = params;
        const IpRangeFormat = _field_formats.FieldFormat.from(range => {
          const format = getFieldFormat({
            id: nestedFormatter.id,
            params: nestedFormatter.params
          });
          return (0, _ip_range.convertIPRangeToString)(range, format.convert.bind(format));
        });
        return new IpRangeFormat();
      },
      terms: () => {
        const convert = (val, type) => {
          const format = getFieldFormat({
            id: params.id,
            params
          });
          if (val === '__other__') {
            return params.otherBucketLabel;
          }
          if (val === '__missing__') {
            return params.missingBucketLabel;
          }
          return format.convert(val, type);
        };
        return {
          convert,
          getConverterFor: type => val => convert(val, type)
        };
      }
    };
    if (!id || !(id in customFormats)) {
      return getFieldFormat(mapping);
    }
    return customFormats[id]();
  };
}