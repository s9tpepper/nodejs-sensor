/* eslint-env mocha */

'use strict';

var spawn = require('child_process').spawn;
var request = require('request-promise');
var path = require('path');

var utils = require('../../../utils');
var config = require('../../../config');
var agentPort = require('../../../apps/agentStubControls').agentPort;
var upstreamPort = require('../../../apps/expressControls').appPort;
var appPort = (exports.appPort = 3214);

var expressMongodbApp;

exports.registerTestHooks = function(opts) {
  opts = opts || {};
  beforeEach(function() {
    var env = Object.create(process.env);
    env.AGENT_PORT = agentPort;
    env.APP_PORT = appPort;
    env.UPSTREAM_PORT = upstreamPort;
    env.STACK_TRACE_LENGTH = opts.stackTraceLength || 0;
    env.TRACING_ENABLED = opts.enableTracing !== false;

    expressMongodbApp = spawn('node', [path.join(__dirname, 'app.js')], {
      stdio: config.getAppStdio(),
      env: env
    });

    return waitUntilServerIsUp();
  });

  afterEach(function() {
    expressMongodbApp.kill();
  });
};

function waitUntilServerIsUp() {
  return utils.retry(function() {
    return request({
      method: 'GET',
      url: 'http://127.0.0.1:' + appPort,
      headers: {
        'X-INSTANA-L': '0'
      }
    });
  });
}

exports.getPid = function() {
  return expressMongodbApp.pid;
};

exports.sendRequest = function(opts) {
  var headers = {};
  if (opts.suppressTracing === true) {
    headers['X-INSTANA-L'] = '0';
  }

  return request({
    method: opts.method,
    url: 'http://127.0.0.1:' + appPort + opts.path,
    json: true,
    body: opts.body,
    headers: headers
  });
};
