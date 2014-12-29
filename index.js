(function () {
  'use strict';

  module.exports = {
    jwt: require('./jwt'),
    keys: require('./keys'),
    middleware: require('./middleware'),
    server: require('./server'),
    test: require('./test_client')
  };

}());
