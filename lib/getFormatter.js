import { getFormatter as getFormatterLR } from 'license-report/lib/getFormatter.js';

/**
 * Formats package information as json string.
 * @param {object[]} dataAsArray - array of objects with information about dependencies / devdependencies in package.json
 * @returns {string} dataAsArray formatted as json string
 */
const formatAsJsonString = (dataAsArray) => {
  return JSON.stringify(dataAsArray);
};

/**
 * Gets the formatter function for the style given.
 * Allowed styles: 'json', 'table', 'csv', 'html', 'tree'.
 * Function signature: function(dataAsArray, config)
 * dataAsArray: array of objects with information about dependencies / devdependencies in package.json,
 * config: global configuration object
 * @param {string} style - output style to be generated
 * @returns {function(object[], object?)} function to format the data; signature: function(dataAsArray, config)
 */
const getFormatter = (style) => {
  let formatter;
  switch (style) {
    case 'tree':
      formatter = formatAsJsonString;
      break;
    default:
      formatter = getFormatterLR(style);
  }

  return formatter;
};

export default getFormatter;
