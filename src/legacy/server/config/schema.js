"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _joi = _interopRequireDefault(require("joi"));
var _os = _interopRequireDefault(require("os"));
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

const HANDLED_IN_NEW_PLATFORM = _joi.default.any().description('This key is handled in the new platform ONLY');
var _default = () => _joi.default.object({
  elastic: _joi.default.object({
    apm: HANDLED_IN_NEW_PLATFORM
  }).default(),
  pkg: _joi.default.object({
    version: _joi.default.string().default(_joi.default.ref('$version')),
    branch: _joi.default.string().default(_joi.default.ref('$branch')),
    buildNum: _joi.default.number().default(_joi.default.ref('$buildNum')),
    buildSha: _joi.default.string().default(_joi.default.ref('$buildSha'))
  }).default(),
  env: _joi.default.object({
    name: _joi.default.string().default(_joi.default.ref('$env')),
    dev: _joi.default.boolean().default(_joi.default.ref('$dev')),
    prod: _joi.default.boolean().default(_joi.default.ref('$prod'))
  }).default(),
  dev: HANDLED_IN_NEW_PLATFORM,
  pid: HANDLED_IN_NEW_PLATFORM,
  csp: HANDLED_IN_NEW_PLATFORM,
  server: _joi.default.object({
    name: _joi.default.string().default(_os.default.hostname()),
    // keep them for BWC, remove when not used in Legacy.
    // validation should be in sync with one in New platform.
    // https://github.com/opensearch-project/OpenSearch-Dashboards/blob/main/src/core/server/http/http_config.ts
    basePath: _joi.default.string().default('').allow('').regex(/(^$|^\/.*[^\/]$)/, `start with a slash, don't end with one`),
    host: _joi.default.string().hostname().default('localhost'),
    port: _joi.default.number().default(5601),
    rewriteBasePath: _joi.default.boolean().when('basePath', {
      is: '',
      then: _joi.default.default(false).valid(false),
      otherwise: _joi.default.default(false)
    }),
    autoListen: HANDLED_IN_NEW_PLATFORM,
    cors: HANDLED_IN_NEW_PLATFORM,
    customResponseHeaders: HANDLED_IN_NEW_PLATFORM,
    keepaliveTimeout: HANDLED_IN_NEW_PLATFORM,
    maxPayloadBytes: HANDLED_IN_NEW_PLATFORM,
    socketTimeout: HANDLED_IN_NEW_PLATFORM,
    ssl: HANDLED_IN_NEW_PLATFORM,
    compression: HANDLED_IN_NEW_PLATFORM,
    uuid: HANDLED_IN_NEW_PLATFORM,
    xsrf: HANDLED_IN_NEW_PLATFORM
  }).default(),
  uiSettings: HANDLED_IN_NEW_PLATFORM,
  logging: _joi.default.object().keys({
    appenders: HANDLED_IN_NEW_PLATFORM,
    loggers: HANDLED_IN_NEW_PLATFORM,
    root: HANDLED_IN_NEW_PLATFORM,
    silent: _joi.default.boolean().default(false),
    quiet: _joi.default.boolean().when('silent', {
      is: true,
      then: _joi.default.default(true).valid(true),
      otherwise: _joi.default.default(false)
    }),
    verbose: _joi.default.boolean().when('quiet', {
      is: true,
      then: _joi.default.valid(false).default(false),
      otherwise: _joi.default.default(false)
    }),
    events: _joi.default.any().default({}),
    dest: _joi.default.string().default('stdout'),
    ignoreEnospcError: _joi.default.boolean().default(false),
    filter: _joi.default.any().default({}),
    json: _joi.default.boolean().when('dest', {
      is: 'stdout',
      then: _joi.default.default(!process.stdout.isTTY),
      otherwise: _joi.default.default(true)
    }),
    timezone: _joi.default.string().allow(false).default('UTC'),
    rotate: _joi.default.object().keys({
      enabled: _joi.default.boolean().default(false),
      everyBytes: _joi.default.number()
      // > 1MB
      .greater(1048576)
      // < 1GB
      .less(1073741825)
      // 10MB
      .default(10485760),
      keepFiles: _joi.default.number().greater(2).less(1024).default(7),
      pollingInterval: _joi.default.number().greater(5000).less(3600000).default(10000),
      usePolling: _joi.default.boolean().default(false)
    }).default()
  }).default(),
  ops: _joi.default.object({
    interval: _joi.default.number().default(5000),
    cGroupOverrides: HANDLED_IN_NEW_PLATFORM
  }).default(),
  // still used by the legacy i18n mixin
  plugins: _joi.default.object({
    paths: _joi.default.array().items(_joi.default.string()).default([]),
    scanDirs: _joi.default.array().items(_joi.default.string()).default([]),
    initialize: _joi.default.boolean().default(true)
  }).default(),
  path: HANDLED_IN_NEW_PLATFORM,
  stats: HANDLED_IN_NEW_PLATFORM,
  status: HANDLED_IN_NEW_PLATFORM,
  map: _joi.default.object({
    includeOpenSearchMapsService: _joi.default.boolean().default(true),
    proxyOpenSearchMapsServiceInMaps: _joi.default.boolean().default(false),
    showRegionDeniedWarning: _joi.default.boolean().default(false),
    tilemap: _joi.default.object({
      url: _joi.default.string(),
      options: _joi.default.object({
        attribution: _joi.default.string(),
        minZoom: _joi.default.number().min(0, 'Must be 0 or higher').default(0),
        maxZoom: _joi.default.number().default(10),
        tileSize: _joi.default.number(),
        subdomains: _joi.default.array().items(_joi.default.string()).single(),
        errorTileUrl: _joi.default.string().uri(),
        tms: _joi.default.boolean(),
        reuseTiles: _joi.default.boolean(),
        bounds: _joi.default.array().items(_joi.default.array().items(_joi.default.number()).min(2).required()).min(2),
        default: _joi.default.boolean()
      }).default({
        default: true
      })
    }).default(),
    regionmap: _joi.default.object({
      includeOpenSearchMapsService: _joi.default.boolean().default(true),
      layers: _joi.default.array().items(_joi.default.object({
        url: _joi.default.string(),
        format: _joi.default.object({
          type: _joi.default.string().default('geojson')
        }).default({
          type: 'geojson'
        }),
        meta: _joi.default.object({
          feature_collection_path: _joi.default.string().default('data')
        }).default({
          feature_collection_path: 'data'
        }),
        attribution: _joi.default.string(),
        name: _joi.default.string(),
        fields: _joi.default.array().items(_joi.default.object({
          name: _joi.default.string(),
          description: _joi.default.string()
        }))
      })).default([])
    }).default(),
    manifestServiceUrl: _joi.default.string().default('').allow(''),
    opensearchManifestServiceUrl: _joi.default.string().default('https://maps.opensearch.org/manifest'),
    emsFileApiUrl: _joi.default.string().default('https://vectors.maps.opensearch.org'),
    emsTileApiUrl: _joi.default.string().default('https://tiles.maps.opensearch.org'),
    emsLandingPageUrl: _joi.default.string().default('https://maps.opensearch.org'),
    emsFontLibraryUrl: _joi.default.string().default('https://tiles.maps.opensearch.org/fonts/{fontstack}/{range}.pbf'),
    emsTileLayerId: _joi.default.object({
      bright: _joi.default.string().default('road_map'),
      desaturated: _joi.default.string().default('road_map_desaturated'),
      dark: _joi.default.string().default('dark_map')
    }).default({
      bright: 'road_map',
      desaturated: 'road_map_desaturated',
      dark: 'dark_map'
    })
  }).default(),
  i18n: _joi.default.object({
    locale: _joi.default.string().default('en')
  }).default(),
  // temporarily moved here from the (now deleted) opensearch-dashboards legacy plugin
  opensearchDashboards: _joi.default.object({
    enabled: _joi.default.boolean().default(true),
    index: _joi.default.string().default('.kibana'),
    configIndex: _joi.default.string().default('.opensearch_dashboards_config'),
    autocompleteTerminateAfter: _joi.default.number().integer().min(1).default(100000),
    // TODO Also allow units here like in opensearch config once this is moved to the new platform
    autocompleteTimeout: _joi.default.number().integer().min(1).default(1000),
    branding: _joi.default.object({
      logo: _joi.default.object({
        defaultUrl: _joi.default.any().default('/'),
        darkModeUrl: _joi.default.any().default('/')
      }),
      mark: _joi.default.object({
        defaultUrl: _joi.default.any().default('/'),
        darkModeUrl: _joi.default.any().default('/')
      }),
      loadingLogo: _joi.default.object({
        defaultUrl: _joi.default.any().default('/'),
        darkModeUrl: _joi.default.any().default('/')
      }),
      faviconUrl: _joi.default.any().default('/'),
      applicationTitle: _joi.default.any().default(''),
      useExpandedHeader: _joi.default.boolean().default(true)
    }),
    survey: _joi.default.object({
      url: _joi.default.any().default('/')
    }),
    dashboardAdmin: _joi.default.object({
      groups: _joi.default.array().items(_joi.default.string()).default([]),
      users: _joi.default.array().items(_joi.default.string()).default([])
    }),
    futureNavigation: _joi.default.boolean().default(false)
  }).default(),
  savedObjects: HANDLED_IN_NEW_PLATFORM
}).default();
exports.default = _default;
module.exports = exports.default;