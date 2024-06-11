import * as readline from 'node:readline'

/**
 * @type {Record<string,string>}
 */
export const REGISTRIES = {
    npm: 'https://registry.npmjs.org/',
    yarn: 'https://registry.yarnpkg.com/',
    github: 'https://npm.pkg.github.com/',
    taobao: 'https://registry.npmmirror.com/',
    npmMirror: 'https://skimdb.npmjs.com/registry/',
    tencent: 'https://mirrors.cloud.tencent.com/npm/',
}

/**
 * Returns undefined when line does not contain registry, or registry as string
 * @param {string} line
 */
function checkLine(line) {
    let currLine = line.trim()
    const keyName = 'registry'
    if (!currLine.startsWith(keyName)) return
    currLine = currLine.slice(keyName.length).trimStart()
    if (!currLine.startsWith('=')) return
    return currLine.slice(1).trimStart()
}

/**
 * @param {NodeJS.ReadableStream} stream
 * @returns {Promise<string|undefined>}
 * @see https://docs.npmjs.com/cli/configuring-npm/npmrc
 */
export async function getRegistryFromStream(stream) {
    const rl = readline.createInterface(stream)
    for await (const line of rl) {
        const r = checkLine(line)
        if (r) return r
    }
}

/**
 * Returns the proceed rc content
 * @param {NodeJS.ReadableStream} stream
 * @param {string} registryUrl
 * @returns {Promise<string>}
 */
export async function setRegistryFromStream(stream, registryUrl) {
    const rl = readline.createInterface(stream)
    const lines = []
    for await (const line of rl) {
        const r = checkLine(line)
        if (r) {
            lines.push(`registry=${registryUrl}`)
        } else {
            lines.push(line)
        }
    }
    return lines.join('\n')
}

/**
 * Returns `Infinity` when execeed timeout, and `null` when network error
 * @param {string} url
 * @param {number} timeoutLimit - in milliseconds
 */
export async function speedTest(url, timeoutLimit) {
    try {
        const beginTime = Date.now()
        await fetch(url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(timeoutLimit),
        })
        const timeSpent = Date.now() - beginTime
        return timeSpent > timeoutLimit ? Infinity : timeSpent
    } catch (e) {
        if (e instanceof DOMException) {
            return Infinity
        }
        return null // Network Error
    }
}
