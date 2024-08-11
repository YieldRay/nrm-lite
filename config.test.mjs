import { test } from 'node:test'
import * as assert from 'node:assert'
import { getConfigPath } from './config.mjs'

test('getConfigPath()', async () => {
    assert.ok((await getConfigPath(false)).endsWith('/.npmrc'))
})
