import { stat } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { platform } from 'node:os'
import { getAllRegistries } from './config.mjs'

/**
 * ANSI escape codes mapping
 * @typedef {keyof typeof styles} Format
 */
const styles = {
    // Reset
    reset: '\x1b[0m',

    // Text styles
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',
    strikethrough: '\x1b[9m',

    // Text colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    grey: '\x1b[90m',

    // Bright text colors
    brightRed: '\x1b[91m',
    brightGreen: '\x1b[92m',
    brightYellow: '\x1b[93m',
    brightBlue: '\x1b[94m',
    brightMagenta: '\x1b[95m',
    brightCyan: '\x1b[96m',
    brightWhite: '\x1b[97m',

    // Background colors
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
}

/**
 * Basic implementation of util.styleText for formatting text with ANSI colors
 * @param {Format | Format[]} format - A text format or an Array of text formats
 * @param {string} text - The text to be formatted
 * @returns {string} The formatted text with ANSI escape codes
 */
export function styleText(format, text) {
    const formats = Array.isArray(format) ? format : [format]
    // Build the opening escape sequences
    let openCodes = ''
    for (const fmt of formats)
        if (fmt in styles) openCodes += styles[/** @type {Format} */ (fmt)]
    // Return formatted text with reset at the end
    return openCodes + text + styles.reset
}

/**
 * @param {string} filePath
 * @noexcept
 */
export const isFile = async (filePath) =>
    await stat(filePath)
        .then((stat) => stat.isFile())
        .catch((_) => false)

export const _execFileAsync = promisify(execFile)
/**
 * @param {string} file
 * @param {string[]} args
 */
export async function execFileAsync(file, args) {
    if (platform() === 'win32') {
        // start /b cmd /c <file> <args>
        return _execFileAsync('cmd', ['/c', file, ...args], {
            windowsHide: true,
        })
    } else {
        return _execFileAsync(file, args)
    }
}

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
        if (url === currentRegistryUrl) row = styleText('blue', row)

        if (timeoutLimit) {
            if (!timeSpent) {
                row += styleText('red', ` (Error)`)
            } else if (timeSpent >= timeoutLimit) {
                row += styleText(
                    'red',
                    ` (>${(timeoutLimit / 1000).toFixed(1)}s)`,
                )
            } else if (timeSpent >= timeoutLimit / 2) {
                row += styleText(
                    'yellow',
                    ` (${(timeSpent / 1000).toFixed(2)}s)`,
                )
            } else {
                row += styleText(
                    'green',
                    ` (${(timeSpent / 1000).toFixed(2)}s)`,
                )
            }
        }
        console.log(row)
    }
}
