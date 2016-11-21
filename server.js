'use strict';

var _ = require('lodash'),
  bodyParser = require('body-parser'),
  boom = require('express-boom'),
  config = require('./config'),
  path = require('path'),
  middleware = require('require-directory')(module, path.join(__dirname, 'middleware'));

module.exports = function (app, options) {
  _.extend(options, config);
  options = _.extend(config, options);

  app.enable('trust proxy');
  app.disable('x-powered-by');
  app.set('options', options);

  // configure
  if (options.configure && _.isFunction(options.configure)) {
    options.configure(app);
  }
  app.get('/health', middleware.health);
  app.use(bodyParser.json({limit: '5mb'}));
  app.use(boom());
  app.use(middleware.response(app));
  app.use(middleware.cors(app));

  // pre-authentication
  if (options.preAuthentication && _.isFunction(options.preAuthentication)) {
    options.preAuthentication(app);
  } else if (options.preAuthentication && _.isArray(options.preAuthentication)) {
    options.preAuthentication.forEach(function (fn) {
      app.use(fn(app));
    });
  }
  app.use(middleware.jwt(app));

  // post-authentication
  if (options.postAuthentication && _.isFunction(options.postAuthentication)) {
    options.postAuthentication(app);
  } else if (options.postAuthentication && _.isArray(options.postAuthentication)) {
    options.postAuthentication.forEach(function (fn) {
      app.use(fn(app));
    });
  }
  // routers
  if (options.routers) {
    Object.keys(options.routers).forEach(function (key) {
      var route = options.routers[key];
      (_.isArray(route) ? route : [route]).forEach(function (route) {
        app.use(key[0] === '/' ? key : '/' + key, route);
      });
    });
  }

  // error handler
  app.use(middleware.error(app));

  return app;
};
