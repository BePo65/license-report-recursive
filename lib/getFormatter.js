import getFormatterLR from 'license-report/lib/getFormatter.js';


/**
 * Formats package information as json string.
 * @param dataAsArray - array of objects with information about dependencies / devdependencies in package.json
 * @param config - global configuration object
 * @returns dataAsArray formatted as json string
 */
// eslint-disable-next-line no-unused-vars
function formatAsJsonString(dataAsArray, config) {
	return JSON.stringify(dataAsArray)
}

/**
 * Gets the formatter function for the style given.
 * Allowed styles: 'json', 'table', 'csv', 'html', 'tree'.
 * Function signature: function(dataAsArray, config)
 * dataAsArray: array of objects with information about dependencies / devdependencies in package.json,
 * config: global configuration object
 * @param style - output style to be generated
 * @returns function to format the data; signature: function(dataAsArray, config)
 */
function getFormatter(style) {
	let formatter
	switch (style) {
		case 'tree':
			formatter = formatAsJsonString
			break
		default:
			formatter = getFormatterLR(style)
	}

	return formatter
}

export default getFormatter;
