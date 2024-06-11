import * as fs from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import {
    REGISTRIES,
    getRegistryFromStream,
    setRegistryFromStream,
} from './registry.mjs'
import { isFile } from './utils.mjs'

/**
 * @param {boolean|undefined} local
 * @param {string} registryUrl
 */
export async function setRegistry(local, registryUrl) {
    const filePath = await getConfigPath(local)
    try {
        const fileStream = fs.createReadStream(filePath)
        const result = await setRegistryFromStream(fileStream, registryUrl)
        return writeFile(filePath, result)
    } catch {
        return writeFile(filePath, `registry=${registryUrl}`)
    }
}

/**
 * @param {boolean=} local
 */
export async function getRegistry(local) {
    const filePath = await getConfigPath(local)
    try {
        const fileStream = fs.createReadStream(filePath) // the file may not exists
        return (await getRegistryFromStream(fileStream)) || REGISTRIES['npm']
    } catch {
        // when rc file not found, fallback registry to default
        return REGISTRIES['npm']
    }
}

/**
 * If `local` is not provided, check if local npmrc file exists
 * @param {boolean=} local
 * @noexcept
 */
export async function getConfigPath(local) {
    const rc = '.npmrc'
    const detectLocal = typeof local !== 'boolean' && (await isFile(rc))
    if (local || detectLocal) {
        return rc
    }
    return `${homedir().replaceAll('\\', '/')}/${rc}`
}
