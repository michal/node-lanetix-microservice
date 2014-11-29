(function () {
  'use strict';

  var fs = require('fs'),
    util = require('util');

  function readKey(path) {
    return fs.readFileSync(__dirname + util.format('/keys/%s', path));
  }

  module.exports = {
    development: {
      privateKey: readKey('development/private_key.pem'),
      publicKey: readKey('development/public_key.pem')
    },
    production: {
      publicKey: readKey('production/public_key.pem')
    }
  };

}());

