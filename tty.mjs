import { REGISTRIES } from './registry.mjs'

/**
 * @param {string} str
 * @param {number} begin
 * @param {number} end
 */
const color = (str, begin, end) => `\u001b[${begin}m${str}\u001b[${end}m`

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
 * @param {string} registryUrl
 */
export function printRegistries(registryUrl) {
    let maxNameLength = 0

    const registries = Object.entries(REGISTRIES).map(([name, url]) => {
        maxNameLength = Math.max(maxNameLength, name.length)
        return { name, url, highlight: url === registryUrl }
    })

    for (const { name, url, highlight } of registries) {
        const row = `${name.padEnd(maxNameLength)} → ${url}`
        console.log(highlight ? c.blue(row) : row)
    }
}
