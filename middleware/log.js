'use strict';

var METHODS = ['error', 'info', 'log', 'warn'];

module.exports = function (req, res, next) {
  var buildArgs = function (args) {
    var requestId = req.headers['x-request-id'],
      response = Array.prototype.slice.call(args);

    if (requestId) {
      response.unshift(requestId);
    }

    return response;
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
