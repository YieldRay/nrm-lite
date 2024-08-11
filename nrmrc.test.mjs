import { test } from 'node:test'
import * as assert from 'node:assert'

import { encodeName, decodeName } from './nrmrc.mjs'

test('encodeName()', () => {
    assert.strictEqual(encodeName('name'), 'name')
    assert.strictEqual(encodeName('"'), '"')
    assert.strictEqual(encodeName(`"[`), String.raw`"[`)
    assert.strictEqual(encodeName(`""`), String.raw`"\"\""`)
})

test('decodeName()', () => {
    assert.strictEqual(decodeName('name'), 'name')
    assert.strictEqual(decodeName('"'), '"')
    assert.strictEqual(decodeName(String.raw`"[`), `"[`)
    assert.strictEqual(decodeName(String.raw`"["`), '[')
    assert.strictEqual(decodeName(String.raw`"\"["`), '"[')
    assert.strictEqual(decodeName(String.raw`"\"\""`), '""')
})
