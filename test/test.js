const test = require('tap').test
const Fastify = require('fastify')
const Auth = require('../lib/index')
const axios = require('axios')
const formbody = require('fastify-formbody')

function instance (cb, expire = false, empty = false, fake = false) {
  return function (t) {
    const fastify = Fastify()
    fastify.register(formbody)

    const authx = Auth(fastify, {
      api: empty ? undefined : '/api/token',
      username: empty ? undefined : 'usr',
      password: empty ? undefined : 'pwd',
      expire: empty ? undefined : (expire ? 1 : 60 * 60),
      secret: empty ? undefined : '0231561515s15210sd5f5sd1',
      fakeErrorSign: fake,

      user: (username, password, callback) => {
        if (username === 'server' && password === 'admin') {
          callback(null, 1, {
            username: 'server'
          })
        } else if (username === 'user-usr' && password === 'user-pwd') {
          callback(null, 2, {
            username: 'user'
          })
        } else {
          callback(new Error('not found user'))
        }
      },
      permission: (group, permission, callback) => {
        if (group === 1 && permission === 200) {
          callback(null, true)
        } else {
          callback(null, false)
        }
      }
    })

    fastify.get('/auth', authx.verify(authx.api, true, (request, reply) => {
      reply.send({ success: true, text: 'hello world' })
    }))

    fastify.get('/not-auth', authx.verify(authx.api, false, (request, reply) => {
      reply.send({ success: true, text: 'hello world' })
    }))

    fastify.get('/permission', authx.permission(authx.api, 200, (request, reply) => {
      reply.send({ success: true, text: 'hello world' })
    }))

    t.tearDown(() => fastify.close())

    fastify.listen(0, err => {
      t.error(err)
      fastify.server.unref()
      cb(t, fastify, authx, fastify.server.address().port)
    })
  }
}

test('Test auth, configuration empty', instance((t, fastify, authx, port) => {
  axios({ method: 'POST', url: `http://0.0.0.0:${port}/api/auth` })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.error, 11)
      t.end()
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}, false, true))

test('Test auth, sign error', instance((t, fastify, authx, port) => {
  axios({
    method: 'POST',
    url: `http://0.0.0.0:${port}/api/token`,
    data: {
      usr: 'server',
      pwd: 'admin'
    }
  })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.error, 13)
      t.end()
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}, false, false, true))

test('Test auth, secret invalid', instance((t, fastify, authx, port) => {
  axios({ method: 'POST', url: `http://0.0.0.0:${port}/api/auth` })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.error, 11)
      t.end()
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}, false, true))

test('Test auth, body empty', instance((t, fastify, authx, port) => {
  axios({ method: 'POST', url: `http://0.0.0.0:${port}/api/token` })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.error, 11)
      t.end()
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}))

test('Test auth, incorrect user', instance((t, fastify, authx, port) => {
  axios({
    method: 'POST',
    url: `http://0.0.0.0:${port}/api/token`,
    data: {
      usr: 'fake',
      pwd: 'fake'
    }
  })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.error, 12)
      t.end()
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}))

test('Test auth, token generate', instance((t, fastify, authx, port) => {
  axios({
    method: 'POST',
    url: `http://0.0.0.0:${port}/api/token`,
    data: {
      usr: 'server',
      pwd: 'admin'
    }
  })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.success, true)
      t.ok(true, response.data.token)
      t.end()
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}))

test('Test auth, no token, auth=true', instance((t, fastify, authx, port) => {
  axios({ method: 'GET', url: `http://0.0.0.0:${port}/auth` })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.error, 2)
      t.end()
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}))

test('Test auth, token, auth=true', instance((t, fastify, authx, port) => {
  axios({
    method: 'POST',
    url: `http://0.0.0.0:${port}/api/token`,
    data: {
      usr: 'server',
      pwd: 'admin'
    }
  })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.success, true)
      t.ok(true, response.data.token)
      axios({ method: 'GET', url: `http://0.0.0.0:${port}/auth`, headers: { authorization: 'Bearer ' + response.data.token } })
        .then(function (response) {
          t.strictEqual(response.status, 200)
          t.strictEqual(response.data.success, true)
          t.end()
        })
        .catch(e => {
          t.error(e)
          t.end()
        })
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}))

