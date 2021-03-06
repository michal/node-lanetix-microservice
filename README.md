# lanetix-microservice

Wrapper for writing JWT-authenticated microservices for internal use within Lanetix.

## Installation

`npm install --save lanetix-microservice`

## Usage

Optimally, the creation of the express app should be separated out from the creation of the HTTP server for ease of testing.

```
// server.js - build up your express app

import express from 'express'
import { server } from 'lanetix-microservice'
import fooRouter from './routers/foo'
import bonkRouter from './routers/bonk'

const app = express()
export default server(app, {
  postAuthentication: [
    // middleware goes here
  ],

  routers: {
    '/foo': fooRouter,
    '/bonk': bonkRouter
  }
})

// web.js - bind to a port and launch your application

import { createServer } from 'http'
import server from './server'

const port = 9999
const httpServer = createServer(server)
httpServer.listen(port, () => {
  console.log(`listening on port ${port}`)
})
```

## Logging

Logging convenience methods are appended to the `request` object that automatically append the `x-request-id`, if available.

### Available logging methods

- error
- info
- log
- warn

### Usage

```JavaScript
module.exports = (req, res, next) {
  req.error('oh no!')
  next()
  // output will be `> 12345 oh no!` where 12345 is the request id
}
```

## Testing

The `test` client allows you to make requests to an in-memory version of your application. GET, POST, PATCH, PUT, and DELETE are supported HTTP verbs.

A user can be impersonated by providing either:
- A `user_id` property directly on the context
- Or a `user` property on the context that has an `id`

```
import { test } from 'lanetix-microservice'
import server from '../server'

describe('Microservice tests', () => {
  it('should return 200 OK for a GET to /foo', () =>
    test.serve(server, { user_id: 1337 })
      .get('/foo')
      .expect(200)
  )

  it('should return 201 Created for a POST to /bonk', () =>
    test.serve(server, { user_id: 1337 })
      .post('/bonk')
      .send({ data: 'hello' })
      .expect(201)
  )
})
```

## Authorization

In order to avoid a `401 unauthorized` response, an authorization token should be present on each request.

##### access_token (query string)

You'll need this for native get requests that aren't capable of putting headers on the request. These will be traditional
anchor tags:

`<a href ="http://localhost:5015/download/csv?access_token=accesstoken">`

##### bearer token (request header)

The bearer token approach will be the most common. API calls will employ this strategy:

```js
var request = {
  method: 'POST',
  url: 'http://localhost:5015/api/call',
  headers: {
    'Authorization': 'Bearer accesstoken' // this is the important part
  }
};

// send request
```
