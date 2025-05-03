"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _i18n = require("@osd/i18n");
var _alter = _interopRequireDefault(require("../lib/alter.js"));
var _to_milliseconds = require("../../common/lib/to_milliseconds");
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
var _default = exports.default = new _chainable.default('scale_interval', {
  args: [{
    name: 'inputSeries',
    types: ['seriesList']
  }, {
    name: 'interval',
    types: ['string'],
    help: _i18n.i18n.translate('timeline.help.functions.scaleInterval.args.intervalHelpText', {
      defaultMessage: 'The new interval in date math notation, e.g., 1s for 1 second. 1m, 5m, 1M, 1w, 1y, etc.'
    })
  }],
  help: _i18n.i18n.translate('timeline.help.functions.scaleIntervalHelpText', {
    defaultMessage: 'Changes scales a value (usually a sum or a count) to a new interval. For example, as a per-second rate'
  }),
  fn: function scaleIntervalFn(args, tlConfig) {
    const currentInterval = (0, _to_milliseconds.toMS)(tlConfig.time.interval);
    const scaleInterval = (0, _to_milliseconds.toMS)(args.byName.interval);
    return (0, _alter.default)(args, function (eachSeries) {
      const data = _lodash.default.map(eachSeries.data, function (point) {
        return [point[0], point[1] / currentInterval * scaleInterval];
      });
      eachSeries.data = data;
      return eachSeries;
    });
  }
});
module.exports = exports.default;