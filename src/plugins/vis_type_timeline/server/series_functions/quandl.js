"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _i18n = require("@osd/i18n");
var _lodash = _interopRequireDefault(require("lodash"));
var _nodeFetch = _interopRequireDefault(require("node-fetch"));
var _moment = _interopRequireDefault(require("moment"));
var _datasource = _interopRequireDefault(require("../lib/classes/datasource"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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

_nodeFetch.default.Promise = require('bluebird');
var _default = exports.default = new _datasource.default('quandl', {
  dataSource: true,
  args: [{
    name: 'code',
    types: ['string', 'null'],
    help: _i18n.i18n.translate('timeline.help.functions.quandl.args.codeHelpText', {
      defaultMessage: 'The quandl code to plot. You can find these on quandl.com.'
    })
  }, {
    name: 'position',
    types: ['number', 'null'],
    help: _i18n.i18n.translate('timeline.help.functions.quandl.args.positionHelpText', {
      defaultMessage: 'Some quandl sources return multiple series, which one should I use? 1 based index.'
    })
  }],
  help: _i18n.i18n.translate('timeline.help.functions.quandlHelpText', {
    defaultMessage: `
    [experimental]
    Pull data from quandl.com using the quandl code. Set {quandlKeyField} to your free API key in OpenSearch Dashboards's
    Advanced Settings. The API has a really low rate limit without a key.`,
    values: {
      quandlKeyField: '"timeline:quandl.key"'
    }
  }),
  fn: function quandlFn(args, tlConfig) {
    const intervalMap = {
      '1d': 'daily',
      '1w': 'weekly',
      '1M': 'monthly',
      '1y': 'annual'
    };
    const config = _lodash.default.defaults(args.byName, {
      code: 'WIKI/AAPL',
      position: 1,
      interval: intervalMap[tlConfig.time.interval],
      apikey: tlConfig.settings['timeline:quandl.key']
    });
    if (!config.interval) {
      throw new Error(_i18n.i18n.translate('timeline.serverSideErrors.quandlFunction.unsupportedIntervalErrorMessage', {
        defaultMessage: 'quandl() unsupported interval: {interval}. quandl() supports: {intervals}',
        values: {
          interval: tlConfig.time.interval,
          intervals: _lodash.default.keys(intervalMap).join(', ')
        }
      }));
    }
    const time = {
      min: _moment.default.utc(tlConfig.time.from).format('YYYY-MM-DD'),
      max: _moment.default.utc(tlConfig.time.to).format('YYYY-MM-DD')
    };

    // POSITIONS
    // 1. open
    // 2. high
    // 3. low
    // 4. close
    // 5. volume

    const URL = 'https://www.quandl.com/api/v1/datasets/' + config.code + '.json' + '?sort_order=asc' + '&trim_start=' + time.min + '&trim_end=' + time.max + '&collapse=' + config.interval + '&auth_token=' + config.apikey;
    return (0, _nodeFetch.default)(URL).then(function (resp) {
      return resp.json();
    }).then(function (resp) {
      const data = _lodash.default.map(resp.data, function (bucket) {
        return [(0, _moment.default)(bucket[0]).valueOf(), bucket[config.position]];
      });
      return {
        type: 'seriesList',
        list: [{
          data: data,
          type: 'series',
          fit: 'nearest',
          label: resp.name
        }]
      };
    });
  }
});
module.exports = exports.default;