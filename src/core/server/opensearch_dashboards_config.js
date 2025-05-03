"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = void 0;
var _configSchema = require("@osd/config-schema");
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

const deprecations = ({
  renameFromRoot
}) => [renameFromRoot('kibana.enabled', 'opensearchDashboards.enabled'), renameFromRoot('kibana.index', 'opensearchDashboards.index'), renameFromRoot('kibana.autocompleteTerminateAfter', 'opensearchDashboards.autocompleteTerminateAfter'), renameFromRoot('kibana.autocompleteTimeout', 'opensearchDashboards.autocompleteTimeout')];
const config = exports.config = {
  path: 'opensearchDashboards',
  schema: _configSchema.schema.object({
    enabled: _configSchema.schema.boolean({
      defaultValue: true
    }),
    index: _configSchema.schema.string({
      defaultValue: '.kibana'
    }),
    configIndex: _configSchema.schema.string({
      defaultValue: '.opensearch_dashboards_config'
    }),
    autocompleteTerminateAfter: _configSchema.schema.duration({
      defaultValue: 100000
    }),
    autocompleteTimeout: _configSchema.schema.duration({
      defaultValue: 1000
    }),
    branding: _configSchema.schema.object({
      logo: _configSchema.schema.object({
        defaultUrl: _configSchema.schema.string({
          defaultValue: '/'
        }),
        darkModeUrl: _configSchema.schema.string({
          defaultValue: '/'
        })
      }),
      mark: _configSchema.schema.object({
        defaultUrl: _configSchema.schema.string({
          defaultValue: '/'
        }),
        darkModeUrl: _configSchema.schema.string({
          defaultValue: '/'
        })
      }),
      loadingLogo: _configSchema.schema.object({
        defaultUrl: _configSchema.schema.string({
          defaultValue: '/'
        }),
        darkModeUrl: _configSchema.schema.string({
          defaultValue: '/'
        })
      }),
      faviconUrl: _configSchema.schema.string({
        defaultValue: '/'
      }),
      applicationTitle: _configSchema.schema.string({
        defaultValue: ''
      }),
      useExpandedHeader: _configSchema.schema.boolean({
        defaultValue: true
      })
    }),
    survey: _configSchema.schema.object({
      url: _configSchema.schema.string({
        defaultValue: 'https://survey.opensearch.org'
      })
    }),
    dashboardAdmin: _configSchema.schema.object({
      groups: _configSchema.schema.arrayOf(_configSchema.schema.string(), {
        defaultValue: []
      }),
      users: _configSchema.schema.arrayOf(_configSchema.schema.string(), {
        defaultValue: []
      })
    }),
    futureNavigation: _configSchema.schema.boolean({
      defaultValue: false
    })
  }),
  deprecations
};