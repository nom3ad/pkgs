"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "registerApplicationUsageCollector", {
  enumerable: true,
  get: function () {
    return _application_usage.registerApplicationUsageCollector;
  }
});
Object.defineProperty(exports, "registerCoreUsageCollector", {
  enumerable: true,
  get: function () {
    return _core.registerCoreUsageCollector;
  }
});
Object.defineProperty(exports, "registerCspCollector", {
  enumerable: true,
  get: function () {
    return _csp.registerCspCollector;
  }
});
Object.defineProperty(exports, "registerManagementUsageCollector", {
  enumerable: true,
  get: function () {
    return _management.registerManagementUsageCollector;
  }
});
Object.defineProperty(exports, "registerOpenSearchDashboardsUsageCollector", {
  enumerable: true,
  get: function () {
    return _opensearch_dashboards.registerOpenSearchDashboardsUsageCollector;
  }
});
Object.defineProperty(exports, "registerOpsStatsCollector", {
  enumerable: true,
  get: function () {
    return _ops_stats.registerOpsStatsCollector;
  }
});
Object.defineProperty(exports, "registerUiMetricUsageCollector", {
  enumerable: true,
  get: function () {
    return _ui_metric.registerUiMetricUsageCollector;
  }
});
var _ui_metric = require("./ui_metric");
var _management = require("./management");
var _application_usage = require("./application_usage");
var _opensearch_dashboards = require("./opensearch_dashboards");
var _ops_stats = require("./ops_stats");
var _csp = require("./csp");
var _core = require("./core");