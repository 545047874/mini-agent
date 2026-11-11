// src/cli.ts
import { parseArgs } from 'node:util'
import { writeFile, mkdir } from 'node:fs/promises'
import { Message } from './types/local.js'
import { chat } from './llm.ts'

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: {
    system: { type: 'string' },
    model: { type: 'string' },
    temp: { type: 'string' },
  },
})

const prompt = positionals.join(' ').trim()
if (!prompt) {
  console.error('用法: tsx src/cli.ts [--system "…"] [--temp 0.7] "你的问题"')
  process.exit(1)
}

console.log(values, positionals)

const content: Message[] = []

if (values.system) {
    content.push({ role: 'system', content: values.system })
}
content.push({ role: 'user', content: prompt })
const r = await chat(content, values)

await writeFile(`out/cli.json`, JSON.stringify(r))
