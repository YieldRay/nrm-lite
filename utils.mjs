import { stat } from 'node:fs/promises'
import { getAllRegistries } from './config.mjs'

/**
 * @param {string} filePath
 * @noexcept
 */
export const isFile = async (filePath) =>
    await stat(filePath)
        .then((stat) => stat.isFile())
        .catch((_) => false)

/**
 * @param {string} str
 * @param {number} begin
 * @param {number} end
 */
const color = (str, begin, end) => `\u001b[${begin}m${str}\u001b[${end}m`

/**
 * Check out https://github.com/YieldRay/terminal-sequences/blob/main/sgr/style.ts
 */
const c = {
    /** @param {string} str*/
    blue: (str) => color(str, 34, 39),
    /** @param {string} str*/
    red: (str) => color(str, 31, 39),
    /** @param {string} str*/
    green: (str) => color(str, 32, 39),
    /** @param {string} str*/
    yellow: (str) => color(str, 33, 39),
    /** @param {string} str*/
    magenta: (str) => color(str, 35, 39),
    /** @param {string} str*/
    cyan: (str) => color(str, 36, 39),
    /** @param {string} str*/
    gray: (str) => color(str, 90, 39),

    /** @param {string} str*/
    bold: (str) => color(str, 1, 22),
    /** @param {string} str*/
    italic: (str) => color(str, 3, 23),
}

export default c

/**
 * @param {string} currentRegistryUrl
 * @param {Array<{name:string,url:string,timeSpent?:number|null}>=} registriesInfo
 * @param {number=} timeoutLimit - milliseconds
 */
export async function printRegistries(
    currentRegistryUrl,
    registriesInfo,
    timeoutLimit,
) {
    const registries = await getAllRegistries()
    registriesInfo ||= Array.from(registries.entries()).map(([name, url]) => ({
        name,
        url,
    }))

    const maxNameLength = Math.max(
        ...registriesInfo.map(({ name }) => name.length),
    )
    /**
     * @type {number=}
     */
    let maxUrlLength = undefined

    for (let { name, url, timeSpent } of registriesInfo) {
        if (timeoutLimit) {
            // lazy compute
            if (!maxUrlLength)
                maxUrlLength = Math.max(
                    ...registriesInfo.map(({ url }) => url.length),
                )
        }

        let row = `${name.padEnd(maxNameLength)} → ${
            maxUrlLength ? url.padEnd(maxUrlLength) : url
        }`
        if (url === currentRegistryUrl) row = c.blue(row)

        if (timeoutLimit) {
            if (!timeSpent) {
                row += c.red(` (Error)`)
            } else if (timeSpent >= timeoutLimit) {
                row += c.red(` (>${(timeoutLimit / 1000).toFixed(1)}s)`)
            } else if (timeSpent >= timeoutLimit / 2) {
                row += c.yellow(` (${(timeSpent / 1000).toFixed(2)}s)`)
            } else {
                row += c.green(` (${(timeSpent / 1000).toFixed(2)}s)`)
            }
        }
        console.log(row)
    }
}
