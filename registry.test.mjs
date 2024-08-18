import { test } from 'node:test'
import * as assert from 'node:assert'
import { Readable } from 'node:stream'
import { getRegistryFromStream } from './registry.mjs'

test('getRegistryFromStream()', async () => {
    assert.deepStrictEqual(
        await getRegistryFromStream(Readable.from('')),
        undefined,
    )

    assert.deepStrictEqual(
        await getRegistryFromStream(
            Readable.from(`registry=https://registry.npmmirror.com/`),
        ),
        'https://registry.npmmirror.com/',
    )

    assert.deepStrictEqual(
        await getRegistryFromStream(
            Readable.from(`//registry.npmjs.org/:_authToken=npm_123456

# strict-ssl=false
registry= https://registry.npmmirror.com/`),
        ),
        'https://registry.npmmirror.com/',
    )
})
