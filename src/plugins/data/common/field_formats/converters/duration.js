"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DurationFormat = void 0;
var _i18n = require("@osd/i18n");
var _moment = _interopRequireDefault(require("moment"));
var _types = require("../../osd_field_types/types");
var _field_format = require("../field_format");
var _types2 = require("../types");
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
const ratioToSeconds = {
  picoseconds: 0.000000000001,
  nanoseconds: 0.000000001,
  microseconds: 0.000001
};
const HUMAN_FRIENDLY = 'humanize';
const DEFAULT_OUTPUT_PRECISION = 2;
const DEFAULT_INPUT_FORMAT = {
  text: _i18n.i18n.translate('data.fieldFormats.duration.inputFormats.seconds', {
    defaultMessage: 'Seconds'
  }),
  kind: 'seconds'
};
const inputFormats = [{
  text: _i18n.i18n.translate('data.fieldFormats.duration.inputFormats.picoseconds', {
    defaultMessage: 'Picoseconds'
  }),
  kind: 'picoseconds'
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.inputFormats.nanoseconds', {
    defaultMessage: 'Nanoseconds'
  }),
  kind: 'nanoseconds'
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.inputFormats.microseconds', {
    defaultMessage: 'Microseconds'
  }),
  kind: 'microseconds'
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.inputFormats.milliseconds', {
    defaultMessage: 'Milliseconds'
  }),
  kind: 'milliseconds'
}, {
  ...DEFAULT_INPUT_FORMAT
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.inputFormats.minutes', {
    defaultMessage: 'Minutes'
  }),
  kind: 'minutes'
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.inputFormats.hours', {
    defaultMessage: 'Hours'
  }),
  kind: 'hours'
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.inputFormats.days', {
    defaultMessage: 'Days'
  }),
  kind: 'days'
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.inputFormats.weeks', {
    defaultMessage: 'Weeks'
  }),
  kind: 'weeks'
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.inputFormats.months', {
    defaultMessage: 'Months'
  }),
  kind: 'months'
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.inputFormats.years', {
    defaultMessage: 'Years'
  }),
  kind: 'years'
}];
const DEFAULT_OUTPUT_FORMAT = {
  text: _i18n.i18n.translate('data.fieldFormats.duration.outputFormats.humanize', {
    defaultMessage: 'Human Readable'
  }),
  method: 'humanize'
};
const outputFormats = [{
  ...DEFAULT_OUTPUT_FORMAT
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.outputFormats.asMilliseconds', {
    defaultMessage: 'Milliseconds'
  }),
  method: 'asMilliseconds'
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.outputFormats.asSeconds', {
    defaultMessage: 'Seconds'
  }),
  method: 'asSeconds'
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.outputFormats.asMinutes', {
    defaultMessage: 'Minutes'
  }),
  method: 'asMinutes'
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.outputFormats.asHours', {
    defaultMessage: 'Hours'
  }),
  method: 'asHours'
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.outputFormats.asDays', {
    defaultMessage: 'Days'
  }),
  method: 'asDays'
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.outputFormats.asWeeks', {
    defaultMessage: 'Weeks'
  }),
  method: 'asWeeks'
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.outputFormats.asMonths', {
    defaultMessage: 'Months'
  }),
  method: 'asMonths'
}, {
  text: _i18n.i18n.translate('data.fieldFormats.duration.outputFormats.asYears', {
    defaultMessage: 'Years'
  }),
  method: 'asYears'
}];
function parseInputAsDuration(val, inputFormat) {
  const ratio = ratioToSeconds[inputFormat] || 1;
  const kind = inputFormat in ratioToSeconds ? 'seconds' : inputFormat;
  return _moment.default.duration(val * ratio, kind);
}
class DurationFormat extends _field_format.FieldFormat {
  constructor(...args) {
    super(...args);
    _defineProperty(this, "allowsNumericalAggregations", true);
    _defineProperty(this, "textConvert", val => {
      const inputFormat = this.param('inputFormat');
      const outputFormat = this.param('outputFormat');
      const outputPrecision = this.param('outputPrecision');
      const showSuffix = Boolean(this.param('showSuffix'));
      const human = this.isHuman();
      const prefix = val < 0 && human ? _i18n.i18n.translate('data.fieldFormats.duration.negativeLabel', {
        defaultMessage: 'minus'
      }) + ' ' : '';
      const duration = parseInputAsDuration(val, inputFormat);
      const formatted = duration[outputFormat]();
      const precise = human ? formatted : formatted.toFixed(outputPrecision);
      const type = outputFormats.find(({
        method
      }) => method === outputFormat);
      const suffix = showSuffix && type ? ` ${type.text}` : '';
      return prefix + precise + suffix;
    });
  }
  isHuman() {
    return this.param('outputFormat') === HUMAN_FRIENDLY;
  }
  getParamDefaults() {
    return {
      inputFormat: DEFAULT_INPUT_FORMAT.kind,
      outputFormat: DEFAULT_OUTPUT_FORMAT.method,
      outputPrecision: DEFAULT_OUTPUT_PRECISION
    };
  }
}
exports.DurationFormat = DurationFormat;
_defineProperty(DurationFormat, "id", _types2.FIELD_FORMAT_IDS.DURATION);
_defineProperty(DurationFormat, "title", _i18n.i18n.translate('data.fieldFormats.duration.title', {
  defaultMessage: 'Duration'
}));
_defineProperty(DurationFormat, "fieldType", _types.OSD_FIELD_TYPES.NUMBER);
_defineProperty(DurationFormat, "inputFormats", inputFormats);
_defineProperty(DurationFormat, "outputFormats", outputFormats);