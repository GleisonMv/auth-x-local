const test = require('tap').test
const Local = require('../lib/index')

test('test headers', function (assert) {
  const instance = new Local({
    secret: '261626',
    expire: '1H'
  })
  assert.notEqual(instance, undefined)
  assert.notEqual(instance.onError, undefined)
  instance.onError({}, {
    send: function (obj) {
      assert.equals(obj.success, false)
      assert.equals(obj.error, 2019)
      assert.end()
    }
  }, 2019)
})
