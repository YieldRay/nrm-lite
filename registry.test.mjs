import { test } from 'node:test'
import * as assert from 'node:assert'
import { Readable } from 'node:stream'
import { findRegistryFromStream } from './registry.mjs'

test('test findRegistryFromStream()', async () => {
    assert.deepStrictEqual(await findRegistryFromStream(Readable.from('')), {
        lines: [],
        registry: null,
        registryLineNumber: null,
    })

    const text2 = `registry=https://registry.npmmirror.com/`

    assert.deepStrictEqual(await findRegistryFromStream(Readable.from(text2)), {
        registry: 'https://registry.npmmirror.com/',
        registryLineNumber: 1,
        lines: [text2],
    })

    const text3 = `//registry.npmjs.org/:_authToken=npm_123456

# strict-ssl=false
registry= https://registry.npmmirror.com/`

    assert.deepStrictEqual(await findRegistryFromStream(Readable.from(text3)), {
        registry: 'https://registry.npmmirror.com/',
        registryLineNumber: 4,
        lines: text3.split(/\n/g),
    })
})
