const test = require('tap').test
const Local = require('../lib/index')

test('test onPermission not allow', function (assert) {
  const instance = new Local({
    secret: '261626',
    expire: '1H'
  })
  assert.notEqual(instance, undefined)
  assert.notEqual(instance.onPermissionCheck, undefined)
  let request = {}
  instance.auth(1, 2019, {
    send: function (obj) {
      request = { headers: { authorization: 'Bearer ' + obj.token } }
      instance.onUserCheck(request, function (err, isAuth) {
        assert.equal(err, null)
        assert.equal(isAuth, true)
        instance.onPermissionCheck(request, 2015, function (err, isPermission) {
          assert.equal(err, null)
          assert.equal(isPermission, false)
          assert.end()
        })
      })
    }
  })
})

test('test onPermission allow', function (assert) {
  const instance = new Local({
    secret: '261626',
    expire: '1H'
  })
  assert.notEqual(instance, undefined)
  assert.notEqual(instance.onPermissionCheck, undefined)
  let request = {}
  instance.auth(1, 2019, {
    send: function (obj) {
      request = { headers: { authorization: 'Bearer ' + obj.token } }
      instance.onUserCheck(request, function (err, isAuth) {
        assert.equal(err, null)
        assert.equal(isAuth, true)
        instance.onPermissionCheck(request, 2019, function (err, isPermission) {
          assert.equal(err, null)
          assert.equal(isPermission, true)
          assert.end()
        })
      })
    }
  })
})
