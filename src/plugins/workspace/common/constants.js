"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WORKSPACE_USE_CASES = exports.WORKSPACE_UI_SETTINGS_CLIENT_WRAPPER_ID = exports.WORKSPACE_SAVED_OBJECTS_CLIENT_WRAPPER_ID = exports.WORKSPACE_NAVIGATION_APP_ID = exports.WORKSPACE_LIST_APP_ID = exports.WORKSPACE_INITIAL_APP_ID = exports.WORKSPACE_ID_CONSUMER_WRAPPER_ID = exports.WORKSPACE_FATAL_ERROR_APP_ID = exports.WORKSPACE_DETAIL_APP_ID = exports.WORKSPACE_DATA_SOURCE_AND_CONNECTION_OBJECT_TYPES = exports.WORKSPACE_CREATE_APP_ID = exports.WORKSPACE_CONFLICT_CONTROL_SAVED_OBJECTS_CLIENT_WRAPPER_ID = exports.WORKSPACE_COLLABORATORS_APP_ID = exports.USE_CASE_PREFIX = exports.USE_CASE_CARD_GRADIENT_PREFIX = exports.RECENT_WORKSPACES_KEY = exports.PRIORITY_FOR_WORKSPACE_UI_SETTINGS_WRAPPER = exports.PRIORITY_FOR_WORKSPACE_ID_CONSUMER_WRAPPER = exports.PRIORITY_FOR_WORKSPACE_CONFLICT_CONTROL_WRAPPER = exports.PRIORITY_FOR_REPOSITORY_WRAPPER = exports.PRIORITY_FOR_PERMISSION_CONTROL_WRAPPER = exports.OSD_ADMIN_WILDCARD_MATCH_ALL = exports.OPENSEARCHDASHBOARDS_CONFIG_PATH = exports.MAX_WORKSPACE_PICKER_NUM = exports.MAX_WORKSPACE_NAME_LENGTH = exports.MAX_WORKSPACE_DESCRIPTION_LENGTH = exports.ESSENTIAL_WORKSPACE_DISMISS_GET_STARTED = exports.DEFAULT_WORKSPACE = exports.CURRENT_USER_PLACEHOLDER = exports.AssociationDataSourceModalMode = exports.ANALYTICS_WORKSPACE_DISMISS_GET_STARTED = void 0;
var _i18n = require("@osd/i18n");
var _common = require("../../data_source/common");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const WORKSPACE_FATAL_ERROR_APP_ID = exports.WORKSPACE_FATAL_ERROR_APP_ID = 'workspace_fatal_error';
const WORKSPACE_CREATE_APP_ID = exports.WORKSPACE_CREATE_APP_ID = 'workspace_create';
const WORKSPACE_LIST_APP_ID = exports.WORKSPACE_LIST_APP_ID = 'workspace_list';
const WORKSPACE_DETAIL_APP_ID = exports.WORKSPACE_DETAIL_APP_ID = 'workspace_detail';
const WORKSPACE_INITIAL_APP_ID = exports.WORKSPACE_INITIAL_APP_ID = 'workspace_initial';
const WORKSPACE_NAVIGATION_APP_ID = exports.WORKSPACE_NAVIGATION_APP_ID = 'workspace_navigation';
const WORKSPACE_COLLABORATORS_APP_ID = exports.WORKSPACE_COLLABORATORS_APP_ID = 'workspace_collaborators';
const WORKSPACE_SAVED_OBJECTS_CLIENT_WRAPPER_ID = exports.WORKSPACE_SAVED_OBJECTS_CLIENT_WRAPPER_ID = 'workspace';
const WORKSPACE_CONFLICT_CONTROL_SAVED_OBJECTS_CLIENT_WRAPPER_ID = exports.WORKSPACE_CONFLICT_CONTROL_SAVED_OBJECTS_CLIENT_WRAPPER_ID = 'workspace_conflict_control';
const WORKSPACE_UI_SETTINGS_CLIENT_WRAPPER_ID = exports.WORKSPACE_UI_SETTINGS_CLIENT_WRAPPER_ID = 'workspace_ui_settings';
/**
 * UI setting for user default workspace
 */
const DEFAULT_WORKSPACE = exports.DEFAULT_WORKSPACE = 'defaultWorkspace';
const ESSENTIAL_WORKSPACE_DISMISS_GET_STARTED = exports.ESSENTIAL_WORKSPACE_DISMISS_GET_STARTED = 'essentialWorkspace:dismissGetStarted';
const ANALYTICS_WORKSPACE_DISMISS_GET_STARTED = exports.ANALYTICS_WORKSPACE_DISMISS_GET_STARTED = 'analyticsWorkspace:dismissGetStarted';
const WORKSPACE_ID_CONSUMER_WRAPPER_ID = exports.WORKSPACE_ID_CONSUMER_WRAPPER_ID = 'workspace_id_consumer';

/**
 * The priority for these wrappers matters:
 * 1. WORKSPACE_ID_CONSUMER wrapper should be the first wrapper to execute, as it will add the `workspaces` field
 * to `options` based on the request, which will be honored by permission control wrapper and conflict wrapper.
 * 2. The order of permission wrapper and conflict wrapper does not matter as no dependency between these two wrappers.
 */
const PRIORITY_FOR_WORKSPACE_ID_CONSUMER_WRAPPER = exports.PRIORITY_FOR_WORKSPACE_ID_CONSUMER_WRAPPER = -3;
const PRIORITY_FOR_WORKSPACE_UI_SETTINGS_WRAPPER = exports.PRIORITY_FOR_WORKSPACE_UI_SETTINGS_WRAPPER = -2;
const PRIORITY_FOR_WORKSPACE_CONFLICT_CONTROL_WRAPPER = exports.PRIORITY_FOR_WORKSPACE_CONFLICT_CONTROL_WRAPPER = -1;
const PRIORITY_FOR_PERMISSION_CONTROL_WRAPPER = exports.PRIORITY_FOR_PERMISSION_CONTROL_WRAPPER = 0;

