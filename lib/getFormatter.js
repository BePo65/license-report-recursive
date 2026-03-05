import { getFormatter as getFormatterLR } from 'license-report/lib/getFormatter.js';

/**
 * Formats package information as json string.
 * @param {object[]} dataAsArray - array of objects with information about dependencies / devdependencies in package.json
 * @returns {string} dataAsArray formatted as json string
 */
const formatAsJsonString = (dataAsArray) => {
  // Replace only circular references in the current ancestor chain.
  // This preserves duplicated objects across branches while preventing throws.
  const ancestors = [];
  return JSON.stringify(dataAsArray, function replacer(_key, value) {
    if (typeof value !== 'object' || value === null) {
      return value;
    }

    while (ancestors.length > 0 && ancestors.at(-1) !== this) {
      ancestors.pop();
    }

    if (ancestors.includes(value)) {
      return { dependencyLoop: true };
    }

    ancestors.push(value);
    return value;
  });
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
