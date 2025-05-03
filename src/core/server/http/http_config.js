"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = exports.HttpConfig = void 0;
var _configSchema = require("@osd/config-schema");
var _os = require("os");
var _csp = require("../csp");
var _ssl_config = require("./ssl_config");
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
const validBasePathRegex = /^\/.*[^\/]$/;
const uuidRegexp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const match = (regex, errorMsg) => str => regex.test(str) ? undefined : errorMsg;

// before update to make sure it's in sync with validation rules in Legacy
// https://github.com/opensearch-project/OpenSearch-Dashboards/blob/main/src/legacy/server/config/schema.js
const config = exports.config = {
  path: 'server',
  schema: _configSchema.schema.object({
    name: _configSchema.schema.string({
      defaultValue: () => (0, _os.hostname)()
    }),
    autoListen: _configSchema.schema.boolean({
      defaultValue: true
    }),
    basePath: _configSchema.schema.maybe(_configSchema.schema.string({
      validate: match(validBasePathRegex, "must start with a slash, don't end with one")
    })),
    cors: _configSchema.schema.boolean({
      defaultValue: false
    }),
    customResponseHeaders: _configSchema.schema.recordOf(_configSchema.schema.string(), _configSchema.schema.any(), {
      defaultValue: {}
    }),
    host: _configSchema.schema.string({
      defaultValue: 'localhost',
      hostname: true
    }),
    maxPayload: _configSchema.schema.byteSize({
      defaultValue: '1048576b'
    }),
    port: _configSchema.schema.number({
      defaultValue: 5601
    }),
    rewriteBasePath: _configSchema.schema.boolean({
      defaultValue: false
    }),
    ssl: _ssl_config.sslSchema,
    keepaliveTimeout: _configSchema.schema.number({
      defaultValue: 120000
    }),
    socketTimeout: _configSchema.schema.number({
      defaultValue: 120000
    }),
    compression: _configSchema.schema.object({
      enabled: _configSchema.schema.boolean({
        defaultValue: true
      }),
      referrerWhitelist: _configSchema.schema.maybe(_configSchema.schema.arrayOf(_configSchema.schema.string({
        hostname: true
      }), {
        minSize: 1
      }))
    }),
    uuid: _configSchema.schema.maybe(_configSchema.schema.string({
      validate: match(uuidRegexp, 'must be a valid uuid')
    })),
    xsrf: _configSchema.schema.object({
      disableProtection: _configSchema.schema.boolean({
        defaultValue: false
      }),
      whitelist: _configSchema.schema.arrayOf(_configSchema.schema.string({
        validate: match(/^\//, 'must start with a slash')
      }), {
        defaultValue: []
      })
    }),
    requestId: _configSchema.schema.object({
      allowFromAnyIp: _configSchema.schema.boolean({
        defaultValue: false
      }),
      ipAllowlist: _configSchema.schema.arrayOf(_configSchema.schema.ip(), {
        defaultValue: []
      })
    }, {
      validate(value) {
        var _value$ipAllowlist;
        if (value.allowFromAnyIp === true && ((_value$ipAllowlist = value.ipAllowlist) === null || _value$ipAllowlist === void 0 ? void 0 : _value$ipAllowlist.length) > 0) {
          return `allowFromAnyIp must be set to 'false' if any values are specified in ipAllowlist`;
        }
      }
    })
  }, {
    validate: rawConfig => {
      if (!rawConfig.basePath && rawConfig.rewriteBasePath) {
        return 'cannot use [rewriteBasePath] when [basePath] is not specified';
      }
      if (!rawConfig.compression.enabled && rawConfig.compression.referrerWhitelist) {
        return 'cannot use [compression.referrerWhitelist] when [compression.enabled] is set to false';
      }
      if (rawConfig.ssl.enabled && rawConfig.ssl.redirectHttpFromPort !== undefined && rawConfig.ssl.redirectHttpFromPort === rawConfig.port) {
        return 'OpenSearch Dashboards does not accept http traffic to [port] when ssl is ' + 'enabled (only https is allowed), so [ssl.redirectHttpFromPort] ' + `cannot be configured to the same value. Both are [${rawConfig.port}].`;
      }
    }
  })
};
class HttpConfig {
  /**
   * @internal
   */
  constructor(rawHttpConfig, rawCspConfig) {
    var _rawHttpConfig$custom;
    _defineProperty(this, "name", void 0);
    _defineProperty(this, "autoListen", void 0);
    _defineProperty(this, "host", void 0);
    _defineProperty(this, "keepaliveTimeout", void 0);
    _defineProperty(this, "socketTimeout", void 0);
    _defineProperty(this, "port", void 0);
    _defineProperty(this, "cors", void 0);
    _defineProperty(this, "customResponseHeaders", void 0);
    _defineProperty(this, "maxPayload", void 0);
    _defineProperty(this, "basePath", void 0);
    _defineProperty(this, "rewriteBasePath", void 0);
    _defineProperty(this, "ssl", void 0);
    _defineProperty(this, "compression", void 0);
    _defineProperty(this, "csp", void 0);
    _defineProperty(this, "xsrf", void 0);
    _defineProperty(this, "requestId", void 0);
    this.autoListen = rawHttpConfig.autoListen;
    this.host = rawHttpConfig.host;
    this.port = rawHttpConfig.port;
    this.cors = rawHttpConfig.cors;
    this.customResponseHeaders = Object.entries((_rawHttpConfig$custom = rawHttpConfig.customResponseHeaders) !== null && _rawHttpConfig$custom !== void 0 ? _rawHttpConfig$custom : {}).reduce((headers, [key, value]) => {
      return {
        ...headers,
        [key]: Array.isArray(value) ? value.map(e => convertHeader(e)) : convertHeader(value)
      };
    }, {});
    this.maxPayload = rawHttpConfig.maxPayload;
    this.name = rawHttpConfig.name;
    this.basePath = rawHttpConfig.basePath;
    this.keepaliveTimeout = rawHttpConfig.keepaliveTimeout;
    this.socketTimeout = rawHttpConfig.socketTimeout;
    this.rewriteBasePath = rawHttpConfig.rewriteBasePath;
    this.ssl = new _ssl_config.SslConfig(rawHttpConfig.ssl || {});
    this.compression = rawHttpConfig.compression;
    this.csp = new _csp.CspConfig(rawCspConfig);
    this.xsrf = rawHttpConfig.xsrf;
    this.requestId = rawHttpConfig.requestId;
  }
}
exports.HttpConfig = HttpConfig;
const convertHeader = entry => {
  return typeof entry === 'object' ? JSON.stringify(entry) : String(entry);
};