import createDebugMessages from 'debug';

const debug = createDebugMessages('license-report-recurse');

/**
 * Get the list of fields to remove and fields to add to every element.
 * The results are based on a sample element of the list to operate on
 * and the configuration object, containing the field list.
 * @param {object} sample - a sample element of the list to operate on
 * @param {object} config - configuration object, containing the field list
 * @returns {object} array with fieldsToRemove and array with fieldsToAdd
 */
const getFieldsToRemoveOrAdd = (sample, config) => {
  const sampleKeys = Object.keys(sample);
  sampleKeys.push('isRootNode'); // this key must always be removed

  const fieldsToRemove = sampleKeys.filter((fieldName) => !config.fields.includes(fieldName));
  const fieldsToAdd = config.fields.filter((fieldName) => !sampleKeys.includes(fieldName));
  return { fieldsToRemove, fieldsToAdd };
};

/**
 * Modify node to contain all fields defined in config and only those fields.
 * 'requires' is always part of the fields, as this is a tree.
 * @param {object} node - node to modify the fields of
 * @param {object} config - configuration object that contains the field list and default values
 */
const reduceToConfiguredFields = (node, config) => {
  // Get fields to add or remove; as this is a tree, we always need the field 'requires'
  const treeConfig = { ...config };
  treeConfig.fields = [...config.fields, 'requires'];
  const { fieldsToRemove, fieldsToAdd } = getFieldsToRemoveOrAdd(node, treeConfig);

  fieldsToRemove.forEach((fieldName) => {
    if (node[fieldName] !== undefined) {
      delete node[fieldName];
    }
  });

  fieldsToAdd.forEach((fieldName) => {
    if (node[fieldName] === undefined && config[fieldName] !== undefined) {
      node[fieldName] = config[fieldName].value;
    }
  });
};

/**
 * Convert the list of root nodes of dependencies to a tree.
 * Requires that rootNodes contains only nodes that have a
 * field 'isRootNode' with value 'true'.
 * The original data is modified: only fields defined in config are kept,
 * missing fields are added with default values.
 * @param {object[]} rootNodes - array with dependencies from the package.json under inspection
 * @param {object} config - configuration object for this program
 * @returns {object[]} rootNodes list converted to a tree
 */
const listToTree = (rootNodes, config) => {
  // keep only fields that are defined in the configuration
  const queue = [...rootNodes];

  while (queue.length > 0) {
    const node = queue.shift();
    debug(`cleaning node "${node.name}"`);

    reduceToConfiguredFields(node, config);

    if (Array.isArray(node?.requires) && node.requires.length > 0) {
      if (node.requires?.[0].dependencyLoop === undefined) {
        queue.push(...node.requires);
      }
    } else {
      delete node.requires;
    }
  }

  return rootNodes;
};

export default listToTree;
