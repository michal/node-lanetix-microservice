(function () {
  'use strict';

  var fs = require('fs'),
    util = require('util');

  function readKey(path) {
    return fs.readFileSync(__dirname + util.format('/%s', path));
  }

  module.exports = {
    test: {
      privateKey: readKey('test/private_key.pem'),
      publicKey: readKey('test/public_key.pem')
    },
    production: {
      publicKey: readKey('production/public_key.pem')
    }
  };

}());

