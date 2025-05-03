"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SharedGlobalConfigKeys = void 0;
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
 * Dedicated type for plugin configuration schema.
 *
 * @public
 */

/**
 * Describes a plugin configuration properties.
 *
 * @example
 * ```typescript
 * // my_plugin/server/index.ts
 * import { schema, TypeOf } from '@osd/config-schema';
 * import { PluginConfigDescriptor } from 'opensearch_dashboards/server';
 *
 * const configSchema = schema.object({
 *   secret: schema.string({ defaultValue: 'Only on server' }),
 *   uiProp: schema.string({ defaultValue: 'Accessible from client' }),
 * });
 *
 * type ConfigType = TypeOf<typeof configSchema>;
 *
 * export const config: PluginConfigDescriptor<ConfigType> = {
 *   exposeToBrowser: {
 *     uiProp: true,
 *   },
 *   schema: configSchema,
 *   deprecations: ({ rename, unused }) => [
 *     rename('securityKey', 'secret'),
 *     unused('deprecatedProperty'),
 *   ],
 * };
 * ```
 *
 * @public
 */

/**
 * Dedicated type for plugin name/id that is supposed to make Map/Set/Arrays
 * that use it as a key or value more obvious.
 *
 * @public
 */

/** @public */

/** @public */

/** @internal */

/**
 * Describes the set of required and optional properties plugin can define in its
 * mandatory JSON manifest file.
 *
 * @remarks
 * Should never be used in code outside of Core but is exported for
 * documentation purposes.
 *
 * @public
 */

/**
 * Small container object used to expose information about discovered plugins that may
 * or may not have been started.
 * @public
 */

/**
 * @internal
 */

/**
 * The interface that should be returned by a `PluginInitializer`.
 *
 * @public
 */

const SharedGlobalConfigKeys = exports.SharedGlobalConfigKeys = {
  // We can add more if really needed
  opensearchDashboards: ['index', 'configIndex', 'autocompleteTerminateAfter', 'autocompleteTimeout', 'dashboardAdmin', 'futureNavigation'],
  opensearch: ['shardTimeout', 'requestTimeout', 'pingTimeout'],
  path: ['data'],
  savedObjects: ['maxImportPayloadBytes', 'permission']
};

/**
 * @public
 */

/**
 * Context that's available to plugins during initialization stage.
 *
 * @public
 */

/**
 * The `plugin` export at the root of a plugin's `server` directory should conform
 * to this interface.
 *
 * @public
 */