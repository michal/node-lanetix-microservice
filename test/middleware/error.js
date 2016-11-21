'use strict';

var _ = require('lodash'),
  httpMocks = require('node-mocks-http'),
  sinon = require('sinon'),
  error = require('../../middleware/error');

describe('middleware/error', function () {
  var req, res;

  beforeEach(function () {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();

    req.error = sinon.spy();
  });

  describe('in production', function () {
    var err, consoleError;

    beforeEach(function () {
      err = error({ get: _.constant({ isProduction: true }) });
      //silence console.error
      consoleError = console.error;
      console.error = _.noop;
    });

    afterEach(function () {
      console.error = consoleError;
    });

    it('should set status to 500', function () {
      err({}, req, res, _.noop);
      res.should.have.property('statusCode', 500);
    });

    it('should send the message', function () {
      err(new Error('lol'), req, res, _.noop);

      /* eslint-disable no-underscore-dangle */
      var body = JSON.parse(res._getData());
      body.should.have.property('message', 'lol');
      /* eslint-enable no-underscore-dangle */
    });

    describe('logging', function () {
      var sandbox;

      beforeEach(function () {
        sandbox = sinon.sandbox.create();
        console.error = sinon.spy();
      });

      afterEach(function () {
        sandbox.restore();
      });

      it('should log something with a circular ref', function () {
        var spyCall, message,
          foo = {};
        foo.foo = foo;
        err(foo, req, res, _.noop);

        spyCall = req.error.getCall(0);
        message = spyCall.args[0];
        message.should.match(/^Error: \{ foo: \[Circular\] \}/);
      });

      it('should log an error\'s stack', function () {
        var spyCall, message;
        err(new Error('lol'), req, res, _.noop);

        spyCall = req.error.getCall(0);
        message = spyCall.args[0];
        message.should.match(/^Error: Error: lol\s+at /);
      });

      it('should log the url', function () {
        var spyCall, message;

        req.originalUrl = '/foo';

        err({}, req, res, _.noop);

        spyCall = req.error.getCall(0);
        message = spyCall.args[0];
        message.should.match(/Url: \/foo/);
      });

      it('should log the body', function () {
        var spyCall, message;

        req.body = { foo: 'bar' };

        err({}, req, res, _.noop);

        spyCall = req.error.getCall(0);
        message = spyCall.args[0];
        message.should.match(/Body: \{ foo: 'bar' \}/);
      });

    });
  });

  describe('not in production', function () {
    var err;

    beforeEach(function () {
      err = error({ get: _.constant({}) });
    });

    it('should call next with the error', function () {
      var error = {};
      err(error, req, res, function (err) {
        err.should.equal(error);
      });
    });

    it('should set status to 500', function () {
      err({}, req, res, _.noop);
      res.should.have.property('statusCode', 500);
    });
  });
});
