const test = require('tap').test
const Local = require('../lib/index')

test('test headers', function (assert) {
  const instance = new Local({
    secret: '261626',
    expire: '1H'
  })
  assert.notEqual(instance, undefined)
  assert.notEqual(instance.onUserCheck, undefined)
  instance.onUserCheck({}, function (err, isAuth) {
    assert.error(err)
    assert.equal(isAuth, false)
    assert.end()
  })
})

test('test headers.authorization', function (assert) {
  const instance = new Local({
    secret: '261626',
    expire: '1H'
  })
  assert.notEqual(instance, undefined)
  assert.notEqual(instance.onUserCheck, undefined)
  instance.onUserCheck({ headers: {} }, function (err, isAuth) {
    assert.error(err)
    assert.equal(isAuth, false)
    assert.end()
  })
})

test('test getBearer error', function (assert) {
  const instance = new Local({
    secret: '261626',
    expire: '1H'
  })
  assert.notEqual(instance, undefined)
  assert.notEqual(instance.onUserCheck, undefined)
  instance.onUserCheck({ headers: { authorization: 'Bearer' } }, function (err, isAuth) {
    assert.equal(err, null)
    assert.equal(isAuth, false)
    assert.end()
  })
})

test('test onUserCheck invalid token', function (assert) {
  const instance = new Local({
    secret: '261626',
    expire: '1H'
  })
  assert.notEqual(instance, undefined)
  assert.notEqual(instance.onUserCheck, undefined)
  instance.onUserCheck({ headers: { authorization: 'Bearer 5615142510' } }, function (err, isAuth) {
    assert.notEqual(err, null)
    assert.equal(isAuth, false)
    assert.end()
  })
})

test('test onUserCheck token ok', function (assert) {
  const instance = new Local({
    secret: '261626',
    expire: '1H'
  })
  assert.notEqual(instance, undefined)
  assert.notEqual(instance.onUserCheck, undefined)
  instance.auth(1, 2, {
    send: function (obj) {
      instance.onUserCheck({ headers: { authorization: 'Bearer ' + obj.token } }, function (err, isAuth) {
        assert.equal(err, null)
        assert.equal(isAuth, true)
        assert.end()
      })
    }
  })
})
