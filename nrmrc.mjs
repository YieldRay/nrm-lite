import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import { appendFile, writeFile } from 'node:fs/promises'

const nrmrcPath = resolve(homedir(), '.nrmrc')

/**
 * Read config line by line, stop when invalid.
 * Warn that this function may throws, the caller SHOULD handle any error
 */
export async function readNrmrc() {
    const rl = createInterface(createReadStream(nrmrcPath))
    /**
     * false: [name]
     * true : registry=https://registry.url
     */
    let state = false
    let name = ''
    let url = ''
    /** @type {Array<[string, string]>} */
    const entries = []

    for await (let line of rl) {
        line = line.trim()
        if (line.length === 0) continue
        if (state) {
            const prefix = 'registry='
            if (!line.startsWith(prefix)) continue
            url = line.slice(prefix.length).trim() // remove prefix
            entries.push([name, url])
        } else {
            if (!(line.startsWith('[') && line.endsWith(']'))) break
            name = line.slice(1, -1)
            if (name.length === 0) break
            name = decodeName(name)
        }
        state = !state
    }
    return new Map(entries)
}

// name is `name`, not `[name]`
// the '[' and ']' should be removed first

/**
 * @param {string} name
 */
function encodeName(name) {
    const s = JSON.stringify(name).slice(1, -1)
    if (name === s) return name
    return `"${s}"`
}

/**
 * @param {string} name
 */
function decodeName(name) {
    if (name.startsWith('"') && name.endsWith('"')) {
        return JSON.parse(name)
    } else {
        return name
    }
}

/**
 * @param {string} url
 */
function resolveUrl(url) {
    if (!url.endsWith('/')) url = url + '/'
    if (url.startsWith('/') || url.startsWith('\\')) return resolve(url)
    return url
}

/**
 * @param {string} name
 * @param {string} url
 */
export async function appendNrmrc(name, url) {
    return await appendFile(
        nrmrcPath,
        `[${encodeName(name)}]\nregistry=${resolveUrl(url)}\n\n`
    )
}

/**
 * @param {Map<string, string>} registries
 */
export async function writeNrmrc(registries) {
    return await writeFile(
        nrmrcPath,
        Array.from(registries.entries())
            .map(
                ([name, url]) =>
                    `[${encodeName(name)}]\nregistry=${resolveUrl(url)}`
            )
            .join('\n\n')
    )
}
