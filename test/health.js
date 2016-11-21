'use strict';

var httpMocks = require('node-mocks-http'),
  middleware = require('../middleware/health');

describe('health check', function () {
  it('should 204 on health route', function (done) {
    var req = httpMocks.createRequest(),
      res = httpMocks.createResponse();

    middleware(req, res);

    res.should.have.property('statusCode', 204);
    done();
  });
});
