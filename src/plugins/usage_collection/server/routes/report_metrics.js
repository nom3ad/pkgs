"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerUiMetricRoute = registerUiMetricRoute;
var _configSchema = require("@osd/config-schema");
var _report = require("../report");
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

function registerUiMetricRoute(router, getSavedObjects, batchingInterval) {
  let batchReport = {
    report: {},
    startTimestamp: 0
  };
  const batchingIntervalInMs = batchingInterval * 1000;
  router.post({
    path: '/api/ui_metric/report',
    validate: {
      body: _configSchema.schema.object({
        report: _report.reportSchema
      })
    }
  }, async (context, req, res) => {
    const {
      report
    } = req.body;
    try {
      const currTime = Date.now();

      // Add the current report to batchReport
      batchReport.report = combineReports(report, batchReport.report);
      // If the time duration since the batchReport startTime is greater than batchInterval then write it to the savedObject
      if (currTime - batchReport.startTimestamp >= batchingIntervalInMs) {
        const prevReport = batchReport;
        batchReport = {
          report: {},
          startTimestamp: currTime
        }; // reseting the batchReport and updating the startTimestamp to current TimeStamp

        if (prevReport) {
          // Write the previously batched Report to the saved object
          const internalRepository = getSavedObjects();
          if (!internalRepository) {
            throw Error(`The saved objects client hasn't been initialised yet`);
          }
          await (0, _report.storeReport)(internalRepository, prevReport.report);
        }
      }
      return res.ok({
        body: {
          status: 'ok'
        }
      });
    } catch (error) {
      return res.ok({
        body: {
          status: 'fail'
        }
      });
    }
  });
}
function combineReports(report1, report2) {
  // Combines report2 onto the report1 and returns the updated report1

  // Combining User Agents
  const combinedUserAgent = {
    ...report2.userAgent,
    ...report1.userAgent
  };

  // Combining UI metrics
  const combinedUIMetric = {
    ...report1.uiStatsMetrics
  };
  if (report2.uiStatsMetrics !== undefined) {
    for (const key of Object.keys(report2.uiStatsMetrics)) {
      var _report2$uiStatsMetri, _report1$uiStatsMetri;
      if (((_report2$uiStatsMetri = report2.uiStatsMetrics[key]) === null || _report2$uiStatsMetri === void 0 || (_report2$uiStatsMetri = _report2$uiStatsMetri.stats) === null || _report2$uiStatsMetri === void 0 ? void 0 : _report2$uiStatsMetri.sum) === undefined) {
        continue;
      } else if (((_report1$uiStatsMetri = report1.uiStatsMetrics) === null || _report1$uiStatsMetri === void 0 ? void 0 : _report1$uiStatsMetri[key]) === undefined) {
        combinedUIMetric[key] = report2.uiStatsMetrics[key];
      } else {
        const {
          stats,
          ...rest
        } = combinedUIMetric[key];
        const combinedStats = {
          ...stats
        };
        combinedStats.sum += report2.uiStatsMetrics[key].stats.sum; // Updating the sum since it is field we will be using to update the saved Object
        combinedUIMetric[key] = {
          ...rest,
          stats: combinedStats
        };
      }
    }
  }

  // Combining Application Usage
  const combinedApplicationUsage = {
    ...report1.application_usage
  };
  if (report2.application_usage !== undefined) {
    for (const key of Object.keys(report2.application_usage)) {
      var _report2$application_, _report2$application_2, _report1$application_;
      if (((_report2$application_ = report2.application_usage[key]) === null || _report2$application_ === void 0 ? void 0 : _report2$application_.numberOfClicks) === undefined || ((_report2$application_2 = report2.application_usage[key]) === null || _report2$application_2 === void 0 ? void 0 : _report2$application_2.minutesOnScreen) === undefined) {
        continue;
      } else if (((_report1$application_ = report1.application_usage) === null || _report1$application_ === void 0 ? void 0 : _report1$application_[key]) === undefined) {
        combinedApplicationUsage[key] = report2.application_usage[key];
      } else {
        var _report2$application_3, _report2$application_4;
        const combinedUsage = {
          ...combinedApplicationUsage[key]
        };
        combinedUsage.numberOfClicks += ((_report2$application_3 = report2.application_usage[key]) === null || _report2$application_3 === void 0 ? void 0 : _report2$application_3.numberOfClicks) || 0;
        combinedUsage.minutesOnScreen += ((_report2$application_4 = report2.application_usage[key]) === null || _report2$application_4 === void 0 ? void 0 : _report2$application_4.minutesOnScreen) || 0;
        combinedApplicationUsage[key] = combinedUsage;
      }
    }
  }
  return {
    reportVersion: report1.reportVersion,
    userAgent: combinedUserAgent,
    uiStatsMetrics: combinedUIMetric,
    application_usage: combinedApplicationUsage
  };
}