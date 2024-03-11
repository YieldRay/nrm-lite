import { parseArgs } from 'node:util'
import process from 'node:process'
import pkg from './package.json' assert { type: 'json' }

// https://nodejs.org/api/util.html#utilparseargsconfig
const { values, positionals } = parseArgs({
    options: {
        help: {
            type: 'boolean',
            multiple: false,
            short: 'h',
            default: false,
        },
        lhs: {
            type: 'string',
            short: 'a',
            default: '0',
        },
        rhs: {
            type: 'string',
            short: 'b',
            default: '0',
        },
    },
    strict: true,
    allowPositionals: true,
})

if (positionals.length < 1 || values.help) {
    help()
}

const command = positionals[0]

switch (command) {
    case 'help':
        help()
        break
    case 'add':
        const { lhs, rhs } = values
        const sum = Number.parseFloat(lhs) + Number.parseFloat(rhs)
        console.log('%s + %s = %s', lhs, rhs, sum)
        break
    default:
        process.stderr.write(`Unknown command ${command}\n`)
        process.exit(1)
}

function help() {
    process.stdout.write(`\x1b[32m${pkg.name}\x1b[0m v${pkg.version}

  A nodejs template in pure javascript

  \x1b[1mUsage:\x1b[0m

  cli-name add --lhs [number] --rhs [number]    Get sum of lhs and rhs
  cli-name help                                 Show this help
`)
    process.exit(1)
}
