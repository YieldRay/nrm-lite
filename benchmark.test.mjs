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

// if there are args, we run time <args>
if (process.argv.length > 2) {
    console.log(await time(...process.argv.slice(2)))
    process.exit(0)
}
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const script = join(__dirname, 'cli.mjs')

try {
    console.log('Deno')
    console.log(await time('deno', 'run', '-A', script))

    console.log('Node')
    console.log(await time('node', script))

    console.log('Bun')
    console.log(await time('bun', script))
} catch (e) {
    console.error('Error running benchmark:', e)
}

// TODO: running this benchmark may show that Node is faster than Deno,
// but when directly running the CLI, Deno is faster than Node (which is the real case).
// So we should question whether Deno has a better cold start time, or if there are other reasons.
