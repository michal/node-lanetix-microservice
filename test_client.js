'use strict';

var util = require('util'),
  _ = require('lodash'),
  supertest = require('supertest-as-promised'),
  jwt = require('./jwt');

function extractUserFromContext (context) {
  if (context.user && context.user.toJSON) {
    return context.user.toJSON();
  } else if (context.user) {
    return context.user;
  } else if (context.toJSON) {
    return context.toJSON();
  } else {
    return context;
  }
}

function generateToken (user) {
  return jwt.sign(_.defaults({}, user || {}, {
    user_id: user.user_id || user.id
  }));
}

module.exports = {

  serve: function (server, context) {
    var route = function (method, path) {
      var app = supertest(server)
      app = app[method.toLowerCase()](path);

      if (context) {
        app = app.set('Authorization', 'Bearer ' + generateToken(extractUserFromContext(context)));
      }

      return app;
     },
     retval = {
       route: route
     };

   ['get', 'post', 'patch', 'put', 'delete'].forEach(function (method) {
     retval[method] = function () {
       var args = Array.prototype.slice.call(arguments);
       return route(method, util.format.apply(util, args));
     };
   });
   return retval;
  }
};
