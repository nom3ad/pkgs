"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isGeoPoint = exports.getTimeField = exports.getFieldType = exports.formatTimePickerDate = exports.dataFrameToSpec = exports.createDataFrame = exports.convertResult = void 0;
var _datemath = _interopRequireDefault(require("@opensearch/datemath"));
var _types = require("./types");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Converts the data frame response to a search response.
 * This function is used to convert the data frame response to a search response
 * to be used by the rest of the application.
 *
 * @param response - data frame response object
 * @returns converted search response
 */
const convertResult = response => {
  const body = response.body;
  if (body.hasOwnProperty('error')) {
    return response;
  }
  const data = body;
  const hits = [];
  const searchResponse = {
    took: response.took,
    timed_out: false,
    _shards: {
      total: 1,
      successful: 1,
      skipped: 0,
      failed: 0
    },
    hits: {
      total: 0,
      max_score: 0,
      hits: []
    }
  };
  if (data && data.fields && data.fields.length > 0) {
    for (let index = 0; index < data.size; index++) {
      const hit = {};
      data.fields.forEach(field => {
        hit[field.name] = field.values[index];
      });
      hits.push({
        _index: data.name,
        _source: hit
      });
    }
  }
  searchResponse.hits.hits = hits;
  if (data.hasOwnProperty('aggs')) {
    const dataWithAggs = data;
    if (!dataWithAggs.aggs) {
      return searchResponse;
    }
    searchResponse.aggregations = {};
    const aggConfig = dataWithAggs.meta;
    Object.entries(dataWithAggs.aggs).forEach(([id, value]) => {
      if (aggConfig && aggConfig.date_histogram) {
        const buckets = value;
        searchResponse.aggregations[id] = {
          buckets: buckets.map(bucket => {
            const timestamp = new Date(bucket.key).getTime();
            searchResponse.hits.total += bucket.value;
            return {
              key_as_string: bucket.key,
              key: timestamp,
              doc_count: bucket.value
            };
          })
        };
      } else {
        // Handle other aggregation types here if needed
        searchResponse.aggregations[id] = value;
      }
    });
  }
  return searchResponse;
};

/**
 * Returns the field type. This function is used to determine the field type so that can
 * be used by the rest of the application. The field type must map to a OsdFieldType
 * to be used by the rest of the application.
 *
 * @param field - field object
 * @returns field type
 */
exports.convertResult = convertResult;
const getFieldType = field => {
  var _field$name, _field$values;
  const fieldName = (_field$name = field.name) === null || _field$name === void 0 ? void 0 : _field$name.toLowerCase();
  if (fieldName !== null && fieldName !== void 0 && fieldName.includes('date') || fieldName !== null && fieldName !== void 0 && fieldName.includes('timestamp')) {
    return 'date';
  }
  if ((_field$values = field.values) !== null && _field$values !== void 0 && _field$values.some(value => value instanceof Date || _datemath.default.isDateTime(value))) {
    return 'date';
  }
  if (field.type === 'struct') {
    return 'object';
  }
  return field.type;
};

/**
 * Returns the time field. If there is an aggConfig then we do not have to guess.
 * If there is no aggConfig then we will try to guess the time field.
 *
 * @param data - data frame object.
 * @param aggConfig - aggregation configuration object.
 * @returns time field.
 */
exports.getFieldType = getFieldType;
const getTimeField = (data, queryConfig, aggConfig) => {
  if (queryConfig !== null && queryConfig !== void 0 && queryConfig.timeFieldName) {
    return {
      name: queryConfig.timeFieldName,
      type: 'date'
    };
  }
  const fields = data.schema || data.fields;
  if (!fields) {
    throw Error('Invalid time field');
  }
  return aggConfig && aggConfig.date_histogram && aggConfig.date_histogram.field ? fields.find(field => {
    var _aggConfig$date_histo;
    return field.name === (aggConfig === null || aggConfig === void 0 || (_aggConfig$date_histo = aggConfig.date_histogram) === null || _aggConfig$date_histo === void 0 ? void 0 : _aggConfig$date_histo.field);
  }) : fields.find(field => field.type === 'date');
};

/**
 * Parses timepicker datetimes using datemath package. Will attempt to parse strings such as
 * "now - 15m"
 *
 * @param dateRange - of type TimeRange
 * @param dateFormat - formatting string (should work with Moment)
 * @returns object with `fromDate` and `toDate` strings, both of which will be in utc time and formatted to
 * the `dateFormat` parameter
 */
exports.getTimeField = getTimeField;
const formatTimePickerDate = (dateRange, dateFormat) => {
  const dateMathParse = (date, roundUp) => {
    const parsedDate = _datemath.default.parse(date, {
      roundUp
    });
    return parsedDate ? parsedDate.utc().format(dateFormat) : '';
  };
  const fromDate = dateMathParse(dateRange.from);
  const toDate = dateMathParse(dateRange.to, true);
  return {
    fromDate,
    toDate
  };
};

