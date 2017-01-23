'use strict';

var assert = require('assert'),
  config = require('../../config'),
  express = require('express'),
  httpMocks = require('node-mocks-http'),
  jwt = require('jsonwebtoken'),
  nock = require('nock'),
  sinon = require('sinon'),
  middleware = require('../../middleware/jwt'),
  boom = require('boom'),
  keys = require('../../keys');

describe('jwt middleware', function () {
  var req, res, next, app, token;

  before(function () {
    app = express();
  });

  it('should authenticate token and return user object on request', function (done) {
    app.set('options', config);

    token = jwt.sign(
      {
        id: 1234,
        name: 'Cookie Monster'
      },
      keys.test.privateKey,
      {
        algorithm: 'RS256',
        issuer: 'urn:lanetix/auth',
        audience: 'urn:lanetix/api',
        subject: 'makeToken'
      }
    );

    req = httpMocks.createRequest({
      headers: {
        'Authorization': 'Bearer ' + token
      },
      cookies: {
        'XSRF-TOKEN': token
      }
    });

    res = httpMocks.createResponse({
      boom: {
        unathorized: sinon.spy()
      }
    });

    next = function (e) {
      if (e) {
        done(e);
      }
      try {
        assert.deepEqual(req.user.iss, 'urn:lanetix/auth');
        assert.deepEqual(req.user.id, 1234);
        assert.deepEqual(req.user.name, 'Cookie Monster');
        assert.deepEqual(req.user.aud, 'urn:lanetix/api');
      } catch (err) {
        done(err);
      }
      done();
    };
    var jwtMiddleware = middleware(app);

    jwtMiddleware(req, res, next);
  });

  // make auth1 fail and match public key to token
  it('should authenticate with authV2 when authV1 fails', function (done) {
    // using Auth0's test private/public keys because our publicKey is in a different format (https://github.com/auth0/node-jwks-rsa/blob/master/tests/mocks/keys.js)

    var publicKey = 'MIICsDCCAhmgAwIBAgIJAP0uzO56NPNDMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIEwpTb21lLVN0YXRlMSEwHwYDVQQKExhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwHhcNMTYwODAyMTIyMjMyWhcNMTYwOTAxMTIyMjMyWjBFMQswCQYDVQQGEwJBVTETMBEGA1UECBMKU29tZS1TdGF0ZTEhMB8GA1UEChMYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdlatRjRjogo3WojgGHFHYLugdUWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQsHUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5Do2kQ+X5xK9cipRgEKwIDAQABo4GnMIGkMB0GA1UdDgQWBBR7ZjPnt+i/E8VUy4tinxi0+H5vbTB1BgNVHSMEbjBsgBR7ZjPnt+i/E8VUy4tinxi0+H5vbaFJpEcwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgTClNvbWUtU3RhdGUxITAfBgNVBAoTGEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZIIJAP0uzO56NPNDMAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEFBQADgYEAnMA5ZAyEQgXrUl6JT/JFcg6HGXj9yTy71EEMVp3Md3B8WwDvs+di4JFcq8FKSoGtTY4Pb5WE9QVUAmwEsSQoETNYW3quRmYJCkpIHWnvUW/OAf2/Ejr6zXquhBC6WoCeKQuesMvo2qO1rStCUWahUh2/RQt9XozEWPWJ9Oe6a7c=';

    var privateKey = '-----BEGIN RSA PRIVATE KEY-----\nMIICWwIBAAKBgQDdlatRjRjogo3WojgGHFHYLugdUWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQsHUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5Do2kQ+X5xK9cipRgEKwIDAQABAoGAD+onAtVye4ic7VR7V50DF9bOnwRwNXrARcDhq9LWNRrRGElESYYTQ6EbatXS3MCyjjX2eMhu/aF5YhXBwkppwxg+EOmXeh+MzL7Zh284OuPbkglAaGhV9bb6/5CpuGb1esyPbYW+Ty2PC0GSZfIXkXs76jXAu9TOBvD0ybc2YlkCQQDywg2R/7t3Q2OE2+yo382CLJdrlSLVROWKwb4tb2PjhY4XAwV8d1vy0RenxTB+K5Mu57uVSTHtrMK0GAtFr833AkEA6avx20OHo61Yela/4k5kQDtjEf1N0LfI+BcWZtxsS3jDM3i1Hp0KSu5rsCPb8acJo5RO26gGVrfAsDcIXKC+bQJAZZ2XIpsitLyPpuiMOvBbzPavd4gY6Z8KWrfYzJoI/Q9FuBo6rKwl4BFoToD7WIUS+hpkagwWiz+6zLoX1dbOZwJACmH5fSSjAkLRi54PKJ8TFUeOP15h9sQzydI8zJU+upvDEKZsZc/UhT/SySDOxQ4G/523Y0sz/OZtSWcol/UMgQJALesy++GdvoIDLfJX5GBQpuFgFenRiRDabxrE9MNUZ2aPFaFp+DyAe+b4nDwuJaW2LURbr8AEZga7oQj0uYxcYw==\n-----END RSA PRIVATE KEY-----';

    token = jwt.sign(
      {
        id: 5678,
        name: 'Elmo'
      },
      privateKey,
      {
        algorithm: 'RS256',
        issuer: 'https://lanetix.auth0.com',
        audience: 'urn:lanetix/api',
        subject: 'makeToken',
        headers: {
          kid: 'ABCD'
        }
      }
    );

    var jwks = {
      'keys': [
        {
          'alg': 'RS256',
          'kty': 'RSA',
          'use': 'sig',
          'x5c': [publicKey],
          'kid': 'ABCD'
        }
      ]
    };

    req = httpMocks.createRequest({
      headers: {
        'Authorization': 'Bearer ' + token
      },
      cookies: {
        'XSRF-TOKEN': token
      }
    });

    nock('https://lanetix.auth0.com')
    .get('/.well-known/jwks.json')
    .reply(200, jwks);

    next = function (e) {
      if (e) {
        done(e);
      }
      try {
        assert.deepEqual(req.user.iss, 'https://lanetix.auth0.com');
        assert.deepEqual(req.user.id, 5678);
        assert.deepEqual(req.user.name, 'Elmo');
        assert.deepEqual(req.user.aud, 'urn:lanetix/api');
      } catch (err) {
        done(err);
      }
      done();
    };

    var jwtMiddleware = middleware(app);

    jwtMiddleware(req, res, next);
  });

  it('should deny access if both authentication with authV1 and authV2 fail', function (done) {
    // using Auth0's test private/public keys because our publicKey is in a different format (https://github.com/auth0/node-jwks-rsa/blob/master/tests/mocks/keys.js)

    var randomPublicKey = 'MIIDDTCCAfWgAwIBAgIJAJVkuSv2H8mDMA0GCSqGSIb3DQEBBQUAMB0xGzAZBgNVBAMMEnNhbmRyaW5vLmF1dGgwLmNvbTAeFw0xNDA1MTQyMTIyMjZaFw0yODAxMjEyMTIyMjZaMB0xGzAZBgNVBAMMEnNhbmRyaW5vLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL6jWASkHhXz5Ug6t5BsYBrXDIgrWu05f3oq2fE+5J5REKJiY0Ddc+Kda34ZwOptnUoef3JwKPDAckTJQDugweNNZPwOmFMRKj4xqEpxEkIX8C+zHs41Q6x54ZZy0xU+WvTGcdjzyZTZ/h0iOYisswFQT/s6750tZG0BOBtZ5qS/80tmWH7xFitgewdWteJaASE/eO1qMtdNsp9fxOtN5U/pZDUyFm3YRfOcODzVqp3wOz+dcKb7cdZN11EYGZOkjEekpcedzHCo9H4aOmdKCpytqL/9FXoihcBMg39s1OW3cfwfgf5/kvOJdcqR4PoATQTfsDVoeMWVB4XLGR6SC5kCAwEAAaNQME4wHQYDVR0OBBYEFHDYn9BQdup1CoeoFi0Rmf5xn/W9MB8GA1UdIwQYMBaAFHDYn9BQdup1CoeoFi0Rmf5xn/W9MAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEFBQADggEBAGLpQZdd2ICVnGjc6CYfT3VNoujKYWk7E0shGaCXFXptrZ8yaryfo6WAizTfgOpQNJH+Jz+QsCjvkRt6PBSYX/hb5OUDU2zNJN48/VOw57nzWdjI70H2Ar4oJLck36xkIRs/+QX+mSNCjZboRwh0LxanXeALHSbCgJkbzWbjVnfJEQUP9P/7NGf0MkO5I95C/Pz9g91y8gU+R3imGppLy9Zx+OwADFwKAEJak4JrNgcjHBQenakAXnXP6HG4hHH4MzO8LnLiKv8ZkKVL67da/80PcpO0miMNPaqBBMd2Cy6GzQYE0ag6k0nk+DMIFn7K+o21gjUuOEJqIbAvhbf2KcM=';

    var privateKey = '-----BEGIN RSA PRIVATE KEY-----\nMIICWwIBAAKBgQDdlatRjRjogo3WojgGHFHYLugdUWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQsHUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5Do2kQ+X5xK9cipRgEKwIDAQABAoGAD+onAtVye4ic7VR7V50DF9bOnwRwNXrARcDhq9LWNRrRGElESYYTQ6EbatXS3MCyjjX2eMhu/aF5YhXBwkppwxg+EOmXeh+MzL7Zh284OuPbkglAaGhV9bb6/5CpuGb1esyPbYW+Ty2PC0GSZfIXkXs76jXAu9TOBvD0ybc2YlkCQQDywg2R/7t3Q2OE2+yo382CLJdrlSLVROWKwb4tb2PjhY4XAwV8d1vy0RenxTB+K5Mu57uVSTHtrMK0GAtFr833AkEA6avx20OHo61Yela/4k5kQDtjEf1N0LfI+BcWZtxsS3jDM3i1Hp0KSu5rsCPb8acJo5RO26gGVrfAsDcIXKC+bQJAZZ2XIpsitLyPpuiMOvBbzPavd4gY6Z8KWrfYzJoI/Q9FuBo6rKwl4BFoToD7WIUS+hpkagwWiz+6zLoX1dbOZwJACmH5fSSjAkLRi54PKJ8TFUeOP15h9sQzydI8zJU+upvDEKZsZc/UhT/SySDOxQ4G/523Y0sz/OZtSWcol/UMgQJALesy++GdvoIDLfJX5GBQpuFgFenRiRDabxrE9MNUZ2aPFaFp+DyAe+b4nDwuJaW2LURbr8AEZga7oQj0uYxcYw==\n-----END RSA PRIVATE KEY-----';

    token = jwt.sign(
      {
        id: 91011,
        name: 'Count Count'
      },
      privateKey,
      {
        algorithm: 'RS256',
        issuer: 'https://lanetix.auth0.com',
        audience: 'urn:lanetix/api',
        subject: 'makeToken',
        headers: {
          kid: 'EFGH'
        }
      }
    );

    var jwks = {
      'keys': [
        {
          'alg': 'RS256',
          'kty': 'RSA',
          'use': 'sig',
          'x5c': [randomPublicKey],
          'kid': 'EFGH'
        }
      ]
    };

    req = httpMocks.createRequest({
      headers: {
        'Authorization': 'Bearer ' + token
      },
      cookies: {
        'XSRF-TOKEN': token
      },
      error: sinon.spy()
    });

    res = httpMocks.createResponse({
      redirect: sinon.spy()
    });

    nock('https://lanetix.auth0.com')
    .get('/.well-known/jwks.json')
    .reply(200, jwks);

    next = function (e) {
      try {
        assert.deepEqual(req.user, undefined);
        assert.equal(req.error.calledOnce, true);
        assert.deepEqual(e, boom.forbidden());
      } catch (err) {
        done(err);
      }
      done();
    };

    var jwtMiddleware = middleware(app);

    jwtMiddleware(req, res, next);
  });

  it('should deny access with expired token', function (done) {
    // using Auth0's test private/public keys because our publicKey is in a different format (https://github.com/auth0/node-jwks-rsa/blob/master/tests/mocks/keys.js)
    // var randomPublicKey = 'MIIDDTCCAfWgAwIBAgIJAJVkuSv2H8mDMA0GCSqGSIb3DQEBBQUAMB0xGzAZBgNVBAMMEnNhbmRyaW5vLmF1dGgwLmNvbTAeFw0xNDA1MTQyMTIyMjZaFw0yODAxMjEyMTIyMjZaMB0xGzAZBgNVBAMMEnNhbmRyaW5vLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL6jWASkHhXz5Ug6t5BsYBrXDIgrWu05f3oq2fE+5J5REKJiY0Ddc+Kda34ZwOptnUoef3JwKPDAckTJQDugweNNZPwOmFMRKj4xqEpxEkIX8C+zHs41Q6x54ZZy0xU+WvTGcdjzyZTZ/h0iOYisswFQT/s6750tZG0BOBtZ5qS/80tmWH7xFitgewdWteJaASE/eO1qMtdNsp9fxOtN5U/pZDUyFm3YRfOcODzVqp3wOz+dcKb7cdZN11EYGZOkjEekpcedzHCo9H4aOmdKCpytqL/9FXoihcBMg39s1OW3cfwfgf5/kvOJdcqR4PoATQTfsDVoeMWVB4XLGR6SC5kCAwEAAaNQME4wHQYDVR0OBBYEFHDYn9BQdup1CoeoFi0Rmf5xn/W9MB8GA1UdIwQYMBaAFHDYn9BQdup1CoeoFi0Rmf5xn/W9MAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEFBQADggEBAGLpQZdd2ICVnGjc6CYfT3VNoujKYWk7E0shGaCXFXptrZ8yaryfo6WAizTfgOpQNJH+Jz+QsCjvkRt6PBSYX/hb5OUDU2zNJN48/VOw57nzWdjI70H2Ar4oJLck36xkIRs/+QX+mSNCjZboRwh0LxanXeALHSbCgJkbzWbjVnfJEQUP9P/7NGf0MkO5I95C/Pz9g91y8gU+R3imGppLy9Zx+OwADFwKAEJak4JrNgcjHBQenakAXnXP6HG4hHH4MzO8LnLiKv8ZkKVL67da/80PcpO0miMNPaqBBMd2Cy6GzQYE0ag6k0nk+DMIFn7K+o21gjUuOEJqIbAvhbf2KcM=';
    var publicKey = 'MIICsDCCAhmgAwIBAgIJAP0uzO56NPNDMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIEwpTb21lLVN0YXRlMSEwHwYDVQQKExhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwHhcNMTYwODAyMTIyMjMyWhcNMTYwOTAxMTIyMjMyWjBFMQswCQYDVQQGEwJBVTETMBEGA1UECBMKU29tZS1TdGF0ZTEhMB8GA1UEChMYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdlatRjRjogo3WojgGHFHYLugdUWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQsHUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5Do2kQ+X5xK9cipRgEKwIDAQABo4GnMIGkMB0GA1UdDgQWBBR7ZjPnt+i/E8VUy4tinxi0+H5vbTB1BgNVHSMEbjBsgBR7ZjPnt+i/E8VUy4tinxi0+H5vbaFJpEcwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgTClNvbWUtU3RhdGUxITAfBgNVBAoTGEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZIIJAP0uzO56NPNDMAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEFBQADgYEAnMA5ZAyEQgXrUl6JT/JFcg6HGXj9yTy71EEMVp3Md3B8WwDvs+di4JFcq8FKSoGtTY4Pb5WE9QVUAmwEsSQoETNYW3quRmYJCkpIHWnvUW/OAf2/Ejr6zXquhBC6WoCeKQuesMvo2qO1rStCUWahUh2/RQt9XozEWPWJ9Oe6a7c=';
    var privateKey = '-----BEGIN RSA PRIVATE KEY-----\nMIICWwIBAAKBgQDdlatRjRjogo3WojgGHFHYLugdUWAY9iR3fy4arWNA1KoS8kVw33cJibXr8bvwUAUparCwlvdbH6dvEOfou0/gCFQsHUfQrSDv+MuSUMAe8jzKE4qW+jK+xQU9a03GUnKHkkle+Q0pX/g6jXZ7r1/xAK5Do2kQ+X5xK9cipRgEKwIDAQABAoGAD+onAtVye4ic7VR7V50DF9bOnwRwNXrARcDhq9LWNRrRGElESYYTQ6EbatXS3MCyjjX2eMhu/aF5YhXBwkppwxg+EOmXeh+MzL7Zh284OuPbkglAaGhV9bb6/5CpuGb1esyPbYW+Ty2PC0GSZfIXkXs76jXAu9TOBvD0ybc2YlkCQQDywg2R/7t3Q2OE2+yo382CLJdrlSLVROWKwb4tb2PjhY4XAwV8d1vy0RenxTB+K5Mu57uVSTHtrMK0GAtFr833AkEA6avx20OHo61Yela/4k5kQDtjEf1N0LfI+BcWZtxsS3jDM3i1Hp0KSu5rsCPb8acJo5RO26gGVrfAsDcIXKC+bQJAZZ2XIpsitLyPpuiMOvBbzPavd4gY6Z8KWrfYzJoI/Q9FuBo6rKwl4BFoToD7WIUS+hpkagwWiz+6zLoX1dbOZwJACmH5fSSjAkLRi54PKJ8TFUeOP15h9sQzydI8zJU+upvDEKZsZc/UhT/SySDOxQ4G/523Y0sz/OZtSWcol/UMgQJALesy++GdvoIDLfJX5GBQpuFgFenRiRDabxrE9MNUZ2aPFaFp+DyAe+b4nDwuJaW2LURbr8AEZga7oQj0uYxcYw==\n-----END RSA PRIVATE KEY-----';

    token = jwt.sign(
      {
        id: 91011,
        exp: 1,
        name: 'Mr. Snuffleupagus'
      },
      privateKey,
      {
        algorithm: 'RS256',
        issuer: 'https://lanetix.auth0.com',
        audience: 'urn:lanetix/api',
        subject: 'makeToken',
        headers: {
          kid: 'IJKL'
        }
      }
    );

    var jwks = {
      'keys': [
        {
          'alg': 'RS256',
          'kty': 'RSA',
          'use': 'sig',
          'x5c': [publicKey],
          'kid': 'IJKL'
        }
      ]
    };

    var mock = httpMocks.createMocks({
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'text/html'
      },
      cookies: {
        'XSRF-TOKEN': token
      },
      error: sinon.spy()
    });

    nock('https://lanetix.auth0.com')
    .get('/.well-known/jwks.json')
    .reply(200, jwks);

    next = function (e) {
      try {
        assert.deepEqual(mock.req.user, undefined);
        assert.deepEqual(e.name, 'TokenExpiredError');
        assert.deepEqual(e.message, 'jwt expired');
      } catch (err) {
        done(err);
      }
      done();
    };

    var jwtMiddleware = middleware(app);

    jwtMiddleware(mock.req, mock.res, next);
  });
});
