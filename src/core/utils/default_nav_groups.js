"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SECURITY_ANALYTICS_USE_CASE_ID = exports.SEARCH_USE_CASE_ID = exports.OBSERVABILITY_USE_CASE_ID = exports.ESSENTIAL_USE_CASE_ID = exports.DEFAULT_NAV_GROUPS = exports.ALL_USE_CASE_ID = void 0;
var _i18n = require("@osd/i18n");
var _types = require("../types");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const ALL_USE_CASE_ID = exports.ALL_USE_CASE_ID = 'all';
const OBSERVABILITY_USE_CASE_ID = exports.OBSERVABILITY_USE_CASE_ID = 'observability';
const SECURITY_ANALYTICS_USE_CASE_ID = exports.SECURITY_ANALYTICS_USE_CASE_ID = 'security-analytics';
const ESSENTIAL_USE_CASE_ID = exports.ESSENTIAL_USE_CASE_ID = 'essentials';
const SEARCH_USE_CASE_ID = exports.SEARCH_USE_CASE_ID = 'search';
const defaultNavGroups = {
  dataAdministration: {
    id: 'dataAdministration',
    title: _i18n.i18n.translate('core.ui.group.dataAdministration.title', {
      defaultMessage: 'Data administration'
    }),
    description: _i18n.i18n.translate('core.ui.group.dataAdministration.description', {
      defaultMessage: 'Apply policies or security on your data.'
    }),
    order: 1000,
    type: _types.NavGroupType.SYSTEM
  },
  settingsAndSetup: {
    id: 'settingsAndSetup',
    title: _i18n.i18n.translate('core.ui.group.settingsAndSetup.title', {
      defaultMessage: 'Settings and setup'
    }),
    description: _i18n.i18n.translate('core.ui.group.settingsAndSetup.description', {
      defaultMessage: 'Set up your cluster with index patterns.'
    }),
    order: 2000,
    type: _types.NavGroupType.SYSTEM
  },
  all: {
    id: ALL_USE_CASE_ID,
    title: _i18n.i18n.translate('core.ui.group.all.title', {
      defaultMessage: 'Analytics (All)'
    }),
    description: _i18n.i18n.translate('core.ui.group.all.description', {
      defaultMessage: 'This is a use case contains all the features.'
    }),
    order: 3000,
    icon: 'wsAnalytics'
  },
  observability: {
    id: OBSERVABILITY_USE_CASE_ID,
    title: _i18n.i18n.translate('core.ui.group.observability.title', {
      defaultMessage: 'Observability'
    }),
    description: _i18n.i18n.translate('core.ui.group.observability.description', {
      defaultMessage: 'Gain visibility into your application and infrastructure'
    }),
    order: 4000,
    icon: 'wsObservability'
  },
  'security-analytics': {
    id: SECURITY_ANALYTICS_USE_CASE_ID,
    title: _i18n.i18n.translate('core.ui.group.security.analytics.title', {
      defaultMessage: 'Security Analytics'
    }),
    description: _i18n.i18n.translate('core.ui.group.security.analytics.description', {
      defaultMessage: 'Enhance your security posture with advanced analytics'
    }),
    order: 5000,
    icon: 'wsSecurityAnalytics'
  },
  essentials: {
    id: ESSENTIAL_USE_CASE_ID,
    title: _i18n.i18n.translate('core.ui.group.essential.title', {
      defaultMessage: 'Essentials'
    }),
    description: _i18n.i18n.translate('core.ui.group.essential.description', {
      defaultMessage: 'Analyze data to derive insights, identify patterns and trends, and make data-driven decisions.'
    }),
    order: 7000,
    icon: 'wsEssentials'
  },
  search: {
    id: SEARCH_USE_CASE_ID,
    title: _i18n.i18n.translate('core.ui.group.search.title', {
      defaultMessage: 'Search'
    }),
    description: _i18n.i18n.translate('core.ui.group.search.description', {
      defaultMessage: 'Discover and query your data with ease'
    }),
    order: 6000,
    icon: 'wsSearch'
  }
};

/** @internal */
const DEFAULT_NAV_GROUPS = exports.DEFAULT_NAV_GROUPS = Object.freeze(defaultNavGroups);