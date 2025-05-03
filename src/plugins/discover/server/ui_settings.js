"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uiSettings = void 0;
var _i18n = require("@osd/i18n");
var _configSchema = require("@osd/config-schema");
var _common = require("../common");
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

const uiSettings = exports.uiSettings = {
  [_common.DEFAULT_COLUMNS_SETTING]: {
    name: _i18n.i18n.translate('discover.advancedSettings.defaultColumnsTitle', {
      defaultMessage: 'Default columns'
    }),
    value: ['_source'],
    description: _i18n.i18n.translate('discover.advancedSettings.defaultColumnsText', {
      defaultMessage: 'Columns displayed by default in the Discovery tab'
    }),
    category: ['discover'],
    schema: _configSchema.schema.arrayOf(_configSchema.schema.string())
  },
  [_common.SAMPLE_SIZE_SETTING]: {
    name: _i18n.i18n.translate('discover.advancedSettings.sampleSizeTitle', {
      defaultMessage: 'Number of rows'
    }),
    value: 500,
    description: _i18n.i18n.translate('discover.advancedSettings.sampleSizeText', {
      defaultMessage: 'The number of rows to show in the table'
    }),
    category: ['discover'],
    schema: _configSchema.schema.number()
  },
  [_common.AGGS_TERMS_SIZE_SETTING]: {
    name: _i18n.i18n.translate('discover.advancedSettings.aggsTermsSizeTitle', {
      defaultMessage: 'Number of terms'
    }),
    value: 20,
    type: 'number',
    description: _i18n.i18n.translate('discover.advancedSettings.aggsTermsSizeText', {
      defaultMessage: 'Determines how many terms will be visualized when clicking the "visualize" ' + 'button, in the field drop downs, in the discover sidebar.'
    }),
    category: ['discover'],
    schema: _configSchema.schema.number()
  },
  [_common.SORT_DEFAULT_ORDER_SETTING]: {
    name: _i18n.i18n.translate('discover.advancedSettings.sortDefaultOrderTitle', {
      defaultMessage: 'Default sort direction'
    }),
    value: 'desc',
    options: ['desc', 'asc'],
    optionLabels: {
      desc: _i18n.i18n.translate('discover.advancedSettings.sortOrderDesc', {
        defaultMessage: 'Descending'
      }),
      asc: _i18n.i18n.translate('discover.advancedSettings.sortOrderAsc', {
        defaultMessage: 'Ascending'
      })
    },
    type: 'select',
    description: _i18n.i18n.translate('discover.advancedSettings.sortDefaultOrderText', {
      defaultMessage: 'Controls the default sort direction for time based index patterns in the Discover app.'
    }),
    category: ['discover'],
    schema: _configSchema.schema.oneOf([_configSchema.schema.literal('desc'), _configSchema.schema.literal('asc')])
  },
  [_common.SEARCH_ON_PAGE_LOAD_SETTING]: {
    name: _i18n.i18n.translate('discover.advancedSettings.searchOnPageLoadTitle', {
      defaultMessage: 'Search on page load'
    }),
    value: true,
    type: 'boolean',
    description: _i18n.i18n.translate('discover.advancedSettings.searchOnPageLoadText', {
      defaultMessage: 'Controls whether a search is executed when Discover first loads. This setting does not ' + 'have an effect when loading a saved search.'
    }),
    category: ['discover'],
    schema: _configSchema.schema.boolean()
  },
  [_common.DOC_HIDE_TIME_COLUMN_SETTING]: {
    name: _i18n.i18n.translate('discover.advancedSettings.docTableHideTimeColumnTitle', {
      defaultMessage: "Hide 'Time' column"
    }),
    value: false,
    description: _i18n.i18n.translate('discover.advancedSettings.docTableHideTimeColumnText', {
      defaultMessage: "Hide the 'Time' column in Discover and in all Saved Searches on Dashboards."
    }),
    category: ['discover'],
    schema: _configSchema.schema.boolean()
  },
  [_common.FIELDS_LIMIT_SETTING]: {
    name: _i18n.i18n.translate('discover.advancedSettings.fieldsPopularLimitTitle', {
      defaultMessage: 'Popular fields limit'
    }),
    value: 10,
    description: _i18n.i18n.translate('discover.advancedSettings.fieldsPopularLimitText', {
      defaultMessage: 'The top N most popular fields to show'
    }),
    schema: _configSchema.schema.number()
  },
  [_common.CONTEXT_DEFAULT_SIZE_SETTING]: {
    name: _i18n.i18n.translate('discover.advancedSettings.context.defaultSizeTitle', {
      defaultMessage: 'Context size'
    }),
    value: 5,
    description: _i18n.i18n.translate('discover.advancedSettings.context.defaultSizeText', {
      defaultMessage: 'The number of surrounding entries to show in the context view'
    }),
    category: ['discover'],
    schema: _configSchema.schema.number()
  },
  [_common.CONTEXT_STEP_SETTING]: {
    name: _i18n.i18n.translate('discover.advancedSettings.context.sizeStepTitle', {
      defaultMessage: 'Context size step'
    }),
    value: 5,
    description: _i18n.i18n.translate('discover.advancedSettings.context.sizeStepText', {
      defaultMessage: 'The step size to increment or decrement the context size by'
    }),
    category: ['discover'],
    schema: _configSchema.schema.number()
  },
  [_common.CONTEXT_TIE_BREAKER_FIELDS_SETTING]: {
    name: _i18n.i18n.translate('discover.advancedSettings.context.tieBreakerFieldsTitle', {
      defaultMessage: 'Tie breaker fields'
    }),
    value: ['_doc'],
    description: _i18n.i18n.translate('discover.advancedSettings.context.tieBreakerFieldsText', {
      defaultMessage: 'A comma-separated list of fields to use for tie-breaking between documents that have the same timestamp value. ' + 'From this list the first field that is present and sortable in the current index pattern is used.'
    }),
    category: ['discover'],
    schema: _configSchema.schema.arrayOf(_configSchema.schema.string())
  },
  [_common.MODIFY_COLUMNS_ON_SWITCH]: {
    name: _i18n.i18n.translate('discover.advancedSettings.discover.modifyColumnsOnSwitchTitle', {
      defaultMessage: 'Modify columns when changing index patterns'
    }),
    value: true,
    description: _i18n.i18n.translate('discover.advancedSettings.discover.modifyColumnsOnSwitchText', {
      defaultMessage: 'Remove columns that not available in the new index pattern.'
    }),
    category: ['discover'],
    schema: _configSchema.schema.boolean()
  }
};