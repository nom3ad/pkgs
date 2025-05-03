"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ROLL_TOTAL_INDICES_INTERVAL = exports.ROLL_INDICES_START = exports.ROLL_DAILY_INDICES_INTERVAL = void 0;
exports.registerApplicationUsageCollector = registerApplicationUsageCollector;
var _moment = _interopRequireDefault(require("moment"));
var _rxjs = require("rxjs");
var _saved_objects_types = require("./saved_objects_types");
var _schema = require("./schema");
var _rollups = require("./rollups");
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

/**
 * Roll total indices every 24h
 */
const ROLL_TOTAL_INDICES_INTERVAL = exports.ROLL_TOTAL_INDICES_INTERVAL = 24 * 60 * 60 * 1000;

/**
 * Roll daily indices every 30 minutes.
 * This means that, assuming a user can visit all the 44 apps we can possibly report
 * in the 3 minutes interval the browser reports to the server, up to 22 users can have the same
 * behaviour and we wouldn't need to paginate in the transactional documents (less than 10k docs).
 *
 * Based on a more normal expected use case, the users could visit up to 5 apps in those 3 minutes,
 * allowing up to 200 users before reaching the limit.
 */
const ROLL_DAILY_INDICES_INTERVAL = exports.ROLL_DAILY_INDICES_INTERVAL = 30 * 60 * 1000;

/**
 * Start rolling indices after 5 minutes up
 */
const ROLL_INDICES_START = exports.ROLL_INDICES_START = 5 * 60 * 1000;
function registerApplicationUsageCollector(logger, usageCollection, registerType, getSavedObjectsClient) {
  (0, _saved_objects_types.registerMappings)(registerType);
  const collector = usageCollection.makeUsageCollector({
    type: 'application_usage',
    isReady: () => typeof getSavedObjectsClient() !== 'undefined',
    schema: _schema.applicationUsageSchema,
    fetch: async () => {
      const savedObjectsClient = getSavedObjectsClient();
      if (typeof savedObjectsClient === 'undefined') {
        return;
      }
      const [{
        saved_objects: rawApplicationUsageTotals
      }, {
        saved_objects: rawApplicationUsageDaily
      }, {
        saved_objects: rawApplicationUsageTransactional
      }] = await Promise.all([savedObjectsClient.find({
        type: _saved_objects_types.SAVED_OBJECTS_TOTAL_TYPE,
        perPage: 10000 // We only have 44 apps for now. This limit is OK.
      }), savedObjectsClient.find({
        type: _saved_objects_types.SAVED_OBJECTS_DAILY_TYPE,
        perPage: 10000 // We can have up to 44 apps * 91 days = 4004 docs. This limit is OK
      }), savedObjectsClient.find({
        type: _saved_objects_types.SAVED_OBJECTS_TRANSACTIONAL_TYPE,
        perPage: 10000 // If we have more than those, we won't report the rest (they'll be rolled up to the daily soon enough to become a problem)
      })]);

      const applicationUsageFromTotals = rawApplicationUsageTotals.reduce((acc, {
        attributes: {
          appId,
          minutesOnScreen,
          numberOfClicks
        }
      }) => {
        const existing = acc[appId] || {
          clicks_total: 0,
          minutes_on_screen_total: 0
        };
        return {
          ...acc,
          [appId]: {
            clicks_total: numberOfClicks + existing.clicks_total,
            clicks_7_days: 0,
            clicks_30_days: 0,
            clicks_90_days: 0,
            minutes_on_screen_total: minutesOnScreen + existing.minutes_on_screen_total,
            minutes_on_screen_7_days: 0,
            minutes_on_screen_30_days: 0,
            minutes_on_screen_90_days: 0
          }
        };
      }, {});
      const nowMinus7 = (0, _moment.default)().subtract(7, 'days');
      const nowMinus30 = (0, _moment.default)().subtract(30, 'days');
      const nowMinus90 = (0, _moment.default)().subtract(90, 'days');
      const applicationUsage = [...rawApplicationUsageDaily, ...rawApplicationUsageTransactional].reduce((acc, {
        attributes: {
          appId,
          minutesOnScreen,
          numberOfClicks,
          timestamp
        }
      }) => {
        const existing = acc[appId] || {
          clicks_total: 0,
          clicks_7_days: 0,
          clicks_30_days: 0,
          clicks_90_days: 0,
          minutes_on_screen_total: 0,
          minutes_on_screen_7_days: 0,
          minutes_on_screen_30_days: 0,
          minutes_on_screen_90_days: 0
        };
        const timeOfEntry = (0, _moment.default)(timestamp);
        const isInLast7Days = timeOfEntry.isSameOrAfter(nowMinus7);
        const isInLast30Days = timeOfEntry.isSameOrAfter(nowMinus30);
        const isInLast90Days = timeOfEntry.isSameOrAfter(nowMinus90);
        const last7Days = {
          clicks_7_days: existing.clicks_7_days + numberOfClicks,
          minutes_on_screen_7_days: existing.minutes_on_screen_7_days + minutesOnScreen
        };
        const last30Days = {
          clicks_30_days: existing.clicks_30_days + numberOfClicks,
          minutes_on_screen_30_days: existing.minutes_on_screen_30_days + minutesOnScreen
        };
        const last90Days = {
          clicks_90_days: existing.clicks_90_days + numberOfClicks,
          minutes_on_screen_90_days: existing.minutes_on_screen_90_days + minutesOnScreen
        };
        return {
          ...acc,
          [appId]: {
            ...existing,
            clicks_total: existing.clicks_total + numberOfClicks,
            minutes_on_screen_total: existing.minutes_on_screen_total + minutesOnScreen,
            ...(isInLast7Days ? last7Days : {}),
            ...(isInLast30Days ? last30Days : {}),
            ...(isInLast90Days ? last90Days : {})
          }
        };
      }, applicationUsageFromTotals);
      return applicationUsage;
    }
  });
  usageCollection.registerCollector(collector);
  (0, _rxjs.timer)(ROLL_INDICES_START, ROLL_DAILY_INDICES_INTERVAL).subscribe(() => (0, _rollups.rollDailyData)(logger, getSavedObjectsClient()));
  (0, _rxjs.timer)(ROLL_INDICES_START, ROLL_TOTAL_INDICES_INTERVAL).subscribe(() => (0, _rollups.rollTotals)(logger, getSavedObjectsClient()));
}