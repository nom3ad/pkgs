"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _i18n = require("@osd/i18n");
var _alter = _interopRequireDefault(require("../lib/alter.js"));
var _lodash = _interopRequireDefault(require("lodash"));
var _chainable = _interopRequireDefault(require("../lib/classes/chainable"));
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
var _default = exports.default = new _chainable.default('log', {
  args: [{
    name: 'inputSeries',
    types: ['seriesList']
  }, {
    name: 'base',
    types: ['number'],
    help: _i18n.i18n.translate('timeline.help.functions.log.args.baseHelpText', {
      defaultMessage: 'Set logarithmic base, 10 by default'
    })
  }],
  help: _i18n.i18n.translate('timeline.help.functions.logHelpText', {
    defaultMessage: 'Return the logarithm value of each value in the series list (default base: 10)'
  }),
  fn: function logFn(args) {
    const config = args.byName;
    return (0, _alter.default)(args, function (eachSeries) {
      const data = _lodash.default.map(eachSeries.data, function (point) {
        return [point[0], Math.log(point[1]) / Math.log(config.base || 10)];
      });
      eachSeries.data = data;
      return eachSeries;
    });
  }
});
module.exports = exports.default;