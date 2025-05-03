"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decideLegacyClient = exports.decideClient = void 0;
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

// eslint-disable-next-line @osd/eslint/no-restricted-paths

const decideClient = async (context, request, withLongNumeralsSupport = false) => {
  const defaultOpenSearchClient = withLongNumeralsSupport ? context.core.opensearch.client.asCurrentUserWithLongNumeralsSupport : context.core.opensearch.client.asCurrentUser;
  return request.dataSourceId && context.dataSource ? await context.dataSource.opensearch.getClient(request.dataSourceId) : defaultOpenSearchClient;
};
exports.decideClient = decideClient;
const decideLegacyClient = async (context, request) => {
  const dataSourceId = request.query.data_source;
  return dataSourceId ? context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI : context.core.opensearch.legacy.client.callAsCurrentUser;
};
exports.decideLegacyClient = decideLegacyClient;