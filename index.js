(function () {
  'use strict';

  module.exports = {
    jwt: require('./jwt'),
    keys: require('./keys'),
    middleware: require('require-directory')(module, __dirname + '/middleware'),
    server: require('./server'),
    test: require('./test_client')
  };

}());
