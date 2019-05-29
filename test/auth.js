const test = require('tap').test
const Local = require('../lib/index')

test('test auth error', function (assert) {
  const instance = new Local({
    secret: '261626',
    expire: '1H'
  })
  instance.test = true
  assert.notEqual(instance, undefined)
  assert.notEqual(instance.auth, undefined)
  instance.auth(1, 2, {
    send: function (obj) {
      assert.equal(obj.success, false)
      assert.equal(obj.token, undefined)
      assert.end()
    }
  })
})

test('test auth', function (assert) {
  const instance = new Local({
    secret: '261626',
    expire: '1H'
  })
  assert.notEqual(instance, undefined)
  assert.notEqual(instance.auth, undefined)
  instance.auth(1, 2, {
    send: function (obj) {
      assert.equal(obj.success, true)
      assert.notEqual(obj.token, undefined)
      assert.ok(true, obj.token)
      assert.end()
    }
  })
})