test('Test auth, invalid token, auth=true', instance((t, fastify, authx, port) => {
  axios({
    method: 'POST',
    url: `http://0.0.0.0:${port}/api/token`,
    data: {
      usr: 'server',
      pwd: 'admin'
    }
  })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.success, true)
      t.ok(true, response.data.token)
      axios({ method: 'GET', url: `http://0.0.0.0:${port}/auth`, headers: { authorization: 'Bearer ' + response.data.token + '151515151' } })
        .then(function (response) {
          t.strictEqual(response.status, 200)
          t.strictEqual(response.data.success, false)
          t.end()
        })
        .catch(e => {
          t.error(e)
          t.end()
        })
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}))

test('Test auth, token, auth=true, expire', instance((t, fastify, authx, port) => {
  axios({
    method: 'POST',
    url: `http://0.0.0.0:${port}/api/token`,
    data: {
      usr: 'server',
      pwd: 'admin'
    }
  })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.success, true)
      t.ok(true, response.data.token)
      setTimeout(function () {
        axios({ method: 'GET', url: `http://0.0.0.0:${port}/auth`, headers: { authorization: 'Bearer ' + response.data.token } })
          .then(function (response) {
            t.strictEqual(response.status, 200)
            t.strictEqual(response.data.success, false)
            t.end()
          })
          .catch(e => {
            t.error(e)
            t.end()
          })
      }, 1000)
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}, true))

test('Test auth, no token, auth=false', instance((t, fastify, authx, port) => {
  axios({ method: 'GET', url: `http://0.0.0.0:${port}/not-auth` })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.success, true)
      t.end()
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}))

test('Test auth, token, authorization invalid', instance((t, fastify, authx, port) => {
  axios({
    method: 'POST',
    url: `http://0.0.0.0:${port}/api/token`,
    data: {
      usr: 'server',
      pwd: 'admin'
    }
  })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.success, true)
      t.ok(true, response.data.token)
      axios({ method: 'GET', url: `http://0.0.0.0:${port}/auth`, headers: { authorization: '01023 ' + response.data.token } })
        .then(function (response) {
          t.strictEqual(response.status, 200)
          t.strictEqual(response.data.error, 2)
          t.end()
        })
        .catch(e => {
          t.error(e)
          t.end()
        })
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}))

test('Test auth, token, auth=false', instance((t, fastify, authx, port) => {
  axios({
    method: 'POST',
    url: `http://0.0.0.0:${port}/api/token`,
    data: {
      usr: 'server',
      pwd: 'admin'
    }
  })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.success, true)
      t.ok(true, response.data.token)
      axios({ method: 'GET', url: `http://0.0.0.0:${port}/not-auth`, headers: { authorization: 'Bearer ' + response.data.token } })
        .then(function (response) {
          t.strictEqual(response.status, 200)
          t.strictEqual(response.data.error, 3)
          t.end()
        })
        .catch(e => {
          t.error(e)
          t.end()
        })
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}))

test('Test permission, no token', instance((t, fastify, authx, port) => {
  axios({ method: 'GET', url: `http://0.0.0.0:${port}/permission` })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.error, 2)
      t.end()
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}))

test('Test auth, permission, auth=true', instance((t, fastify, authx, port) => {
  axios({
    method: 'POST',
    url: `http://0.0.0.0:${port}/api/token`,
    data: {
      usr: 'server',
      pwd: 'admin'
    }
  })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.success, true)
      t.ok(true, response.data.token)
      axios({ method: 'GET', url: `http://0.0.0.0:${port}/permission`, headers: { authorization: 'Bearer ' + response.data.token } })
        .then(function (response) {
          t.strictEqual(response.status, 200)
          t.strictEqual(response.data.success, true)
          t.end()
        })
        .catch(e => {
          t.error(e)
          t.end()
        })
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}))

test('Test auth, permission, auth=true', instance((t, fastify, authx, port) => {
  axios({
    method: 'POST',
    url: `http://0.0.0.0:${port}/api/token`,
    data: {
      usr: 'user-usr',
      pwd: 'user-pwd'
    }
  })
    .then(function (response) {
      t.strictEqual(response.status, 200)
      t.strictEqual(response.data.success, true)
      t.ok(true, response.data.token)
      axios({ method: 'GET', url: `http://0.0.0.0:${port}/permission`, headers: { authorization: 'Bearer ' + response.data.token } })
        .then(function (response) {
          t.strictEqual(response.status, 200)
          t.strictEqual(response.data.success, false)
          t.ok(true, response.data.error)
          t.end()
        })
        .catch(e => {
          t.error(e)
          t.end()
        })
    })
    .catch(e => {
      t.error(e)
      t.end()
    })
}))
