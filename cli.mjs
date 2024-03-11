#!/usr/bin/env node
import process from 'node:process'
import { parseArgs } from 'node:util'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { getRegistry, setRegistry, getConfigPath } from './config.mjs'
import { REGISTRIES } from './registry.mjs'
import c, { printRegistries } from './tty.mjs'

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

const command = positionals[0] || 'ls'
const { local } = values

switch (command) {
    case 'h':
    case 'help':
        help()
        break
    case 'ls':
        ls()
        break
    case 'rc':
        rc()
        break
    case 'use':
        const name = positionals[1]
        use(name)
        break
    default:
        console.error(`Unknown command ${command}\n`)
        process.exit(1)
}

function help() {
    // assert json will cause ExperimentalWarning. so we use this instead
    // import pkg from './package.json' assert { type: 'json' }
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const pkg = JSON.parse(readFileSync(`${__dirname}/package.json`, 'utf-8'))
    console.error(`${c.green(pkg.name)} v${pkg.version}

${c.bold('Usage:')}
    nrml ls            List registry
    nrml use ${c.gray('[name]')}    Use registry
    nrml rc            Open .npmrc file
    nrml help          Show this help
${c.bold('Global Options:')}
    --local            Use local .npmrc file, rather than the global one (default: false)`)
    process.exit(1)
}

async function ls() {
    const currentRegistry = await getRegistry(local)
    printRegistries(currentRegistry)
}

/**
 * @param {string} name
 */
async function use(name) {
    if (!name) {
        console.error(`Please provide a name!`)
        process.exit(-1)
    }

    const names = Object.keys(REGISTRIES)
    if (!names.includes(name)) {
        console.error(`'${name}' is not in ${c.gray(`[${names.join('|')}]`)}`)
        process.exit(-1)
    }

    const registryUrl = REGISTRIES[name]
    await setRegistry(local, registryUrl)
    printRegistries(registryUrl)
}

async function rc() {
    const filePath = await getConfigPath(local)
    try {
        execSync(`code ${filePath}`)
    } catch {
        console.error(
            `You do not have vscode installed!\nPlease open ${c.gray(
                filePath
            )} manually.`
        )
        process.exit(-1)
    }
}
