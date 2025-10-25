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

  const fieldsToRemove = sampleKeys.filter(
    (fieldName) => !config.fields.includes(fieldName),
  );
  const fieldsToAdd = config.fields.filter(
    (fieldName) => !sampleKeys.includes(fieldName),
  );
  return { fieldsToRemove, fieldsToAdd };
};

/**
 * Modify baseList to contain all fields defined in config and only those fields.
 * 'requires' is always part of the fields, as this is a tree.
 * @param {object[]} baseList - list to modify
 * @param {object} config - configuration object that contains the field list and default values
 */
const reduceToConfiguredFields = (baseList, config) => {
  if (baseList.length === 0) {
    return;
  }

  // as this is a tree, we always need the field 'requires'
  const treeConfig = { ...config };
  treeConfig.fields = [...config.fields, 'requires'];
  const { fieldsToRemove, fieldsToAdd } = getFieldsToRemoveOrAdd(
    baseList[0],
    treeConfig,
  );

  baseList.forEach((element) => {
    fieldsToRemove.forEach((fieldName) => {
      // eslint-disable-next-line security/detect-object-injection
      if (element[fieldName] !== undefined) {
        // eslint-disable-next-line security/detect-object-injection
        delete element[fieldName];
      }
    });

    fieldsToAdd.forEach((fieldName) => {
      // eslint-disable-next-line security/detect-object-injection
      if (!element[fieldName]) {
        // eslint-disable-next-line security/detect-object-injection
        element[fieldName] = config[fieldName].value;
      }
    });
  });
};

/**
 * Convert the list of dependency to a tree.
 * Requires that depsIndex contains no duplicate entries and that the root nodes have a
 * field 'isRootNode' with value 'true'.
 * The original data is modified: every entry of the 'requires' field of every package
 * is replaced by a link to the corresponding list entry.
 * @param {object[]} dedupedSortedList - array with dependencies from package.json the report is generated for0er inspection
 * @param {object} config - configuration object for this program
 * @returns {object[]} dedupedSortedList converted to a tree
 */
const listToTree = (dedupedSortedList, config) => {
  // for each package in list
  const endOfList = dedupedSortedList.length - 1;
  for (let i = 0; i <= endOfList; i++) {
    // eslint-disable-next-line security/detect-object-injection
    const currentDependency = dedupedSortedList[i];
    const currentId = `${currentDependency.name}@${currentDependency.installedVersion}`;
    const subDeps = currentDependency.requires;
    if (subDeps !== undefined && Array.isArray(subDeps)) {
      const updatedRequires = [];
      // for each subdependency
      subDeps.forEach((dependency) => {
        const subId = `${dependency.name}@${dependency.installedVersion}`;
        // find reference in depsIndex; avoid loops in dependencies when an element depends on itself
        const foundElement = dedupedSortedList.find(
          (d, index) =>
            `${d.name}@${d.installedVersion}` === subId && index !== i,
        );
        if (foundElement !== undefined) {
          // if this element has field "dependencyLoop = true", replace 'requires' with placeholder to prevent loops
          if (!dependency.dependencyLoop) {
            updatedRequires.push(foundElement);
          } else {
            const elementWithDependencyLoop = {
              ...foundElement,
              requires: [{ dependencyLoop: true }],
            };
            updatedRequires.push(elementWithDependencyLoop);
            dedupedSortedList.push(elementWithDependencyLoop);
          }
        } else {
          debug(
            `listToTree: subdependency '${subId}' of '${currentId}' not found.`,
          );
        }
      });

      currentDependency.requires = updatedRequires;
      if (updatedRequires.length !== subDeps.length) {
        debug(
          `listToTree: not all subdependencies of '${currentId}' exist in list.`,
        );
      }
    }
  }

  // extract root nodes
  const result = dedupedSortedList.filter((element) => element.isRootNode);

  // keep only fields that are defined in the configuration;
  // the tree consists of references to entries in 'dedupedSortedList';
  // therefore we can / must clean 'dedupedSortedList' to clean 'result'
  reduceToConfiguredFields(dedupedSortedList, config);

  return result;
};

export default listToTree;
