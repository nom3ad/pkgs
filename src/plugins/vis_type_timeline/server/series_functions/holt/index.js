"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _i18n = require("@osd/i18n");
var _lodash = _interopRequireDefault(require("lodash"));
var _chainable = _interopRequireDefault(require("../../lib/classes/chainable"));
var _ses = _interopRequireDefault(require("./lib/ses"));
var _des = _interopRequireDefault(require("./lib/des"));
var _tes = _interopRequireDefault(require("./lib/tes"));
var _to_milliseconds = require("../../../common/lib/to_milliseconds");
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
var _default = exports.default = new _chainable.default('holt', {
  args: [{
    name: 'inputSeries',
    types: ['seriesList']
  }, {
    name: 'alpha',
    types: ['number'],
    help: _i18n.i18n.translate('timeline.help.functions.holt.args.alphaHelpText', {
      defaultMessage: `
        Smoothing weight from 0 to 1.
        Increasing alpha will make the new series more closely follow the original.
        Lowering it will make the series smoother`
    })
  }, {
    name: 'beta',
    types: ['number'],
    help: _i18n.i18n.translate('timeline.help.functions.holt.args.betaHelpText', {
      defaultMessage: `
        Trending weight from 0 to 1.
        Increasing beta will make rising/falling lines continue to rise/fall longer.
        Lowering it will make the function learn the new trend faster`
    })
  }, {
    name: 'gamma',
    types: ['number'],
    help: _i18n.i18n.translate('timeline.help.functions.holt.args.gammaHelpText', {
      defaultMessage: `
        Seasonal weight from 0 to 1. Does your data look like a wave?
        Increasing this will give recent seasons more importance, thus changing the wave form faster.
        Lowering it will reduce the importance of new seasons, making history more important.
        `
    })
  }, {
    name: 'season',
    types: ['string'],
    help: _i18n.i18n.translate('timeline.help.functions.holt.args.seasonHelpText', {
      defaultMessage: 'How long is the season, e.g., 1w if your pattern repeats weekly. (Only useful with gamma)',
      description: '"1w" is an expression value and should not be translated. "gamma" is a parameter name and should not be translated.'
    })
  }, {
    name: 'sample',
    types: ['number', 'null'],
    help: _i18n.i18n.translate('timeline.help.functions.holt.args.sampleHelpText', {
      defaultMessage: `
      The number of seasons to sample before starting to "predict" in a seasonal series.
      (Only useful with gamma, Default: all)`,
      description: '"gamma" and "all" are parameter names and values and must not be translated.'
    })
  }],
  help: _i18n.i18n.translate('timeline.help.functions.holtHelpText', {
    defaultMessage: `
    Sample the beginning of a series and use it to forecast what should happen
    via several optional parameters. In general, this doesn't really predict the
    future, but predicts what should be happening right now according to past data,
    which can be useful for anomaly detection. Note that nulls will be filled with forecasted values.`,
    description: '"null" is a data value here and must not be translated.'
  }),
  fn: function expsmoothFn(args, tlConfig) {
    const newSeries = _lodash.default.cloneDeep(args.byName.inputSeries);
    const alpha = args.byName.alpha;
    const beta = args.byName.beta;
    const gamma = args.byName.gamma;
    _lodash.default.each(newSeries.list, function (series) {
      const sample = args.byName.sample || series.data.length; // If we use length it should simply never predict

      // Single exponential smoothing
      // This is basically a weighted moving average in which the older
      // points exponentially degrade relative to the alpha, e.g.:
      // 0.8^1, 0.8^2, 0.8^3, etc

      const times = _lodash.default.map(series.data, 0);
      let points = _lodash.default.map(series.data, 1);
      if (alpha != null && beta == null && gamma == null) {
        points = (0, _ses.default)(points, alpha);
      }
      if (alpha != null && beta != null && gamma == null) {
        points = (0, _des.default)(points, alpha, beta);
      }
      if (alpha != null && beta != null && gamma != null) {
        if (!sample || !args.byName.season || sample < 2) {
          throw new Error(_i18n.i18n.translate('timeline.serverSideErrors.holtFunction.missingParamsErrorMessage', {
            defaultMessage: 'Must specify a season length and a sample size >= 2'
          }));
        }
        const season = Math.round((0, _to_milliseconds.toMS)(args.byName.season) / (0, _to_milliseconds.toMS)(tlConfig.time.interval));
        points = (0, _tes.default)(points, alpha, beta, gamma, season, sample);
      }
      _lodash.default.assign(series.data, _lodash.default.zip(times, points));
    });
    return newSeries;
  }
});
module.exports = exports.default;