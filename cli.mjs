#!/usr/bin/env node
import process from 'node:process'
import { parseArgs } from 'node:util'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { platform } from 'node:os'
import {
    getRegistry,
    setRegistry,
    getConfigPath,
    getAllRegistries,
} from './config.mjs'
import { speedTest } from './registry.mjs'
import { styleText, execFileAsync, printRegistries } from './utils.mjs'
import { appendNrmrc, readNrmrc, writeNrmrc } from './nrmrc.mjs'

// https://nodejs.org/api/util.html#utilparseargsconfig
const { values, positionals } = parseArgs({
    options: {
        help: {
            type: 'boolean',
            multiple: false,
            short: 'h',
            default: false,
        },
        local: {
            type: 'boolean',
            short: 'l',
            default: false,
        },
        version: {
            type: 'boolean',
            short: 'v',
            default: false,
        },
    },
    strict: true,
    allowPositionals: true,
})

if (values.help) {
    help()
}

const command = positionals[0] || ''
const { local } = values

switch (command) {
    case 'h':
    case 'help':
        help()
        break
    // @ts-ignore intentional fallthrough here
    case '':
        if (values.version) help(true)
    case 'ls':
        ls()
        break
    case 'test': {
        const timeout = positionals[1] || '2'
        test(Number.parseFloat(timeout) * 1000)
        break
    }
    case 'add': {
        const name = positionals[1]
        const url = positionals[2]
        add(name, url)
        break
    }
    case 'del': {
        const name = positionals[1]
        del(name)
        break
    }
    case 'rc':
        rc()
        break
    case 'use': {
        const name = positionals[1]
        use(name)
        break
    }
    default:
        console.log(`Unknown command '${command}'\n`)
        process.exit(1)
}

/**
 * @param {boolean=} v - only print version number
 */
function help(v) {
    // assert json will cause ExperimentalWarning. so we use this instead
    // import pkg from './package.json' assert { type: 'json' }
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const pkg = JSON.parse(
        readFileSync(join(__dirname, 'package.json'), 'utf-8'),
    )
    if (v) {
        console.log('v' + pkg.version)
        process.exit(1)
    }
    console.log(`${styleText('green', pkg.name)} v${pkg.version}

${styleText('bold', 'Usage:')}
    nrml ls                List registries
    nrml use  ${styleText('grey', '<name>')}       Use registry
    nrml test ${styleText(
        'grey',
        '[<timeout>]',
    )}  Test registry speed, optional timeout in second (default: 2)
    nrml add  ${styleText('grey', '<name>')} ${styleText(
        'grey',
        '<url>',
    )} Add custom registry
    nrml del  ${styleText('grey', '<name>')}       Delete custom registry
    nrml rc                Open .npmrc file
    nrml help              Show this help
${styleText('bold', 'Global Options:')}
    --local                Use local .npmrc file, rather than the global one (default: false)`)
    process.exit(1)
}

async function ls() {
    const currentRegistry = await getRegistry(local)
    await printRegistries(currentRegistry)
}

/**
 * @param {string} name
 */
async function use(name) {
    if (!name) {
        console.log(`Please provide a name!`)
        process.exit(-1)
    }

    const registries = await getAllRegistries()
    const names = Array.from(registries.keys())
    if (!names.includes(name)) {
        console.log(
            `'${name}' is not in ${styleText('grey', `[${names.join('|')}]`)}`,
        )
        process.exit(-1)
    }

    /** @type {*} */
    const registryUrl = registries.get(name)
    await setRegistry(local, registryUrl)
    await printRegistries(registryUrl)
}

/**
 * @param {number} timeoutLimit
 */
async function test(timeoutLimit) {
    const registries = await getAllRegistries()
    const info = await Promise.all(
        Array.from(registries.entries()).map(async ([name, url]) => ({
            name,
            url,
            timeSpent: await speedTest(url, timeoutLimit),
        })),
    )

    const currentRegistry = await getRegistry(local)
    await printRegistries(currentRegistry, info, timeoutLimit)
    process.exit(0)
}

/**
 * @param {string} name
 * @param {string} url
 */
async function add(name, url) {
    if (!name) {
        console.log(`Please provide a name!`)
        process.exit(-1)
    }

    if (!url) {
        console.log(`Please provide an url!`)
        process.exit(-1)
    }

    const registries = await getAllRegistries()
    const names = Array.from(registries.keys())
    if (names.includes(name)) {
        console.log(
            `Registry name ${styleText('magenta', name)} already exists!`,
        )
        process.exit(-1)
    } else {
        await appendNrmrc(name, url)
        console.log(
            `Registry ${styleText(
                'magenta',
                name,
            )} has been added, run ${styleText(
                'green',
                `nrml use ${name}`,
            )} to use.`,
        )
    }
}

/**
 * @param {string} name
 */
async function del(name) {
    if (!name) {
        console.log(`Please provide a name!`)
        process.exit(-1)
    }

    const nrmrc = await readNrmrc().catch(() => new Map())
    nrmrc.delete(name)
    await writeNrmrc(nrmrc)
    console.log(`Registry ${styleText('magenta', name)} has been deleted.`)
}

async function rc() {
    const filePath = await getConfigPath(local)
    try {
        // try vscode first
        await execFileAsync('code', [filePath])
    } catch {
        /** @type {Record<string, string>} */
        const map = { win32: 'start', darwin: 'open', linux: 'xdg-open' }
        const cmd = map[platform()]

        let shouldRunEditor = false
        try {
            if (cmd) await execFileAsync(cmd, [filePath])
            else shouldRunEditor = true
        } catch {
            shouldRunEditor = true
        }

        try {
            if (shouldRunEditor) await execFileAsync('editor', [filePath])
        } catch {
            console.log(
                `Failed to open file, please open ${styleText(
                    'gray',
                    filePath,
                )} manually.`,
            )
            process.exit(-1)
        }
    }
}
