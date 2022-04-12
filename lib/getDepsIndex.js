const addPackagesToIndex = require('./addPackagesToIndex')
const config = require('./config.js')

module.exports = function(packageJson) {
  const deps = packageJson.dependencies
  const peerDeps = packageJson.peerDependencies
  const optDeps = packageJson.optionalDependencies
  const devDeps = packageJson.devDependencies

  const exclusions = Array.isArray(config.exclude) ? config.exclude : [config.exclude]

  // the resulting index of all the selected dependencies
  let depsIndex = []

  if (!config.only || config.only.indexOf('prod') > -1) {
    addPackagesToIndex(deps, depsIndex, exclusions)
  }

  if (!config.only || config.only.indexOf('dev') > -1) {
		addPackagesToIndex(devDeps, depsIndex, exclusions)
  }

  if (!config.only || config.only.indexOf('peer') > -1) {
    if (peerDeps) {
      addPackagesToIndex(peerDeps, depsIndex, exclusions)
    }
  }

  if (!config.only || config.only.indexOf('opt') > -1) {
    if (optDeps) {
      addPackagesToIndex(optDeps, depsIndex, exclusions)
    }
  }

  return depsIndex
}