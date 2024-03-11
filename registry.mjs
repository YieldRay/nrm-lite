import * as readline from 'node:readline'

/**
 * @type { Record<string,string>}
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
 *
 * Note that `registryLineNumber` is index + 1
 *
 * @param {NodeJS.ReadableStream} stream
 * @returns {Promise<{registry:string,lines:string[],registryLineNumber:number}|
 *                   {registry:null,lines:string[],registryLineNumber:null}>}
 * @see https://docs.npmjs.com/cli/configuring-npm/npmrc
 *
 * @example
 * const fileStream = fs.createReadStream(path)
 * findRegistryFromStream(fileStream)
 */
export async function findRegistryFromStream(stream) {
    const rl = readline.createInterface(stream)
    /**
     * @type {string[]}
     */
    const lines = []

    for await (const entireLine of rl) {
        lines.push(entireLine)

        let currLine = entireLine.trim()
        const keyName = 'registry'
        if (!currLine.startsWith(keyName)) continue
        currLine = currLine.slice(keyName.length).trimStart()
        if (!currLine.startsWith('=')) continue
        currLine = currLine.slice(1).trimStart()

        // now that current line is the registry url
        return { registry: currLine, lines, registryLineNumber: lines.length }
    }
    return { registry: null, registryLineNumber: null, lines }
}
