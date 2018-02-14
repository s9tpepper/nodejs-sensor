'use strict';

var path = require('path');
var fs = require('fs');

var logger = require('../logger').getLogger('actions/profiling/cpu');

exports.getModuleAnalysis = function(request, multiCb) {
  var data = {
    'cwd': process.cwd(),
    'require.main.filename': require.main ? require.main.filename : undefined,
    'require.main.paths': require.main ? require.main.paths : undefined,
    'require.cache': getRequireCacheOverview()
  };

  // send data that is easy to grab right away
  multiCb({
    data: data
  });

  getNodeModulesOverview(function(err, nodeModulesTree) {
    if (err) {
      multiCb({
        error: 'Could not gather node_modules overview: ' + err
      });
      return;
    }

    data.node_modules = nodeModulesTree;
    multiCb({
      data: data
    });
  });
};


function getRequireCacheOverview() {
  return Object.keys(require.cache)
    .map(function(id) {
      var mod = require.cache[id];
      var parent = mod.parent;
      return {
        filename: mod.filename,
        parent: parent ? parent.filename : undefined
      };
    });
}


function getNodeModulesOverview(cb) {
  var nodeModulePaths = (require.main || module).paths.slice();
  var packageJsonPaths = [];
  var rootNode = {};
  iterate(nodeModulePaths, packageJsonPaths, rootNode, rootNode, cb);
}


function iterate(nodeModulePaths, packageJsonPaths, rootNode, parentNode, cb) {
  if (packageJsonPaths.length > 0) {
    iterateOnPackageJson(nodeModulePaths, packageJsonPaths, rootNode, parentNode, cb);
    return;
  } else if (nodeModulePaths.length > 0) {
    iteratorOnNodeModules(nodeModulePaths, packageJsonPaths, rootNode, parentNode, cb);
    return;
  }

  cb(null, rootNode);
}


function iterateOnPackageJson(nodeModulePaths, packageJsonPaths, rootNode, parentNode, cb) {
  var packageJsonPath = packageJsonPaths.shift();
  var nodeModulesPath
  fs.readFile(packageJsonPath, {encoding: 'utf8'}, function(err, contents) {
    // TODO parse file and add to node
    // TODO check for node_modules sub dir
  });
}


function iteratorOnNodeModules(nodeModulePaths, packageJsonPaths, rootNode, node, cb) {

}
