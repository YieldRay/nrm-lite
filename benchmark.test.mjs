import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { _execFileAsync } from './utils.mjs'

/** @param {string[]} args */
async function time(...args) {
    const { stderr } = await _execFileAsync('time', args)
    const lines = stderr.split('\n').filter((line) => line.trim())
    const data = Object.fromEntries(
        lines.map((line) => {
            const [type, spent] = line.split('\t')
            return [type, spent]
        }),
    )
    return { ...data, spent: await spent(...args) }
}

/** @param {string[]} args */
async function spent(...args) {
    const [file, ...args2] = args
    const start = performance.now()
    await _execFileAsync(file, args2)
    const end = performance.now()
    return end - start
}

// if have args, we run time <args>
if (process.argv.length > 2) {
    console.log(await time(...process.argv.slice(2)))
    process.exit(0)
}
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const script = join(__dirname, 'cli.mjs')

console.log('Deno')
console.log(await time('deno', 'run', '-A', script))

console.log('Node')
console.log(await time('node', script))

// TODO: running this benchmark shows that Node is faster than Deno,
// but when directly running the cli, Deno is faster than Node. (which is the real case)
// so we should question if deno have a better cold start time, or by other reasons?
