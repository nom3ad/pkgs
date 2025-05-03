"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextDecoration = exports.TextAlignment = exports.Overflow = exports.FontWeight = exports.FontStyle = exports.BackgroundSize = exports.BackgroundRepeat = void 0;
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
 * Enum of supported CSS `background-repeat` properties.
 */
let BackgroundRepeat = exports.BackgroundRepeat = /*#__PURE__*/function (BackgroundRepeat) {
  BackgroundRepeat["REPEAT"] = "repeat";
  BackgroundRepeat["REPEAT_NO"] = "no-repeat";
  BackgroundRepeat["REPEAT_X"] = "repeat-x";
  BackgroundRepeat["REPEAT_Y"] = "repeat-y";
  BackgroundRepeat["ROUND"] = "round";
  BackgroundRepeat["SPACE"] = "space";
  return BackgroundRepeat;
}({});
/**
 * Enum of supported CSS `background-size` properties.
 */
let BackgroundSize = exports.BackgroundSize = /*#__PURE__*/function (BackgroundSize) {
  BackgroundSize["AUTO"] = "auto";
  BackgroundSize["CONTAIN"] = "contain";
  BackgroundSize["COVER"] = "cover";
  return BackgroundSize;
}({});
/**
 * Enum of supported CSS `font-style` properties.
 */
let FontStyle = exports.FontStyle = /*#__PURE__*/function (FontStyle) {
  FontStyle["ITALIC"] = "italic";
  FontStyle["NORMAL"] = "normal";
  return FontStyle;
}({});
/**
 * Enum of supported CSS `font-weight` properties.
 */
let FontWeight = exports.FontWeight = /*#__PURE__*/function (FontWeight) {
  FontWeight["NORMAL"] = "normal";
  FontWeight["BOLD"] = "bold";
  FontWeight["BOLDER"] = "bolder";
  FontWeight["LIGHTER"] = "lighter";
  FontWeight["ONE"] = "100";
  FontWeight["TWO"] = "200";
  FontWeight["THREE"] = "300";
  FontWeight["FOUR"] = "400";
  FontWeight["FIVE"] = "500";
  FontWeight["SIX"] = "600";
  FontWeight["SEVEN"] = "700";
  FontWeight["EIGHT"] = "800";
  FontWeight["NINE"] = "900";
  return FontWeight;
}({});
/**
 * Enum of supported CSS `overflow` properties.
 */
let Overflow = exports.Overflow = /*#__PURE__*/function (Overflow) {
  Overflow["AUTO"] = "auto";
  Overflow["HIDDEN"] = "hidden";
  Overflow["SCROLL"] = "scroll";
  Overflow["VISIBLE"] = "visible";
  return Overflow;
}({});
/**
 * Enum of supported CSS `text-align` properties.
 */
let TextAlignment = exports.TextAlignment = /*#__PURE__*/function (TextAlignment) {
  TextAlignment["CENTER"] = "center";
  TextAlignment["JUSTIFY"] = "justify";
  TextAlignment["LEFT"] = "left";
  TextAlignment["RIGHT"] = "right";
  return TextAlignment;
}({});
/**
 * Enum of supported CSS `text-decoration` properties.
 */
let TextDecoration = exports.TextDecoration = /*#__PURE__*/function (TextDecoration) {
  TextDecoration["NONE"] = "none";
  TextDecoration["UNDERLINE"] = "underline";
  return TextDecoration;
}({});
/**
 * Represents the various style properties that can be applied to an element.
 */
/**
 * Represents an object containing style information for a Container.
 */
/**
 * An object that represents style information, typically CSS.
 */