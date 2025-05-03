"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.theme = void 0;
var _i18n = require("@osd/i18n");
var _lodash = require("lodash");
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

const theme = exports.theme = {
  name: 'theme',
  aliases: [],
  help: _i18n.i18n.translate('expressions.functions.themeHelpText', {
    defaultMessage: 'Reads a theme setting.'
  }),
  inputTypes: ['null'],
  args: {
    variable: {
      aliases: ['_'],
      help: _i18n.i18n.translate('expressions.functions.theme.args.variableHelpText', {
        defaultMessage: 'Name of the theme variable to read.'
      }),
      required: true,
      types: ['string']
    },
    default: {
      help: _i18n.i18n.translate('expressions.functions.theme.args.defaultHelpText', {
        defaultMessage: 'default value in case theming info is not available.'
      })
    }
  },
  fn: (input, args, handlers) => {
    // currently we use variable `theme`, but external theme service would be preferable
    const vars = handlers.variables.theme || {};
    return (0, _lodash.get)(vars, args.variable, args.default);
  }
};