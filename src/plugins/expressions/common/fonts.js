"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.palatino = exports.optima = exports.openSans = exports.myriad = exports.lucidaGrande = exports.hoeflerText = exports.helveticaNeue = exports.gillSans = exports.futura = exports.fonts = exports.didot = exports.chalkboard = exports.brushScript = exports.bookAntiqua = exports.baskerville = exports.arial = exports.americanTypewriter = void 0;
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

/**
 * This type contains a unions of all supported font labels, or the name of
 * the font the user would see in a UI.
 */

/**
 * This type contains a union of all supported font values, equivalent to the CSS
 * `font-value` property.
 */

/**
 * An interface representing a font in Canvas, with a textual label and the CSS
 * `font-value`.
 */

// This function allows one to create a strongly-typed font for inclusion in
// the font collection.  As a result, the values and labels are known to the
// type system, preventing one from specifying a non-existent font at build
// time.
function createFont(font) {
  return font;
}
const americanTypewriter = exports.americanTypewriter = createFont({
  label: 'American Typewriter',
  value: "'American Typewriter', 'Courier New', Courier, Monaco, mono"
});
const arial = exports.arial = createFont({
  label: 'Arial',
  value: 'Arial, sans-serif'
});
const baskerville = exports.baskerville = createFont({
  label: 'Baskerville',
  value: "Baskerville, Georgia, Garamond, 'Times New Roman', Times, serif"
});
const bookAntiqua = exports.bookAntiqua = createFont({
  label: 'Book Antiqua',
  value: "'Book Antiqua', Georgia, Garamond, 'Times New Roman', Times, serif"
});
const brushScript = exports.brushScript = createFont({
  label: 'Brush Script',
  value: "'Brush Script MT', 'Comic Sans', sans-serif"
});
const chalkboard = exports.chalkboard = createFont({
  label: 'Chalkboard',
  value: "Chalkboard, 'Comic Sans', sans-serif"
});
const didot = exports.didot = createFont({
  label: 'Didot',
  value: "Didot, Georgia, Garamond, 'Times New Roman', Times, serif"
});
const futura = exports.futura = createFont({
  label: 'Futura',
  value: 'Futura, Impact, Helvetica, Arial, sans-serif'
});
const gillSans = exports.gillSans = createFont({
  label: 'Gill Sans',
  value: "'Gill Sans', 'Lucida Grande', 'Lucida Sans Unicode', Verdana, Helvetica, Arial, sans-serif"
});
const helveticaNeue = exports.helveticaNeue = createFont({
  label: 'Helvetica Neue',
  value: "'Helvetica Neue', Helvetica, Arial, sans-serif"
});
const hoeflerText = exports.hoeflerText = createFont({
  label: 'Hoefler Text',
  value: "'Hoefler Text', Garamond, Georgia, 'Times New Roman', Times, serif"
});
const lucidaGrande = exports.lucidaGrande = createFont({
  label: 'Lucida Grande',
  value: "'Lucida Grande', 'Lucida Sans Unicode', Lucida, Verdana, Helvetica, Arial, sans-serif"
});
const myriad = exports.myriad = createFont({
  label: 'Myriad',
  value: 'Myriad, Helvetica, Arial, sans-serif'
});
const openSans = exports.openSans = createFont({
  label: 'Open Sans',
  value: "'Open Sans', Helvetica, Arial, sans-serif"
});
const optima = exports.optima = createFont({
  label: 'Optima',
  value: "Optima, 'Lucida Grande', 'Lucida Sans Unicode', Verdana, Helvetica, Arial, sans-serif"
});
const palatino = exports.palatino = createFont({
  label: 'Palatino',
  value: "Palatino, 'Book Antiqua', Georgia, Garamond, 'Times New Roman', Times, serif"
});

/**
 * A collection of supported fonts.
 */
const fonts = exports.fonts = [americanTypewriter, arial, baskerville, bookAntiqua, brushScript, chalkboard, didot, futura, gillSans, helveticaNeue, hoeflerText, lucidaGrande, myriad, openSans, optima, palatino];