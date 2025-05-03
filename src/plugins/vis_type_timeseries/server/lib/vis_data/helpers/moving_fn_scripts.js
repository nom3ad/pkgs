"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MODEL_SCRIPTS = void 0;
var _model_options = require("../../../../common/model_options");
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

const MODEL_SCRIPTS = exports.MODEL_SCRIPTS = {
  [_model_options.MODEL_TYPES.UNWEIGHTED]: () => 'MovingFunctions.unweightedAvg(values)',
  [_model_options.MODEL_TYPES.WEIGHTED_EXPONENTIAL]: ({
    alpha
  }) => `MovingFunctions.ewma(values, ${alpha})`,
  [_model_options.MODEL_TYPES.WEIGHTED_EXPONENTIAL_DOUBLE]: ({
    alpha,
    beta
  }) => `MovingFunctions.holt(values, ${alpha}, ${beta})`,
  [_model_options.MODEL_TYPES.WEIGHTED_EXPONENTIAL_TRIPLE]: ({
    alpha,
    beta,
    gamma,
    period,
    multiplicative
  }) => `if (values.length > ${period}*2) {MovingFunctions.holtWinters(values, ${alpha}, ${beta}, ${gamma}, ${period}, ${multiplicative})}`,
  [_model_options.MODEL_TYPES.WEIGHTED_LINEAR]: () => 'MovingFunctions.linearWeightedAvg(values)'
};