/**
 * The repository wrapper should be the wrapper closest to the repository client,
 * so we give a large number to the wrapper
 */
const PRIORITY_FOR_REPOSITORY_WRAPPER = exports.PRIORITY_FOR_REPOSITORY_WRAPPER = Number.MAX_VALUE;

/**
 *
 * This is a temp solution to store relationships between use cases  and features.
 * The relationship should be provided by plugin itself. The workspace plugin should
 * provide some method to register single feature to the use case map instead of
 * store a static map in workspace.
 *
 */

const WORKSPACE_USE_CASES = exports.WORKSPACE_USE_CASES = Object.freeze({
  observability: {
    id: 'observability',
    title: _i18n.i18n.translate('workspace.usecase.observability.title', {
      defaultMessage: 'Observability'
    }),
    description: _i18n.i18n.translate('workspace.usecase.observability.description', {
      defaultMessage: 'Gain visibility into your application and infrastructure'
    }),
    icon: 'wsObservability',
    features: ['discover', 'dashboards', 'visualize', 'maps-dashboards', 'observability-notebooks', 'reports-dashboards', 'integrations', 'alerting', 'anomaly-detection-dashboards', 'observability-metrics', 'observability-traces', 'observability-applications',
    // Add management avoid index patterns application not found for dashboards or visualize
    'management']
  },
  'security-analytics': {
    id: 'security-analytics',
    title: _i18n.i18n.translate('workspace.usecase.security.analytics.title', {
      defaultMessage: 'Security Analytics'
    }),
    description: _i18n.i18n.translate('workspace.usecase.analytics.description', {
      defaultMessage: 'Enhance your security posture with advanced analytics'
    }),
    icon: 'wsSecurityAnalytics',
    features: ['discover', 'dashboards', 'visualize', 'maps-dashboards', 'observability-notebooks', 'reports-dashboards', 'integrations', 'alerting', 'anomaly-detection-dashboards', 'opensearch_security_analytics_dashboards',
    // Add management avoid index patterns application not found for dashboards or visualize
    'management']
  },
  essentials: {
    id: 'essentials',
    title: _i18n.i18n.translate('workspace.usecase.essentials.title', {
      defaultMessage: 'Essentials'
    }),
    description: _i18n.i18n.translate('workspace.usecase.essentials.description', {
      defaultMessage: 'Get start with just the basics'
    }),
    icon: 'wsEssentials',
    features: ['discover', 'dashboards', 'visualize', 'maps-dashboards', 'observability-notebooks', 'reports-dashboards', 'integrations', 'alerting', 'anomaly-detection-dashboards',
    // Add management avoid index patterns application not found for dashboards or visualize
    'management']
  },
  search: {
    id: 'search',
    title: _i18n.i18n.translate('workspace.usecase.search.title', {
      defaultMessage: 'Search'
    }),
    description: _i18n.i18n.translate('workspace.usecase.search.description', {
      defaultMessage: 'Discover and query your data with ease'
    }),
    icon: 'wsSearch',
    features: ['discover', 'dashboards', 'visualize', 'maps-dashboards', 'reports-dashboards', 'searchRelevance',
    // Add management avoid index patterns application not found for dashboards or visualize
    'management']
  }
});
const MAX_WORKSPACE_PICKER_NUM = exports.MAX_WORKSPACE_PICKER_NUM = 3;
const RECENT_WORKSPACES_KEY = exports.RECENT_WORKSPACES_KEY = 'recentWorkspaces';
const CURRENT_USER_PLACEHOLDER = exports.CURRENT_USER_PLACEHOLDER = '%me%';
const MAX_WORKSPACE_NAME_LENGTH = exports.MAX_WORKSPACE_NAME_LENGTH = 40;
const MAX_WORKSPACE_DESCRIPTION_LENGTH = exports.MAX_WORKSPACE_DESCRIPTION_LENGTH = 200;
let AssociationDataSourceModalMode = exports.AssociationDataSourceModalMode = /*#__PURE__*/function (AssociationDataSourceModalMode) {
  AssociationDataSourceModalMode["OpenSearchConnections"] = "opensearch-connections";
  AssociationDataSourceModalMode["DirectQueryConnections"] = "direction-query-connections";
  return AssociationDataSourceModalMode;
}({});
const USE_CASE_PREFIX = exports.USE_CASE_PREFIX = 'use-case-';
const OPENSEARCHDASHBOARDS_CONFIG_PATH = exports.OPENSEARCHDASHBOARDS_CONFIG_PATH = 'opensearchDashboards';

// Workspace will handle both data source and data connection type saved object.
const WORKSPACE_DATA_SOURCE_AND_CONNECTION_OBJECT_TYPES = exports.WORKSPACE_DATA_SOURCE_AND_CONNECTION_OBJECT_TYPES = [_common.DATA_SOURCE_SAVED_OBJECT_TYPE, _common.DATA_CONNECTION_SAVED_OBJECT_TYPE];
const USE_CASE_CARD_GRADIENT_PREFIX = exports.USE_CASE_CARD_GRADIENT_PREFIX = 'workspace-initial-use-case-card';
const OSD_ADMIN_WILDCARD_MATCH_ALL = exports.OSD_ADMIN_WILDCARD_MATCH_ALL = '*';