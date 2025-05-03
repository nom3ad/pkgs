"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createServer = createServer;
exports.defaultValidationErrorHandler = defaultValidationErrorHandler;
exports.getListenerOptions = getListenerOptions;
exports.getRedirectUrl = getRedirectUrl;
exports.getRequestId = getRequestId;
exports.getServerOptions = getServerOptions;
var _hapi = require("@hapi/hapi");
var _hoek = _interopRequireDefault(require("@hapi/hoek"));
var _uuid = _interopRequireDefault(require("uuid"));
var _prototype_pollution = require("./prototype_pollution");
var _utils = require("../utils");
var _utils2 = require("../../../core/utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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
 * Converts OpenSearch Dashboards `HttpConfig` into `ServerOptions` that are accepted by the Hapi server.
 */
function getServerOptions(config, {
  configureTLS = true
} = {}) {
  // Note that all connection options configured here should be exactly the same
  // as in the legacy platform server (see `src/legacy/server/http/index`). Any change
  // SHOULD BE applied in both places. The only exception is TLS-specific options,
  // that are configured only here.
  const options = {
    host: config.host,
    port: config.port,
    routes: {
      cache: {
        privacy: 'private',
        otherwise: 'private, no-cache, no-store, must-revalidate'
      },
      cors: config.cors,
      payload: {
        maxBytes: config.maxPayload.getValueInBytes()
      },
      validate: {
        failAction: defaultValidationErrorHandler,
        options: {
          abortEarly: false
        },
        // TODO: This payload validation can be removed once the legacy platform is completely removed.
        // This is a default payload validation which applies to all LP routes which do not specify their own
        // `validate.payload` handler, in order to reduce the likelyhood of prototype pollution vulnerabilities.
        // (All NP routes are already required to specify their own validation in order to access the payload)
        payload: value => Promise.resolve((0, _prototype_pollution.validateObject)(value))
      }
    },
    state: {
      strictHeader: false,
      isHttpOnly: true,
      isSameSite: false // necessary to allow using OpenSearch Dashboards inside an iframe
    }
  };

  if (configureTLS && config.ssl.enabled) {
    const ssl = config.ssl;

    // TODO: Hapi types have a typo in `tls` property type definition: `https.RequestOptions` is used instead of
    // `https.ServerOptions`, and `honorCipherOrder` isn't presented in `https.RequestOptions`.
    const tlsOptions = {
      ca: ssl.certificateAuthorities,
      cert: ssl.certificate,
      ciphers: config.ssl.cipherSuites.join(':'),
      // We use the server's cipher order rather than the client's to prevent the BEAST attack.
      honorCipherOrder: true,
      key: ssl.key,
      passphrase: ssl.keyPassphrase,
      secureOptions: ssl.getSecureOptions(),
      requestCert: ssl.requestCert,
      rejectUnauthorized: ssl.rejectUnauthorized
    };
    options.tls = tlsOptions;
  }
  return options;
}
function getListenerOptions(config) {
  return {
    keepaliveTimeout: config.keepaliveTimeout,
    socketTimeout: config.socketTimeout
  };
}
function createServer(serverOptions, listenerOptions) {
  const server = new _hapi.Server(serverOptions);

  // remove fix + test as soon as update node.js to v12.19 https://github.com/elastic/kibana/pull/61587
  server.listener.headersTimeout = listenerOptions.keepaliveTimeout + 2 * server.listener.headersTimeout;
  server.listener.keepAliveTimeout = listenerOptions.keepaliveTimeout;
  server.listener.setTimeout(listenerOptions.socketTimeout);
  server.listener.on('timeout', socket => {
    socket.destroy();
  });
  server.listener.on('clientError', (err, socket) => {
    if (socket.writable) {
      socket.end(Buffer.from('HTTP/1.1 400 Bad Request\r\n\r\n', 'ascii'));
    } else {
      socket.destroy(err);
    }
  });
  return server;
}

/**
 * Hapi extends the ValidationError interface to add this output key with more data.
 */

/**
 * Used to replicate Hapi v16 and below's validation responses. Should be used in the routes.validate.failAction key.
 */
function defaultValidationErrorHandler(request, h, err) {
  // Newer versions of Joi don't format the key for missing params the same way. This shim
  // provides backwards compatibility. Unfortunately, Joi doesn't export it's own Error class
  // in JS so we have to rely on the `name` key before we can cast it.
  //
  // The Hapi code we're 'overwriting' can be found here:
  //     https://github.com/hapijs/hapi/blob/master/lib/validation.js#L102
  if (err && err.name === 'ValidationError' && err.hasOwnProperty('output')) {
    const validationError = err;
    const validationKeys = [];
    validationError.details.forEach(detail => {
      if (detail.path.length > 0) {
        validationKeys.push(_hoek.default.escapeHtml(detail.path.join('.')));
      } else {
        // If no path, use the value sigil to signal the entire value had an issue.
        validationKeys.push('value');
      }
    });
    validationError.output.payload.validation.keys = validationKeys;
  }
  throw err;
}
function getRequestId(request, options) {
  var _request$raw$req$sock, _request$headers$xOp;
  return options.allowFromAnyIp ||
  // socket may be undefined in integration tests that connect via the http listener directly
  (_request$raw$req$sock = request.raw.req.socket) !== null && _request$raw$req$sock !== void 0 && _request$raw$req$sock.remoteAddress && options.ipAllowlist.includes(request.raw.req.socket.remoteAddress) ? (_request$headers$xOp = request.headers['x-opaque-id']) !== null && _request$headers$xOp !== void 0 ? _request$headers$xOp : _uuid.default.v4() : _uuid.default.v4();
}

/**
 * Return back the expected redirect url with basePath and conditional workspace id based on the request.
 * This method should be used when the request is not authenticated and need a redirect url after login.
 * And it should take care all the stuff on prepending required params into the path.
 * @param request Hapi request object
 * @returns the expected next url
 */
function getRedirectUrl(props) {
  const {
    request,
    nextUrl,
    basePath
  } = props;
  const workspaceState = (0, _utils.getWorkspaceState)(request);
  if (workspaceState.requestWorkspaceId) {
    return `${basePath}${_utils2.WORKSPACE_PATH_PREFIX}/${workspaceState.requestWorkspaceId}${nextUrl}`;
  }
  return `${basePath}${nextUrl}`;
}