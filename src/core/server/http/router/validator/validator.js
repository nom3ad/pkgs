"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RouteValidator = void 0;
var _configSchema = require("@osd/config-schema");
var _stream = require("stream");
var _validator_error = require("./validator_error");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
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
/**
 * Validation result factory to be used in the custom validation function to return the valid data or validation errors
 *
 * See {@link RouteValidationFunction}.
 *
 * @public
 */

/**
 * The custom validation function if @osd/config-schema is not a valid solution for your specific plugin requirements.
 *
 * @example
 *
 * The validation should look something like:
 * ```typescript
 * interface MyExpectedBody {
 *   bar: string;
 *   baz: number;
 * }
 *
 * const myBodyValidation: RouteValidationFunction<MyExpectedBody> = (data, validationResult) => {
 *   const { ok, badRequest } = validationResult;
 *   const { bar, baz } = data || {};
 *   if (typeof bar === 'string' && typeof baz === 'number') {
 *     return ok({ bar, baz });
 *   } else {
 *     return badRequest('Wrong payload', ['body']);
 *   }
 * }
 * ```
 *
 * @public
 */

/**
 * Allowed property validation options: either @osd/config-schema validations or custom validation functions
 *
 * See {@link RouteValidationFunction} for custom validation.
 *
 * @public
 */

// Ugly as hell but we need this conditional typing to have proper type inference

/**
 * The configuration object to the RouteValidator class.
 * Set `params`, `query` and/or `body` to specify the validation logic to follow for that property.
 *
 * @public
 */

/**
 * Additional options for the RouteValidator class to modify its default behaviour.
 *
 * @public
 */

/**
 * Route validations config and options merged into one object
 * @public
 */

/**
 * Route validator class to define the validation logic for each new route.
 *
 * @internal
 */
class RouteValidator {
  static from(opts) {
    if (opts instanceof RouteValidator) {
      return opts;
    }
    const {
      params,
      query,
      body,
      ...options
    } = opts;
    return new RouteValidator({
      params,
      query,
      body
    }, options);
  }
  constructor(config, options = {}) {
    this.config = config;
    this.options = options;
  }

  /**
   * Get validated URL params
   * @internal
   */
  getParams(data, namespace) {
    var _this$options$unsafe;
    return this.validate(this.config.params, (_this$options$unsafe = this.options.unsafe) === null || _this$options$unsafe === void 0 ? void 0 : _this$options$unsafe.params, data, namespace);
  }

  /**
   * Get validated query params
   * @internal
   */
  getQuery(data, namespace) {
    var _this$options$unsafe2;
    return this.validate(this.config.query, (_this$options$unsafe2 = this.options.unsafe) === null || _this$options$unsafe2 === void 0 ? void 0 : _this$options$unsafe2.query, data, namespace);
  }

  /**
   * Get validated body
   * @internal
   */
  getBody(data, namespace) {
    var _this$options$unsafe3;
    return this.validate(this.config.body, (_this$options$unsafe3 = this.options.unsafe) === null || _this$options$unsafe3 === void 0 ? void 0 : _this$options$unsafe3.body, data, namespace);
  }

  /**
   * Has body validation
   * @internal
   */
  hasBody() {
    return typeof this.config.body !== 'undefined';
  }
  validate(validationRule, unsafe, data, namespace) {
    if (typeof validationRule === 'undefined') {
      return {};
    }
    let precheckedData = this.preValidateSchema(data).validate(data, {}, namespace);
    if (unsafe !== true) {
      precheckedData = this.safetyPrechecks(precheckedData, namespace);
    }
    const customCheckedData = this.customValidation(validationRule, precheckedData, namespace);
    if (unsafe === true) {
      return customCheckedData;
    }
    return this.safetyPostchecks(customCheckedData, namespace);
  }
  safetyPrechecks(data, namespace) {
    // We can add any pre-validation safety logic in here
    return data;
  }
  safetyPostchecks(data, namespace) {
    // We can add any post-validation safety logic in here
    return data;
  }
  customValidation(validationRule, data, namespace) {
    if ((0, _configSchema.isConfigSchema)(validationRule)) {
      return validationRule.validate(data, {}, namespace);
    } else if (typeof validationRule === 'function') {
      return this.validateFunction(validationRule, data, namespace);
    } else {
      throw new _configSchema.ValidationError(new _validator_error.RouteValidationError(`The validation rule provided in the handler is not valid`), namespace);
    }
  }
  validateFunction(validateFn, data, namespace) {
    let result;
    try {
      result = validateFn(data, RouteValidator.ResultFactory);
    } catch (err) {
      result = {
        error: new _validator_error.RouteValidationError(err)
      };
    }
    if (result.error) {
      throw new _configSchema.ValidationError(result.error, namespace);
    }
    return result.value;
  }
  preValidateSchema(data) {
    if (Buffer.isBuffer(data)) {
      // if options.body.parse !== true
      return _configSchema.schema.buffer();
    } else if (data instanceof _stream.Stream) {
      // if options.body.output === 'stream'
      return _configSchema.schema.stream();
    } else {
      return _configSchema.schema.maybe(_configSchema.schema.nullable(_configSchema.schema.any({})));
    }
  }
}
exports.RouteValidator = RouteValidator;
_defineProperty(RouteValidator, "ResultFactory", {
  ok: value => ({
    value
  }),
  badRequest: (error, path) => ({
    error: new _validator_error.RouteValidationError(error, path)
  })
});