"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tutorialProvider = void 0;
var _i18n = require("@osd/i18n");
var _on_prem = require("./envs/on_prem");
var _index_pattern = _interopRequireDefault(require("./index_pattern.json"));
var _server = require("../../../../../src/plugins/home/server");
var _index_pattern_constants = require("../../common/index_pattern_constants");
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

const apmIntro = _i18n.i18n.translate('apmOss.tutorial.introduction', {
  defaultMessage: 'Collect in-depth performance metrics and errors from inside your applications.'
});
const moduleName = 'apm';
const tutorialProvider = ({
  indexPatternTitle,
  indices
}) => () => {
  const savedObjects = [{
    ..._index_pattern.default,
    id: _index_pattern_constants.APM_STATIC_INDEX_PATTERN_ID,
    attributes: {
      ..._index_pattern.default.attributes,
      title: indexPatternTitle
    }
  }];
  const artifacts = {
    dashboards: [{
      id: '8d3ed660-7828-11e7-8c47-65b845b5cfb3',
      linkLabel: _i18n.i18n.translate('apmOss.tutorial.specProvider.artifacts.dashboards.linkLabel', {
        defaultMessage: 'APM dashboard'
      }),
      isOverview: true
    }]
  };
  return {
    id: 'apm',
    name: _i18n.i18n.translate('apmOss.tutorial.specProvider.name', {
      defaultMessage: 'APM'
    }),
    moduleName,
    category: _server.TutorialsCategory.OTHER,
    shortDescription: apmIntro,
    longDescription: _i18n.i18n.translate('apmOss.tutorial.specProvider.longDescription', {
      defaultMessage: 'Application Performance Monitoring (APM) collects in-depth \
performance metrics and errors from inside your application. \
It allows you to monitor the performance of thousands of applications in real time. \
[Learn more]({learnMoreLink}).',
      values: {
        learnMoreLink: '{config.docs.base_url}guide/en/apm/get-started/{config.docs.version}/index.html'
      }
    }),
    euiIconType: 'apmApp',
    artifacts,
    onPrem: (0, _on_prem.onPremInstructions)(indices),
    previewImagePath: '/plugins/apmOss/assets/apm.png',
    savedObjects,
    savedObjectsInstallMsg: _i18n.i18n.translate('apmOss.tutorial.specProvider.savedObjectsInstallMsg', {
      defaultMessage: 'An APM index pattern is required for some features in the APM UI.'
    })
  };
};
exports.tutorialProvider = tutorialProvider;