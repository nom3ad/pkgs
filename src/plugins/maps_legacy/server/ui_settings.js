"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUiSettings = getUiSettings;
var _i18n = require("@osd/i18n");
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

function getUiSettings() {
  return {
    'visualization:tileMap:maxPrecision': {
      name: _i18n.i18n.translate('maps_legacy.advancedSettings.visualization.tileMap.maxPrecisionTitle', {
        defaultMessage: 'Maximum tile map precision'
      }),
      value: 7,
      description: _i18n.i18n.translate('maps_legacy.advancedSettings.visualization.tileMap.maxPrecisionText', {
        defaultMessage: 'The maximum geoHash precision displayed on tile maps: 7 is high, 10 is very high, 12 is the max. {cellDimensionsLink}',
        description: 'Part of composite text: maps_legacy.advancedSettings.visualization.tileMap.maxPrecisionText + ' + 'maps_legacy.advancedSettings.visualization.tileMap.maxPrecision.cellDimensionsLinkText',
        values: {
          cellDimensionsLink: `<a href="https://opensearch.org/docs/latest/aggregations/bucket/geohash-grid/"
            target="_blank" rel="noopener noreferrer">` + _i18n.i18n.translate('maps_legacy.advancedSettings.visualization.tileMap.maxPrecision.cellDimensionsLinkText', {
            defaultMessage: 'Explanation of cell dimensions'
          }) + '</a>'
        }
      }),
      schema: _configSchema.schema.number(),
      category: ['visualization']
    },
    'visualization:tileMap:WMSdefaults': {
      name: _i18n.i18n.translate('maps_legacy.advancedSettings.visualization.tileMap.wmsDefaultsTitle', {
        defaultMessage: 'Default WMS properties'
      }),
      value: JSON.stringify({
        enabled: false,
        url: '',
        options: {
          version: '',
          layers: '',
          format: 'image/png',
          transparent: true,
          attribution: '',
          styles: ''
        }
      }, null, 2),
      type: 'json',
      description: _i18n.i18n.translate('maps_legacy.advancedSettings.visualization.tileMap.wmsDefaultsText', {
        defaultMessage: 'Default {propertiesLink} for the WMS map server support in the coordinate map',
        description: 'Part of composite text: maps_legacy.advancedSettings.visualization.tileMap.wmsDefaultsText + ' + 'maps_legacy.advancedSettings.visualization.tileMap.wmsDefaults.propertiesLinkText',
        values: {
          propertiesLink: '<a href="https://leafletjs.com/reference.html#tilelayer-wms" target="_blank" rel="noopener noreferrer">' + _i18n.i18n.translate('maps_legacy.advancedSettings.visualization.tileMap.wmsDefaults.propertiesLinkText', {
            defaultMessage: 'properties'
          }) + '</a>'
        }
      }),
      schema: _configSchema.schema.object({
        enabled: _configSchema.schema.boolean(),
        url: _configSchema.schema.string(),
        options: _configSchema.schema.object({
          version: _configSchema.schema.string(),
          layers: _configSchema.schema.string(),
          format: _configSchema.schema.string(),
          transparent: _configSchema.schema.boolean(),
          attribution: _configSchema.schema.string(),
          styles: _configSchema.schema.string()
        })
      }),
      category: ['visualization']
    }
  };
}