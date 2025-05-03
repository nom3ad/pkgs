"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDateFormatSettings = void 0;
var _momentTimezone = _interopRequireDefault(require("moment-timezone"));
var _configSchema = require("@osd/config-schema");
var _i18n = require("@osd/i18n");
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

const getDateFormatSettings = () => {
  const weekdays = _momentTimezone.default.weekdays().slice();
  const [defaultWeekday] = weekdays;
  const timezones = ['Browser', ..._momentTimezone.default.tz.names()
  // We need to filter out some time zones, that moment.js knows about, but OpenSearch
  // does not understand and would fail thus with a 400 bad request when using them.
  .filter(tz => !['America/Nuuk', 'EST', 'HST', 'ROC', 'MST'].includes(tz))];
  return {
    dateFormat: {
      name: _i18n.i18n.translate('core.ui_settings.params.dateFormatTitle', {
        defaultMessage: 'Date format'
      }),
      value: 'MMM D, YYYY @ HH:mm:ss.SSS',
      description: _i18n.i18n.translate('core.ui_settings.params.dateFormatText', {
        defaultMessage: 'When displaying a pretty formatted date, use this {formatLink}',
        description: 'Part of composite text: core.ui_settings.params.dateFormatText + ' + 'core.ui_settings.params.dateFormat.optionsLinkText',
        values: {
          formatLink: '<a href="https://momentjs.com/docs/#/displaying/format/" target="_blank" rel="noopener noreferrer">' + _i18n.i18n.translate('core.ui_settings.params.dateFormat.optionsLinkText', {
            defaultMessage: 'format'
          }) + '</a>'
        }
      }),
      schema: _configSchema.schema.string()
    },
    'dateFormat:tz': {
      name: _i18n.i18n.translate('core.ui_settings.params.dateFormat.timezoneTitle', {
        defaultMessage: 'Timezone for date formatting'
      }),
      value: 'Browser',
      description: _i18n.i18n.translate('core.ui_settings.params.dateFormat.timezoneText', {
        defaultMessage: 'Which timezone should be used. {defaultOption} will use the timezone detected by your browser.',
        values: {
          defaultOption: '"Browser"'
        }
      }),
      type: 'select',
      options: timezones,
      requiresPageReload: true,
      schema: _configSchema.schema.string({
        validate: value => {
          if (!timezones.includes(value)) {
            return _i18n.i18n.translate('core.ui_settings.params.dateFormat.timezone.invalidValidationMessage', {
              defaultMessage: 'Invalid timezone: {timezone}',
              values: {
                timezone: value
              }
            });
          }
        }
      })
    },
    'dateFormat:scaled': {
      name: _i18n.i18n.translate('core.ui_settings.params.dateFormat.scaledTitle', {
        defaultMessage: 'Scaled date format'
      }),
      type: 'json',
      value: `[
  ["", "HH:mm:ss.SSS"],
  ["PT1S", "HH:mm:ss"],
  ["PT1M", "HH:mm"],
  ["PT1H", "YYYY-MM-DD HH:mm"],
  ["P1DT", "YYYY-MM-DD"],
  ["P1YT", "YYYY"]
]`,
      description: _i18n.i18n.translate('core.ui_settings.params.dateFormat.scaledText', {
        defaultMessage: 'Values that define the format used in situations where time-based ' + 'data is rendered in order, and formatted timestamps should adapt to the ' + 'interval between measurements. Keys are {intervalsLink}.',
        description: 'Part of composite text: core.ui_settings.params.dateFormat.scaledText + ' + 'core.ui_settings.params.dateFormat.scaled.intervalsLinkText',
        values: {
          intervalsLink: '<a href="https://en.wikipedia.org/wiki/ISO_8601#Time_intervals" target="_blank" rel="noopener noreferrer">' + _i18n.i18n.translate('core.ui_settings.params.dateFormat.scaled.intervalsLinkText', {
            defaultMessage: 'ISO8601 intervals'
          }) + '</a>'
        }
      }),
      schema: _configSchema.schema.string()
    },
    'dateFormat:dow': {
      name: _i18n.i18n.translate('core.ui_settings.params.dateFormat.dayOfWeekTitle', {
        defaultMessage: 'Day of week'
      }),
      value: defaultWeekday,
      description: _i18n.i18n.translate('core.ui_settings.params.dateFormat.dayOfWeekText', {
        defaultMessage: 'What day should weeks start on?'
      }),
      type: 'select',
      options: weekdays,
      schema: _configSchema.schema.string({
        validate: value => {
          if (!weekdays.includes(value)) {
            return _i18n.i18n.translate('core.ui_settings.params.dayOfWeekText.invalidValidationMessage', {
              defaultMessage: 'Invalid day of week: {dayOfWeek}',
              values: {
                dayOfWeek: value
              }
            });
          }
        }
      })
    },
    dateNanosFormat: {
      name: _i18n.i18n.translate('core.ui_settings.params.dateNanosFormatTitle', {
        defaultMessage: 'Date with nanoseconds format'
      }),
      value: 'MMM D, YYYY @ HH:mm:ss.SSSSSSSSS',
      description: _i18n.i18n.translate('core.ui_settings.params.dateNanosFormatText', {
        defaultMessage: 'Used for the {dateNanosLink} datatype of OpenSearch',
        values: {
          dateNanosLink: '<a href="https://opensearch.org/docs/latest/opensearch/units/" target="_blank" rel="noopener noreferrer">' + _i18n.i18n.translate('core.ui_settings.params.dateNanosLinkTitle', {
            defaultMessage: 'date_nanos'
          }) + '</a>'
        }
      }),
      schema: _configSchema.schema.string()
    }
  };
};
exports.getDateFormatSettings = getDateFormatSettings;