/**
 * Checks if the value is a GeoPoint. Expects an object with lat and lon properties.
 *
 * @param value - value to check
 * @returns True if the value is a GeoPoint, false otherwise
 */
exports.formatTimePickerDate = formatTimePickerDate;
const isGeoPoint = value => {
  return typeof value === 'object' && value !== null && 'lat' in value && 'lon' in value && typeof value.lat === 'number' && typeof value.lon === 'number';
};

/**
 * Creates a data frame.
 *
 * @param partial - partial data frame object
 * @returns data frame.
 */
exports.isGeoPoint = isGeoPoint;
const createDataFrame = partial => {
  var _partial$schema, _partial$fields;
  let size = 0;
  const processField = field => {
    field.type = getFieldType(field);
    if (!field.values) {
      field.values = new Array(size);
    } else if (field.values.length > size) {
      size = field.values.length;
    }
    return field;
  };
  const schema = (_partial$schema = partial.schema) === null || _partial$schema === void 0 ? void 0 : _partial$schema.map(processField);
  const fields = (_partial$fields = partial.fields) === null || _partial$fields === void 0 ? void 0 : _partial$fields.map(processField);
  return {
    ...partial,
    schema,
    fields,
    size
  };
};

/**
 * Converts a data frame to index pattern spec which can be used to create an index pattern.
 *
 * @param dataFrame - data frame object
 * @param id - index pattern id if it exists
 * @returns index pattern spec
 */
exports.createDataFrame = createDataFrame;
const dataFrameToSpec = (dataFrame, id) => {
  var _getTimeField, _dataFrame$meta, _dataFrame$meta2, _dataFrame$meta3, _dataFrame$meta4;
  const fields = dataFrame.schema || dataFrame.fields;
  const toFieldSpec = (field, overrides) => {
    var _field$aggregatable, _field$searchable;
    return {
      ...field,
      ...overrides,
      aggregatable: (_field$aggregatable = field.aggregatable) !== null && _field$aggregatable !== void 0 ? _field$aggregatable : true,
      searchable: (_field$searchable = field.searchable) !== null && _field$searchable !== void 0 ? _field$searchable : true
    };
  };
  const flattenFields = (acc, field) => {
    switch (field.type) {
      case 'object':
        const dataField = dataFrame.fields.find(f => f.name === field.name) || field;
        if (dataField) {
          const subField = dataField.values[0];
          if (!subField) {
            acc[field.name] = toFieldSpec(field, {});
            break;
          }
          Object.entries(subField).forEach(([key, value]) => {
            const subFieldName = `${dataField.name}.${key}`;
            const subFieldType = typeof value;
            if (subFieldType === 'object' && isGeoPoint(value)) {
              acc[subFieldName] = toFieldSpec(subField, {
                name: subFieldName,
                type: 'geo_point'
              });
            } else {
              var _Object$entries;
              acc = flattenFields(acc, {
                name: subFieldName,
                type: subFieldType,
                values: subFieldType === 'object' ? (_Object$entries = Object.entries(value)) === null || _Object$entries === void 0 ? void 0 : _Object$entries.map(([k, v]) => ({
                  name: `${subFieldName}.${k}`,
                  type: typeof v
                })) : []
              });
            }
          });
        }
        break;
      default:
        acc[field.name] = toFieldSpec(field, {});
        break;
    }
    return acc;
  };
  return {
    id: id !== null && id !== void 0 ? id : _types.DATA_FRAME_TYPES.DEFAULT,
    title: dataFrame.name,
    timeFieldName: (_getTimeField = getTimeField(dataFrame, (_dataFrame$meta = dataFrame.meta) === null || _dataFrame$meta === void 0 ? void 0 : _dataFrame$meta.queryConfig)) === null || _getTimeField === void 0 ? void 0 : _getTimeField.name,
    dataSourceRef: {
      id: (_dataFrame$meta2 = dataFrame.meta) === null || _dataFrame$meta2 === void 0 || (_dataFrame$meta2 = _dataFrame$meta2.queryConfig) === null || _dataFrame$meta2 === void 0 ? void 0 : _dataFrame$meta2.dataSourceId,
      name: (_dataFrame$meta3 = dataFrame.meta) === null || _dataFrame$meta3 === void 0 || (_dataFrame$meta3 = _dataFrame$meta3.queryConfig) === null || _dataFrame$meta3 === void 0 ? void 0 : _dataFrame$meta3.dataSourceName,
      type: (_dataFrame$meta4 = dataFrame.meta) === null || _dataFrame$meta4 === void 0 || (_dataFrame$meta4 = _dataFrame$meta4.queryConfig) === null || _dataFrame$meta4 === void 0 ? void 0 : _dataFrame$meta4.dataSourceType
    },
    type: !id ? _types.DATA_FRAME_TYPES.DEFAULT : undefined,
    fields: fields.reduce(flattenFields, {})
  };
};
exports.dataFrameToSpec = dataFrameToSpec;