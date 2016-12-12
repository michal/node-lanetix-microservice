'use strict';

var METHODS = ['error', 'info', 'log', 'warn'];

module.exports = function (req, res, next) {
  var buildArgs = function (args) {
    var requestId = req.headers['x-request-id'],
      user = req.user,
      response = [];

    if (requestId) {
      response.push('req: ' + requestId);
    }

    if (user) {
      response.push('org: ' + user.organization_id);
      response.push('user: ' + user.id);
    }

    return response.concat(Array.prototype.slice.call(args));
  };

  METHODS.forEach(function (method) {
    req[method] = function () {
      var args = buildArgs(arguments);
      console[method].apply(console, args);
    };
  });

  next();
};

module.exports.methods = METHODS;
