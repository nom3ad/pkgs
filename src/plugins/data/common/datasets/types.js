"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  DATA_STRUCTURE_META_TYPES: true
};
exports.DATA_STRUCTURE_META_TYPES = void 0;
var _structure_cache = require("./_structure_cache");
Object.keys(_structure_cache).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _structure_cache[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _structure_cache[key];
    }
  });
});
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Describes a data source with its properties.
 */
/**
 * Metadata for a data source, generic to allow for additional fields.
 */
/**
 * Represents the hierarchical structure of data within a data source.
 *
 * @example
 *
 * const openSearchCluster: DataStructure = {
 *   id: "b18e5f58-cf71-11ee-ad92-2468ce360004",
 *   title: "Data Cluster1",
 *   type: "DATA_SOURCE",
 *   children: [
 *     {
 *       id: "b18e5f58-cf71-11ee-ad92-2468ce360004::logs-2023.05",
 *       title: "logs-2023.05",
 *       type: "INDEX",
 *       parent: { id: "b18e5f58-cf71-11ee-ad92-2468ce360004", title: "Data Cluster1", type: "DATA_SOURCE" },
 *       meta: {
 *         type: 'FEATURE',
 *         icon: 'indexIcon',
 *         tooltip: 'Logs from May 2023'
 *       }
 *     },
 *     {
 *       id: "b18e5f58-cf71-11ee-ad92-2468ce360004::logs-2023.06",
 *       title: "logs-2023.06",
 *       type: "INDEX",
 *       parent: { id: "b18e5f58-cf71-11ee-ad92-2468ce360004", title: "Data Cluster1", type: "DATA_SOURCE" },
 *       meta: {
 *         type: 'FEATURE',
 *         icon: 'indexIcon',
 *         tooltip: 'Logs from June 2023'
 *       }
 *     }
 *   ],
 *   meta: {
 *     type: 'FEATURE',
 *     icon: 'clusterIcon',
 *     tooltip: 'OpenSearch Cluster'
 *   }
 * };
 *
 * Example of an S3 data source with a connection, database, and tables:
 *
 * const s3DataSource: DataStructure = {
 *   id: "7d5c3e1c-ae5f-11ee-9c91-1357bd240003",
 *   title: "Flint MDS cluster name",
 *   type: "DATA_SOURCE",
 *   children: [
 *     {
 *       id: "7d5c3e1c-ae5f-11ee-9c91-1357bd240003::mys3",
 *       title: "mys3",
 *       type: "CONNECTION",
 *       parent: { id: "7d5c3e1c-ae5f-11ee-9c91-1357bd240003", title: "Flint MDS cluster name", type: "DATA_SOURCE" },
 *       children: [
 *         {
 *           id: "7d5c3e1c-ae5f-11ee-9c91-1357bd240003::mys3.defaultDb",
 *           title: "defaultDb",
 *           type: "DATABASE",
 *           parent: { id: "7d5c3e1c-ae5f-11ee-9c91-1357bd240003::mys3", title: "mys3", type: "CONNECTION" },
 *           children: [
 *             {
 *               id: "7d5c3e1c-ae5f-11ee-9c91-1357bd240003::mys3.defaultDb.table1",
 *               title: "table1",
 *               type: "TABLE",
 *               parent: { id: "7d5c3e1c-ae5f-11ee-9c91-1357bd240003::mys3.defaultDb", title: "defaultDb", type: "DATABASE" }
 *             },
 *             {
 *               id: "7d5c3e1c-ae5f-11ee-9c91-1357bd240003::mys3.defaultDb.table2",
 *               title: "table2",
 *               type: "TABLE",
 *               parent: { id: "7d5c3e1c-ae5f-11ee-9c91-1357bd240003::mys3.defaultDb", title: "defaultDb", type: "DATABASE" }
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * };
 */
/**
 * DataStructureMeta types
 */
let DATA_STRUCTURE_META_TYPES = exports.DATA_STRUCTURE_META_TYPES = /*#__PURE__*/function (DATA_STRUCTURE_META_TYPES) {
  DATA_STRUCTURE_META_TYPES["FEATURE"] = "FEATURE";
  DATA_STRUCTURE_META_TYPES["TYPE"] = "TYPE";
  DATA_STRUCTURE_META_TYPES["CUSTOM"] = "CUSTOM";
  return DATA_STRUCTURE_META_TYPES;
}({});
/**
 * Metadata for a data structure, used for additional properties like icons or tooltips.
 */
/**
 * Metadata for dataset type
 */
/**
 * Metadata for a data structure with CUSTOM type, allowing any additional fields.
 */
/**
 * Union type for DataStructureMeta
 */
/**
 * Represents a cached version of DataStructure with string references instead of object references.
 *
 * @example
 *
 * const cachedOpenSearchCluster: CachedDataStructure = {
 *   id: "b18e5f58-cf71-11ee-ad92-2468ce360004",
 *   title: "Data Cluster1",
 *   type: "DATA_SOURCE",
 *   parent: "",
 *   children: [
 *     "b18e5f58-cf71-11ee-ad92-2468ce360004::logs-2023.05",
 *     "b18e5f58-cf71-11ee-ad92-2468ce360004::logs-2023.06"
 *   ]
 * };
 */
/**
 * Defines the structure of a dataset, including its type and reference to a data source.
 * NOTE: For non-index pattern datasets we will append the data source ID to the front of
 * the title of the dataset to ensure we do not have any conflicts. Many clusters could
 * have similar titles and the data plugin assumes unique data set IDs.
 *
 * @example
 * Example of a Dataset for an OpenSearch index pattern
 * const logsIndexDataset: Dataset = {
 *   id: "2e1b1b80-9c4d-11ee-8c90-0242ac120001",
 *   title: "logs-*",
 *   type: "INDEX_PATTERN",
 *   timeFieldName: "@timestamp",
 *   dataSource: {
 *     id: "2e1b1b80-9c4d-11ee-8c90-0242ac120001",
 *     title: "Cluster1",
 *     type: "OpenSearch"
 *   }
 * };
 *
 * @example
 * Example of a Dataset for an S3 table
 * const ordersTableDataset: Dataset = {
 *   id: "7d5c3e1c-ae5f-11ee-9c91-1357bd240003::mys3.defaultDb.table1",
 *   title: "mys3.defaultDb.table1",
 *   type: "S3",
 *   timeFieldName: "order_date",
 *   dataSource: {
 *     id: "7d5c3e1c-ae5f-11ee-9c91-1357bd240003",
 *     title: "My S3 Connect",
 *     type: "S3_GLUE"
 *   },
 * };
 */