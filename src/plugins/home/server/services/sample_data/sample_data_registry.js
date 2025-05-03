"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SampleDataRegistry = void 0;
var _joi = _interopRequireDefault(require("joi"));
var _sample_dataset_schema = require("./lib/sample_dataset_schema");
var _data_sets = require("./data_sets");
var _routes = require("./routes");
var _usage = require("./usage");
var _uninstall = require("./routes/uninstall");
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
const flightsSampleDataset = (0, _data_sets.flightsSpecProvider)();
const logsSampleDataset = (0, _data_sets.logsSpecProvider)();
const ecommerceSampleDataset = (0, _data_sets.ecommerceSpecProvider)();
class SampleDataRegistry {
  constructor(initContext) {
    this.initContext = initContext;
    _defineProperty(this, "sampleDatasets", [flightsSampleDataset, logsSampleDataset, ecommerceSampleDataset]);
  }
  setup(core, usageCollections) {
    if (usageCollections) {
      (0, _usage.makeSampleDataUsageCollector)(usageCollections, this.initContext);
    }
    const usageTracker = (0, _usage.usage)(core.getStartServices().then(([coreStart]) => coreStart.savedObjects), this.initContext.logger.get('sample_data', 'usage'));
    const router = core.http.createRouter();
    (0, _routes.createListRoute)(router, this.sampleDatasets);
    (0, _routes.createInstallRoute)(router, this.sampleDatasets, this.initContext.logger.get('sampleData'), usageTracker);
    (0, _uninstall.createUninstallRoute)(router, this.sampleDatasets, usageTracker);
    return {
      registerSampleDataset: specProvider => {
        const {
          error,
          value
        } = _joi.default.validate(specProvider(), _sample_dataset_schema.sampleDataSchema);
        if (error) {
          throw new Error(`Unable to register sample dataset spec because it's invalid. ${error}`);
        }
        const defaultIndexSavedObjectJson = value.savedObjects.find(savedObjectJson => {
          return savedObjectJson.type === 'index-pattern' && savedObjectJson.id === value.defaultIndex;
        });
        if (!defaultIndexSavedObjectJson) {
          throw new Error(`Unable to register sample dataset spec, defaultIndex: "${value.defaultIndex}" does not exist in savedObjects list.`);
        }
        const dashboardSavedObjectJson = value.savedObjects.find(savedObjectJson => {
          return savedObjectJson.type === 'dashboard' && savedObjectJson.id === value.overviewDashboard;
        });
        if (!dashboardSavedObjectJson) {
          throw new Error(`Unable to register sample dataset spec, overviewDashboard: "${value.overviewDashboard}" does not exist in savedObject list.`);
        }
        this.sampleDatasets.push(value);
      },
      getSampleDatasets: () => this.sampleDatasets,
      addSavedObjectsToSampleDataset: (id, savedObjects) => {
        const sampleDataset = this.sampleDatasets.find(dataset => {
          return dataset.id === id;
        });
        if (!sampleDataset) {
          throw new Error(`Unable to find sample dataset with id: ${id}`);
        }
        sampleDataset.savedObjects = sampleDataset.savedObjects.concat(savedObjects);
      },
      addAppLinksToSampleDataset: (id, appLinks) => {
        const sampleDataset = this.sampleDatasets.find(dataset => {
          return dataset.id === id;
        });
        if (!sampleDataset) {
          throw new Error(`Unable to find sample dataset with id: ${id}`);
        }
        sampleDataset.appLinks = sampleDataset.appLinks ? sampleDataset.appLinks.concat(appLinks) : [];
      },
      replacePanelInSampleDatasetDashboard: ({
        sampleDataId,
        dashboardId,
        oldEmbeddableId,
        embeddableId,
        embeddableType,
        embeddableConfig
      }) => {
        const sampleDataset = this.sampleDatasets.find(dataset => {
          return dataset.id === sampleDataId;
        });
        if (!sampleDataset) {
          throw new Error(`Unable to find sample dataset with id: ${sampleDataId}`);
        }
        const dashboard = sampleDataset.savedObjects.find(savedObject => {
          return savedObject.id === dashboardId && savedObject.type === 'dashboard';
        });
        if (!dashboard) {
          throw new Error(`Unable to find dashboard with id: ${dashboardId}`);
        }
        try {
          const reference = dashboard.references.find(referenceItem => {
            return referenceItem.id === oldEmbeddableId;
          });
          if (!reference) {
            throw new Error(`Unable to find reference for embeddable: ${oldEmbeddableId}`);
          }
          reference.type = embeddableType;
          reference.id = embeddableId;
          const panels = JSON.parse(dashboard.attributes.panelsJSON);
          const panel = panels.find(panelItem => {
            return panelItem.panelRefName === reference.name;
          });
          if (!panel) {
            throw new Error(`Unable to find panel for reference: ${reference.name}`);
          }
          panel.embeddableConfig = embeddableConfig;
          dashboard.attributes.panelsJSON = JSON.stringify(panels);
        } catch (error) {
          throw new Error(`Unable to replace panel with embeddable ${oldEmbeddableId}, error: ${error}`);
        }
      }
    };
  }
  start() {
    return {};
  }
}
/** @public */

/** @public */
exports.SampleDataRegistry = SampleDataRegistry;