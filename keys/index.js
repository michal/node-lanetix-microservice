'use strict';

var fs = require('fs'),
  path = require('path');

function readKey (filepath) {
  return fs.readFileSync(path.join(__dirname, filepath));
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
