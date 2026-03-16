import createDebugMessages from 'debug';
import { getPackageIdWithVersion } from './packageIdentity.js';

const debug = createDebugMessages('license-report-recurse');

const buildDependencyLookup = (dedupedSortedList) => {
  const lookup = new Map();

  dedupedSortedList.forEach((dependency) => {
    const dependencyId = getPackageIdWithVersion(dependency);
    if (!lookup.has(dependencyId)) {
      lookup.set(dependencyId, dependency);
    }
  });

  return lookup;
};

const createLoopNode = (dependency) => {
  return {
    ...dependency,
    requires: [{ dependencyLoop: true }],
  };
};

const buildTreeNode = (dependency, dependencyLookup, ancestorIds) => {
  const currentId = getPackageIdWithVersion(dependency);
  const nextAncestors = new Set(ancestorIds);
  nextAncestors.add(currentId);

  const builtNode = {
    ...dependency,
  };

  const subDeps = Array.isArray(dependency.requires) ? dependency.requires : [];
  builtNode.requires = subDeps.flatMap((subDependency) => {
    const subId = getPackageIdWithVersion(subDependency);
    const foundDependency = dependencyLookup.get(subId);

    if (foundDependency === undefined) {
      debug(`listToTree: subdependency '${subId}' of '${currentId}' not found.`);
      return [];
    }

    if (subDependency.dependencyLoop || nextAncestors.has(subId)) {
      debug(`listToTree: dependency loop placeholder for '${subId}' under '${currentId}'`);
      return [createLoopNode(foundDependency)];
    }

    return [buildTreeNode(foundDependency, dependencyLookup, nextAncestors)];
  });

  return builtNode;
};

const reduceNodeToConfiguredFields = (node, config) => {
  if (node?.dependencyLoop === true) {
    return { dependencyLoop: true };
  }

  const configuredFields = [...config.fields, 'requires'];
  const cleanedNode = {};

  configuredFields.forEach((fieldName) => {
    if (fieldName === 'requires') {
      const requires = Array.isArray(node.requires) ? node.requires : [];
      cleanedNode.requires = requires.map((child) => reduceNodeToConfiguredFields(child, config));
      return;
    }

    if (node[fieldName] !== undefined) {
      cleanedNode[fieldName] = node[fieldName];
      return;
    }

    cleanedNode[fieldName] = config[fieldName].value;
  });

  return cleanedNode;
};

/**
 * Convert the list of dependency to a tree.
 * Requires that depsIndex contains no duplicate entries and that the root nodes have a
 * field 'isRootNode' with value 'true'.
 * @param {object[]} dedupedSortedList - array with dependencies from package.json the report is generated for
 * @param {object} config - configuration object for this program
 * @returns {object[]} dedupedSortedList converted to a tree
 */
const listToTree = (dedupedSortedList, config) => {
  const dependencyLookup = buildDependencyLookup(dedupedSortedList);
  const rootNodes = dedupedSortedList.filter((dependency) => dependency.isRootNode);

  return rootNodes.map((rootNode) => {
    return reduceNodeToConfiguredFields(
      buildTreeNode(rootNode, dependencyLookup, new Set()),
      config,
    );
  });
};

export default listToTree;
