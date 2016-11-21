'use strict';

module.exports = function (req, res, next) {
  var buildArgs = function (args) {
    var requestId = req.headers['x-request-id'],
      response = Array.prototype.slice.call(args);

    response.unshift(requestId);
    return response;
  };

  req.error = function () {
    var args = buildArgs(arguments);
    console.error.apply(console, args);
  };

  req.log = function () {
    var args = buildArgs(arguments);
    console.log.apply(console, args);
  };

  req.warn = function () {
    var args = buildArgs(arguments);
    console.warn.apply(console, args);
  };

  next();
};
