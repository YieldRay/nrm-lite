import { test } from 'node:test'
import { add } from './add.mjs'
import * as assert from 'node:assert'

test('test add()', async () => {
    assert.equal(add(1, 1), 2)
    assert.equal(add(1, -1), 0)
})
