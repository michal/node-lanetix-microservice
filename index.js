'use strict';
var path = require('path');

module.exports = {
  jwt: require('./jwt'),
  keys: require('./keys'),
  middleware: require('require-directory')(module, path.join(__dirname, '/middleware')),
  server: require('./server'),
  test: require('./test_client')
};
