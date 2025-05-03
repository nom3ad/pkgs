"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _i18n = require("@osd/i18n");
var _alter = _interopRequireDefault(require("../lib/alter.js"));
var _chainable = _interopRequireDefault(require("../lib/classes/chainable"));
var _lodash = _interopRequireDefault(require("lodash"));
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

function unflatten(data) {
  if (Object(data) !== data || Array.isArray(data)) return data;
  const regex = new RegExp(/\.?([^.\[\]]+)|\[(\d+)\]/g);
  const result = {};
  _lodash.default.each(data, function (val, p) {
    let cur = result;
    let prop = '';
    let m;
    while (m = regex.exec(p)) {
      cur = cur.hasOwnProperty(prop) && cur[prop] || (cur[prop] = m[2] ? [] : {});
      prop = m[2] || m[1];
    }
    cur[prop] = data[p];
  });
  return result[''] || result;
}
var _default = exports.default = new _chainable.default('props', {
  args: [{
    name: 'inputSeries',
    types: ['seriesList']
  }, {
    name: 'global',
    types: ['boolean', 'null'],
    help: _i18n.i18n.translate('timeline.help.functions.props.args.globalHelpText', {
      defaultMessage: 'Set props on the seriesList vs on each series'
    })
  }],
  extended: {
    types: ['seriesList', 'number', 'string', 'boolean', 'null'],
    // Extended args can not currently be multivalued,
    // multi: false is not required and is shown here for demonstration purposes
    multi: false
  },
  // extended means you can pass arguments that aren't listed. They just won't be in the ordered array
  // They will be passed as args._extended:{}
  help: _i18n.i18n.translate('timeline.help.functions.propsHelpText', {
    defaultMessage: 'Use at your own risk, sets arbitrary properties on the series. For example {example}',
    values: {
      example: '.props(label=bears!)'
    }
  }),
  fn: function firstFn(args) {
    const properties = unflatten(_lodash.default.omit(args.byName, 'inputSeries', 'global'));
    if (args.byName.global) {
      _lodash.default.assign(args.byName.inputSeries, properties);
      return args.byName.inputSeries;
    } else {
      return (0, _alter.default)(args, function (eachSeries) {
        _lodash.default.assign(eachSeries, properties);
        return eachSeries;
      });
    }
  }
});
module.exports = exports.default;