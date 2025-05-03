"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataSourceConnectionValidator = void 0;
var _error = require("../lib/error");
var _data_sources = require("../../common/data_sources");
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

class DataSourceConnectionValidator {
  constructor(callDataCluster, dataSourceAttr) {
    this.callDataCluster = callDataCluster;
    this.dataSourceAttr = dataSourceAttr;
  }
  async validate() {
    try {
      var _this$dataSourceAttr$, _validationResponse4;
      let validationResponse;
      // Amazon OpenSearch Serverless does not support .info() API
      if (((_this$dataSourceAttr$ = this.dataSourceAttr.auth) === null || _this$dataSourceAttr$ === void 0 || (_this$dataSourceAttr$ = _this$dataSourceAttr$.credentials) === null || _this$dataSourceAttr$ === void 0 ? void 0 : _this$dataSourceAttr$.service) === _data_sources.SigV4ServiceName.OpenSearchServerless) {
        var _validationResponse;
        validationResponse = await this.callDataCluster.cat.indices();
        if (((_validationResponse = validationResponse) === null || _validationResponse === void 0 ? void 0 : _validationResponse.statusCode) === 200) {
          return validationResponse;
        }
      } else {
        var _validationResponse2, _validationResponse3;
        validationResponse = await this.callDataCluster.info();
        if (((_validationResponse2 = validationResponse) === null || _validationResponse2 === void 0 ? void 0 : _validationResponse2.statusCode) === 200 && (_validationResponse3 = validationResponse) !== null && _validationResponse3 !== void 0 && (_validationResponse3 = _validationResponse3.body) !== null && _validationResponse3 !== void 0 && _validationResponse3.cluster_name) {
          return validationResponse;
        }
      }
      throw new Error(JSON.stringify((_validationResponse4 = validationResponse) === null || _validationResponse4 === void 0 ? void 0 : _validationResponse4.body));
    } catch (e) {
      throw (0, _error.createDataSourceError)(e);
    }
  }
  async fetchDataSourceInfo() {
    const dataSourceInfo = {
      dataSourceVersion: '',
      dataSourceEngineType: _data_sources.DataSourceEngineType.NA
    };
    try {
      var _this$dataSourceAttr$2;
      // OpenSearch Serverless does not have version concept
      if (((_this$dataSourceAttr$2 = this.dataSourceAttr.auth) === null || _this$dataSourceAttr$2 === void 0 || (_this$dataSourceAttr$2 = _this$dataSourceAttr$2.credentials) === null || _this$dataSourceAttr$2 === void 0 ? void 0 : _this$dataSourceAttr$2.service) === _data_sources.SigV4ServiceName.OpenSearchServerless) {
        dataSourceInfo.dataSourceEngineType = _data_sources.DataSourceEngineType.OpenSearchServerless;
        return dataSourceInfo;
      }
      await this.callDataCluster.info().then(response => response.body).then(body => {
        dataSourceInfo.dataSourceVersion = body.version.number;
        if (body.version.distribution !== null && body.version.distribution !== undefined && body.version.distribution === 'opensearch') {
          dataSourceInfo.dataSourceEngineType = _data_sources.DataSourceEngineType.OpenSearch;
        } else {
          dataSourceInfo.dataSourceEngineType = _data_sources.DataSourceEngineType.Elasticsearch;
        }
      });
      return dataSourceInfo;
    } catch (e) {
      // return default dataSourceInfo instead of throwing exception in case info() api call fails
      return dataSourceInfo;
    }
  }
  async fetchInstalledPlugins() {
    const installedPlugins = new Set();
    try {
      var _this$dataSourceAttr$3;
      // TODO : retrieve installed plugins from OpenSearch Serverless datasource
      if (((_this$dataSourceAttr$3 = this.dataSourceAttr.auth) === null || _this$dataSourceAttr$3 === void 0 || (_this$dataSourceAttr$3 = _this$dataSourceAttr$3.credentials) === null || _this$dataSourceAttr$3 === void 0 ? void 0 : _this$dataSourceAttr$3.service) === _data_sources.SigV4ServiceName.OpenSearchServerless) {
        return installedPlugins;
      }
      await this.callDataCluster.cat.plugins({
        format: 'JSON',
        v: true
      }).then(response => response.body).then(body => {
        body.forEach(plugin => {
          installedPlugins.add(plugin.component);
        });
      });
      return installedPlugins;
    } catch (e) {
      // return empty installedPlugins instead of throwing exception in case cat.plugins() api call fails
      return installedPlugins;
    }
  }
}
exports.DataSourceConnectionValidator = DataSourceConnectionValidator;