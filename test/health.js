/*globals describe: false, it: false*/
'use strict';

var supertest = require('supertest'),
    server = require('../server')();

describe('health check', function() {
  it('should 204 on health route', function(done) {
    server.then(function(server) {
      supertest(server)
        .get('/health')
        .expect(204, done);
    }).
    catch(done);
  });
});
