(function () {
  'use strict';

  var _ = require('lodash'),
    Promise = require('bluebird'),
    express = require('express'),
    bodyParser = require('body-parser'),
    boom = require('express-boom'),
    config = require('./config'),
    middleware = require('require-directory')(module, __dirname + '/middleware');

  module.exports = function () {
    var args = Array.prototype.slice.call(arguments),
      options = _.extend.apply(_, [{}, config].concat(args));

    return Promise.resolve(express())
      .tap(function (app) {
        app.enable('trust proxy');
        app.disable('x-powered-by');
        app.set('options', options);

        // configure
        if (options.configure && _.isFunction(options.configure)) {
          return options.configure(app);
        }
      })
      .tap(function (app) {
        app.use(bodyParser.json());
        app.use(boom());
        app.use(middleware.response(app));
        app.use(middleware.cors(app));

        // pre-authentication
        if (options.preAuthentication && _.isFunction(options.preAuthentication)) {
          return options.preAuthentication(app);
        } else if (options.preAuthentication && _.isArray(options.preAuthentication)) {
          options.preAuthentication.forEach(function (fn) {
            fn(app);
          });
        }
      })
      .tap(function (app) {
        app.use(middleware.jwt(app));

        // post-authentication
        if (options.postAuthentication && _.isFunction(options.postAuthentication)) {
          return options.postAuthentication(app);
        } else if (options.postAuthentication && _.isArray(options.postAuthentication)) {
          options.postAuthentication.forEach(function (fn) {
            fn(app);
          });
        }
      })
      .tap(function (app) {
        // routers
        if (options.routers) {
          Object.keys(options.routers).forEach(function (key) {
            var route = options.routers[key];
            (_.isArray(route) ? route : [route]).forEach(function (route) {
              app.use(key, route);
            });
          });
        }

        // error handler
        app.use(function (err, req, res, next) {
          var statusCode = err.statusCode || (err.output && err.output.statusCode) || 500;
          res.status(statusCode);

          if (app.get('options').isProduction || statusCode !== 500) {
            res.json({message: err.message});
          } else {
            next(err);
          }
        });
      });
  };

}());

