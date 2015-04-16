'use strict';
var util = require('util');

module.exports = function (app) {
  return function (err, req, res, next) {
    var statusCode = err.statusCode || (err.output && err.output.statusCode) || 500;
    res.status(statusCode);

    if (app.get('options').isProduction || statusCode !== 500) {
      if (statusCode === 500) {
        // for Papertrail purposes.
        var errorMsg = 'Error: ' + (err.stack || util.inspect(err, { depth: null }));
        errorMsg += req ? '\nUrl: ' + req.originalUrl + '\nBody: ' + util.inspect(req.body, { depth: null }) : '';
        console.error(errorMsg);
      }
      res.json({message: err.message});
    } else {
      next(err);
    }
  };
};
