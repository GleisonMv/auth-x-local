const AuthX = require('fast-auth-x')
const JWT = require('jsonwebtoken')

module.exports = function (router, local) {
  if (!local.api) local.api = '/api/auth'
  if (!local.username) local.username = 'username'
  if (!local.password) local.password = 'password'
  if (!local.expire) local.expire = 60 * 60
  if (!local.secret) local.secret = 'fXYzGmyaKJwfqyskv28kx3eOhasjQ46h'

  const instance = new AuthX({ strategy: {} })
  instance.strategy = undefined

  instance.api = {
    reply: (request, reply, error) => {
      reply.send({ success: false, error: error })
    },
    verify: (request, callback) => {
      if (!request.headers.authorization) {
        callback(null, false)
      } else {
        const authorization = request.headers.authorization
        if (authorization.startsWith('Bearer ')) {
          JWT.verify(authorization.substring(7, authorization.length), local.secret, {}, (error, decoded) => {
            callback(error, !!(request.auth = decoded))
          })
        } else {
          callback(null, false)
        }
      }
    },
    permission: (request, permission, callback) => {
      local.permission(request.auth.group, permission, callback)
    }
  }

  router.post(local.api, instance.verify(instance.api, false, (request, reply) => {
    if (!request.body || !request.body[local.username] || !request.body[local.password]) {
      reply.send({ success: false, error: 11 })
    } else {
      local.user(request.body[local.username], request.body[local.password], (error, group, payload) => {
        if (error) {
          reply.send({ success: false, error: 12 })
        } else {
          JWT.sign({ group: group, data: payload }, local.secret, { expiresIn: local.expire }, (error, token) => {
            if (local.fakeErrorSign === true || error) {
              reply.send({ success: false, error: 13 })
            } else {
              reply.send({ success: true, token: token })
            }
          })
        }
      })
    }
  }))

  return instance
}
