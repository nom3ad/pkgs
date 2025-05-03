"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DQLSyntaxError = void 0;
var _lodash = require("lodash");
var _i18n = require("@osd/i18n");
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
const endOfInputText = _i18n.i18n.translate('data.common.dql.errors.endOfInputText', {
  defaultMessage: 'end of input'
});
const grammarRuleTranslations = {
  fieldName: _i18n.i18n.translate('data.common.dql.errors.fieldNameText', {
    defaultMessage: 'field name'
  }),
  value: _i18n.i18n.translate('data.common.dql.errors.valueText', {
    defaultMessage: 'value'
  }),
  literal: _i18n.i18n.translate('data.common.dql.errors.literalText', {
    defaultMessage: 'literal'
  }),
  whitespace: _i18n.i18n.translate('data.common.dql.errors.whitespaceText', {
    defaultMessage: 'whitespace'
  })
};
class DQLSyntaxError extends Error {
  constructor(error, expression) {
    let message = error.message;
    if (error.expected) {
      const translatedExpectations = error.expected.map(expected => {
        return grammarRuleTranslations[expected.description] || expected.description;
      });
      const translatedExpectationText = translatedExpectations.join(', ');
      message = _i18n.i18n.translate('data.common.dql.errors.syntaxError', {
        defaultMessage: 'Expected {expectedList} but {foundInput} found.',
        values: {
          expectedList: translatedExpectationText,
          foundInput: error.found ? `"${error.found}"` : endOfInputText
        }
      });
    }
    const fullMessage = [message, expression, (0, _lodash.repeat)('-', error.location.start.offset) + '^'].join('\n');
    super(fullMessage);
    _defineProperty(this, "shortMessage", void 0);
    this.name = 'DQLSyntaxError';
    this.shortMessage = message;
  }
}
exports.DQLSyntaxError = DQLSyntaxError;