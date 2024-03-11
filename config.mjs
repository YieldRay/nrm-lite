import * as fs from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { REGISTRIES, findRegistryFromStream } from './registry.mjs'
import { isFile } from './utils.mjs'

/**
 * @param {boolean|undefined} local
 * @param {string} registryUrl
 */
export async function setRegistry(local, registryUrl) {
    const filePath = await getConfigPath(local)

    const fileStream = fs.createReadStream(filePath)
    const { registry, lines, registryLineNumber } =
        await findRegistryFromStream(fileStream)
    const newRegistryLine = `registry=${registryUrl}`

    if (!registry) {
        lines.push(newRegistryLine)
    } else if (registry === registryUrl) {
        // same, do nothing
        return
    } else {
        // number-1 is index
        lines[registryLineNumber - 1] = newRegistryLine
    }

    const result = lines.join('\n')
    return writeFile(filePath, result)
}

/**
 * @param {boolean|undefined} local
 */
export async function getRegistry(local) {
    const filePath = await getConfigPath(local)
    const fileStream = fs.createReadStream(filePath)
    const { registry } = await findRegistryFromStream(fileStream)
    return registry || REGISTRIES['npm']
}

/**
 * If `local` is not provided, check if local npmrc file exists
 * @param {boolean|undefined} local
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
