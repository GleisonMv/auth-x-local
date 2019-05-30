const authx = require('fast-auth-x')
const token = require('jsonwebtoken')
const error = require('./error')

function getBearer (string, callback) {
  callback(string.length > 7 && string.startsWith('Bearer ')
    ? string.substring(7, string.length)
    : null)
}

class Local extends authx.strategy {
  constructor (config) {
    super()
    if (!config) throw new Error(error.CONFIG)
    else if (!config.secret) throw new Error(error.CONFIG_SECRET)
    else if (!config.expire) throw new Error(error.CONFIG_EXPIRE)
    else this['config'] = config
    this.test = false
  }

  auth (id, group, reply) {
    const secret = this['config'].secret
    const expire = this['config'].expire
    const test = this.test
    token.sign({ id: id, group: group }, secret, { expiresIn: expire }, (err, token) => {
      if (err || test) {
        reply.send({ success: false, error: error.AUTH })
      } else {
        reply.send({ success: true, token: token })
      }
    })
  }

  onError (request, reply, error) {
    reply.send({ success: false, error })
  }

  onPermissionCheck (request, group, done) {
    done(null, request.user.group === group)
  }

  onUserCheck (request, done) {
    const secret = this['config'].secret
    if (!request.headers || !request.headers.authorization) {
      done(null, false)
    } else {
      getBearer(request.headers.authorization, (access) => {
        if (!access) {
          done(null, false)
        } else {
          token.verify(access, secret, (error, decoded) => done(error, !!(request.user = decoded)))
        }
      })
    }
  }
}
module.exports = Local
