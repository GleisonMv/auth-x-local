const test = require('tap').test
const Index = require('../lib/index')
const error = require('../lib/error')

test('test config', function (assert) {
  try {
    assert.notEqual(new Index(), undefined)
  } catch (e) {
    assert.ok(e instanceof Error, 'should throw Error')
    assert.equal(e.message, error.CONFIG)
  }
  assert.end()
})

test('test config secret', function (assert) {
  try {
    assert.notEqual(new Index({}), undefined)
  } catch (e) {
    assert.ok(e instanceof Error, 'should throw Error')
    assert.equal(e.message, error.CONFIG_SECRET)
  }
  assert.end()
})

test('test config expire', function (assert) {
  try {
    assert.notEqual(new Index({ secret: '023012515' }), undefined)
  } catch (e) {
    assert.ok(e instanceof Error, 'should throw Error')
    assert.equal(e.message, error.CONFIG_EXPIRE)
  }
  assert.end()
})

test('test config set', function (assert) {
  try {
    assert.notEqual(new Index({ secret: '023012515', expire: '2h' }), undefined)
  } catch (e) {
    assert.error(e)
    assert.notOk(e)
  }
  assert.end()
})
